"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
exports.executeQueryIntent = executeQueryIntent;
const datapointPaths_1 = require("./datapointPaths");
const database_1 = __importDefault(require("../db/database"));
class QueryBuilder {
    constructor(options) {
        this.userId = options.userId;
        this.includeCount = options.includeCount || false;
    }
    async executeQuery(intent) {
        if (!intent.isSatisfiable) {
            return {
                data: [],
                totalCount: 0
            };
        }
        return this.executeRawSQLQuery(intent);
    }
    async executeRawSQLQuery(intent) {
        const sql = this.buildSQL(intent);
        const params = this.buildSQLParams(intent);
        const validation = this.validateSQL(sql, params);
        if (!validation.isValid) {
            throw new Error(`SQL validation failed: ${validation.error}`);
        }
        try {
            console.log('Executing SQL:', sql);
            console.log('With params:', params);
            const result = await database_1.default.$queryRawUnsafe(sql, ...params);
            const data = Array.isArray(result) ? result : [result];
            let totalCount;
            if (this.includeCount && !this.hasAggregations(intent)) {
                const countSQL = this.buildCountSQL(intent);
                const countResult = await database_1.default.$queryRawUnsafe(countSQL, ...params.slice(0, -2));
                totalCount = Array.isArray(countResult) && countResult.length > 0 ? Number(countResult[0].count) : 0;
            }
            const transformedData = this.hasAggregations(intent)
                ? this.convertBigIntInData(data)
                : this.transformResults(data, intent);
            return {
                data: transformedData,
                totalCount,
                aggregations: this.hasAggregations(intent) ? this.extractAggregations(result, intent) : undefined,
                executedQuery: sql,
                queryParams: params
            };
        }
        catch (error) {
            console.error('Error executing raw SQL query:', error);
            console.error('SQL:', sql);
            console.error('Params:', params);
            throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    buildSQL(intent) {
        if (this.hasAggregations(intent)) {
            return this.buildAggregationSQL(intent);
        }
        else {
            return this.buildRegularSQL(intent);
        }
    }
    buildRegularSQL(intent) {
        const selectClauses = [
            '"id"',
            '"date"',
            '"userId"',
            '"createdAt"',
            '"updatedAt"',
            '"healthData"'
        ];
        intent.selectedFields.forEach(field => {
            const fieldPath = intent.fieldPaths[field];
            if (fieldPath) {
                selectClauses.push(`${fieldPath} as "${field}"`);
            }
        });
        let sql = `SELECT ${selectClauses.join(', ')} FROM "DailyLog"`;
        sql += this.buildWhereClause(intent);
        sql += this.buildOrderByClause(intent);
        sql += this.buildPaginationClause(intent);
        return sql;
    }
    buildCountSQL(intent) {
        let sql = `SELECT COUNT(*) as count FROM "DailyLog"`;
        sql += this.buildWhereClause(intent);
        return sql;
    }
    buildWhereClause(intent) {
        const whereConditions = [];
        let paramIndex = 1;
        whereConditions.push(`"userId" = $${paramIndex++}`);
        whereConditions.push(`"date" >= $${paramIndex++}`);
        whereConditions.push(`"date" <= $${paramIndex++}`);
        if (intent.filters.length > 0) {
            const filterConditions = intent.filters.map(filter => {
                const condition = this.buildSQLFilterCondition(filter.fieldPath, filter.operator, filter.value, paramIndex);
                paramIndex++;
                return condition;
            });
            const filterJoin = intent.filtersMode === 'OR' ? ' OR ' : ' AND ';
            whereConditions.push(`(${filterConditions.join(filterJoin)})`);
        }
        return ` WHERE ${whereConditions.join(' AND ')}`;
    }
    buildOrderByClause(intent) {
        if (intent.sorting.length === 0) {
            return ` ORDER BY "date" DESC`;
        }
        const orderClauses = intent.sorting.map(sort => {
            if (sort.field === 'date') {
                return `"date" ${sort.order.toUpperCase()}`;
            }
            const fieldPath = intent.fieldPaths[sort.field];
            if (fieldPath) {
                return `${fieldPath} ${sort.order.toUpperCase()}`;
            }
            return `"date" ${sort.order.toUpperCase()}`;
        });
        return ` ORDER BY ${orderClauses.join(', ')}`;
    }
    buildPaginationClause(intent) {
        let clause = '';
        let paramIndex = 3 + intent.filters.length;
        if (intent.pagination.limit > 0) {
            clause += ` LIMIT $${paramIndex++}`;
        }
        if (intent.pagination.offset > 0) {
            clause += ` OFFSET $${paramIndex++}`;
        }
        return clause;
    }
    transformResults(data, intent) {
        return data.map(record => {
            const transformed = {
                id: this.convertBigInt(record.id),
                date: record.date,
                userId: record.userId,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
            intent.selectedFields.forEach(fieldName => {
                transformed[fieldName] = this.extractFieldValue(record.healthData, fieldName, intent.fieldPaths[fieldName]);
            });
            intent.selectedCategories.forEach(categoryName => {
                const categoryFields = (0, datapointPaths_1.getCategoryFields)(categoryName);
                const categoryData = {};
                categoryFields.forEach(fieldName => {
                    categoryData[fieldName] = this.extractFieldValue(record.healthData, fieldName, intent.fieldPaths[fieldName]);
                });
                transformed[categoryName] = categoryData;
            });
            Object.keys(record).forEach(key => {
                if (key in transformed) {
                    transformed[key] = this.convertBigInt(record[key]);
                }
            });
            return transformed;
        });
    }
    extractFieldValue(healthData, fieldName, fieldPath) {
        if (!healthData || !fieldPath)
            return null;
        try {
            const pathParts = this.parseJSONPath(fieldPath);
            let current = healthData;
            for (const part of pathParts) {
                if (current && typeof current === 'object' && part in current) {
                    current = current[part];
                }
                else {
                    return null;
                }
            }
            return current;
        }
        catch (error) {
            console.error(`Error extracting field ${fieldName}:`, error);
            return null;
        }
    }
    parseJSONPath(jsonPath) {
        return jsonPath
            .replace(/^healthData->/, '')
            .replace(/'/g, '')
            .replace(/->/g, '.')
            .replace(/>>/, '.')
            .split('.')
            .filter(part => part.length > 0);
    }
    hasAggregations(intent) {
        const agg = intent.aggregations;
        return agg.averages.length > 0 ||
            agg.sums.length > 0 ||
            agg.counts.length > 0 ||
            agg.lists.length > 0 ||
            agg.groupBy.length > 0;
    }
    buildAggregationSQL(intent) {
        const selectClauses = [];
        const groupByClauses = [];
        intent.aggregations.groupBy.forEach(field => {
            if (field === 'date') {
                selectClauses.push('"date"');
                groupByClauses.push('"date"');
            }
            else if (field === 'weekday') {
                selectClauses.push('EXTRACT(DOW FROM "date"::date) as weekday');
                groupByClauses.push('EXTRACT(DOW FROM "date"::date)');
            }
            else if (field === 'isoWeek') {
                selectClauses.push('EXTRACT(WEEK FROM "date"::date) as "isoWeek"');
                groupByClauses.push('EXTRACT(WEEK FROM "date"::date)');
            }
            else if (field === 'month') {
                selectClauses.push('EXTRACT(MONTH FROM "date"::date) as month');
                groupByClauses.push('EXTRACT(MONTH FROM "date"::date)');
            }
            else if (field === 'year') {
                selectClauses.push('EXTRACT(YEAR FROM "date"::date) as year');
                groupByClauses.push('EXTRACT(YEAR FROM "date"::date)');
            }
            else {
                const fieldPath = intent.fieldPaths[field];
                if (fieldPath) {
                    selectClauses.push(`${fieldPath} as "${field}"`);
                    groupByClauses.push(fieldPath);
                }
            }
        });
        intent.aggregations.averages.forEach(field => {
            const fieldPath = intent.fieldPaths[field];
            if (fieldPath) {
                selectClauses.push(`AVG(CAST(${fieldPath} AS NUMERIC)) as "avg_${field}"`);
            }
        });
        intent.aggregations.sums.forEach(field => {
            const fieldPath = intent.fieldPaths[field];
            if (fieldPath) {
                selectClauses.push(`SUM(CAST(${fieldPath} AS NUMERIC)) as "sum_${field}"`);
            }
        });
        let countFilterParamIndex = 4;
        intent.aggregations.counts.forEach(count => {
            const fieldPath = intent.fieldPaths[count.field];
            if (fieldPath) {
                if (count.filter) {
                    const filterCondition = this.buildSQLFilterCondition(fieldPath, count.filter.operator, count.filter.value, countFilterParamIndex);
                    selectClauses.push(`COUNT(CASE WHEN ${filterCondition} THEN 1 END) as "${count.alias}"`);
                    countFilterParamIndex++;
                }
                else {
                    selectClauses.push(`COUNT(${fieldPath}) as "${count.alias}"`);
                }
            }
        });
        intent.aggregations.lists.forEach(field => {
            const fieldPath = intent.fieldPaths[field];
            if (fieldPath) {
                selectClauses.push(`ARRAY_AGG(${fieldPath}) as "list_${field}"`);
            }
        });
        let sql = `SELECT ${selectClauses.join(', ')} FROM "DailyLog"`;
        sql += this.buildWhereClause(intent);
        if (groupByClauses.length > 0) {
            sql += ` GROUP BY ${groupByClauses.join(', ')}`;
        }
        if (intent.sorting.length > 0) {
            const orderClauses = intent.sorting.map(sort => {
                if (sort.field === 'date') {
                    return `"date" ${sort.order.toUpperCase()}`;
                }
                return `"${sort.field}" ${sort.order.toUpperCase()}`;
            });
            sql += ` ORDER BY ${orderClauses.join(', ')}`;
        }
        return sql;
    }
    buildSQLParams(intent) {
        const params = [];
        params.push(this.userId);
        params.push(intent.timeRange.startDate);
        params.push(intent.timeRange.endDate);
        if (this.hasAggregations(intent)) {
            intent.aggregations.counts.forEach(count => {
                if (count.filter && this.needsParameter(count.filter.value)) {
                    params.push(count.filter.value);
                }
            });
        }
        intent.filters.forEach(filter => {
            if (this.needsParameter(filter.value)) {
                params.push(filter.value);
            }
        });
        if (!this.hasAggregations(intent)) {
            if (intent.pagination.limit > 0) {
                params.push(intent.pagination.limit);
            }
            if (intent.pagination.offset > 0) {
                params.push(intent.pagination.offset);
            }
        }
        return params;
    }
    needsParameter(value) {
        if (typeof value === 'string' && value !== null && value !== undefined) {
            const commonFieldNames = [
                'bedtime', 'wakeTime', 'timeOfFirstMeal', 'timeOfLastMeal',
                'waterIntakePints', 'caloriesConsumed', 'proteinGrams', 'carbGrams',
                'stepsTakenThousands', 'caloriesBurned', 'restingHR', 'heartRateVariability',
                'whoopStrainScore', 'whoopRecoveryScorePercent', 'totalScreenTimeHours',
                'consumedFruits', 'consumedDairy', 'consumedAlcohol', 'consumedCaffeine'
            ];
            if (commonFieldNames.includes(value)) {
                return false;
            }
            return true;
        }
        return false;
    }
    buildSQLFilterCondition(fieldPath, operator, value, paramIndex) {
        if (typeof value === 'boolean') {
            const boolString = value.toString();
            return `${fieldPath} ${this.convertOperatorToSQL(operator)} '${boolString}'`;
        }
        if (value === null || value === undefined) {
            return operator === '==' || operator === '='
                ? `${fieldPath} IS NULL`
                : `${fieldPath} IS NOT NULL`;
        }
        if (typeof value === 'number') {
            return `${fieldPath} ${this.convertOperatorToSQL(operator)} '${value.toString()}'`;
        }
        if (value instanceof Date) {
            return `${fieldPath} ${this.convertOperatorToSQL(operator)} '${value.toISOString()}'`;
        }
        if (typeof value === 'string') {
            const fieldName = this.extractFieldNameFromPath(fieldPath);
            if (value === fieldName) {
                return '1 = 0';
            }
            return `${fieldPath} ${this.convertOperatorToSQL(operator)} $${paramIndex}`;
        }
        return `${fieldPath} ${this.convertOperatorToSQL(operator)} '${String(value)}'`;
    }
    extractFieldNameFromPath(fieldPath) {
        const match = fieldPath.match(/->>'([^']+)'$/);
        return match ? match[1] : '';
    }
    validateSQL(sql, params) {
        try {
            const dangerousPatterns = [
                /;.*DROP/i,
                /;.*DELETE/i,
                /;.*UPDATE/i,
                /;.*INSERT/i,
                /;.*ALTER/i,
                /;.*CREATE/i,
                /;.*TRUNCATE/i
            ];
            for (const pattern of dangerousPatterns) {
                if (pattern.test(sql)) {
                    console.error('SQL validation failed: dangerous pattern detected', { sql, pattern: pattern.toString() });
                    return { isValid: false, error: 'Potentially dangerous SQL detected' };
                }
            }
            const uniqueParams = new Set(sql.match(/\$\d+/g) || []).size;
            if (uniqueParams !== params.length) {
                console.error('SQL validation failed: parameter mismatch', {
                    sql,
                    expectedParams: uniqueParams,
                    actualParams: params.length,
                    params
                });
                return {
                    isValid: false,
                    error: `Parameter count mismatch: expected ${uniqueParams} parameters, got ${params.length}`
                };
            }
            if (!sql.trim().toUpperCase().startsWith('SELECT')) {
                console.error('SQL validation failed: not a SELECT query', { sql });
                return { isValid: false, error: 'Only SELECT queries are allowed' };
            }
            const openParens = (sql.match(/\(/g) || []).length;
            const closeParens = (sql.match(/\)/g) || []).length;
            if (openParens !== closeParens) {
                console.error('SQL validation failed: unbalanced parentheses', { sql, openParens, closeParens });
                return { isValid: false, error: 'Unbalanced parentheses in SQL query' };
            }
            for (let i = 0; i < params.length; i++) {
                const param = params[i];
                if (param === undefined) {
                    console.error('SQL validation failed: undefined parameter', { sql, params, paramIndex: i });
                    return { isValid: false, error: `Parameter ${i + 1} is undefined` };
                }
            }
            console.log('SQL validation passed', { sql, paramCount: params.length });
            return { isValid: true };
        }
        catch (error) {
            console.error('SQL validation error:', error, { sql, params });
            return { isValid: false, error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
    }
    convertOperatorToSQL(operator) {
        switch (operator) {
            case '==': return '=';
            case '!=': return '!=';
            case '>': return '>';
            case '<': return '<';
            case '>=': return '>=';
            case '<=': return '<=';
            default: return '=';
        }
    }
    extractAggregations(result, intent) {
        const aggregations = {};
        if (Array.isArray(result) && result.length > 0) {
            const firstRow = result[0];
            intent.aggregations.averages.forEach(field => {
                const key = `avg_${field}`;
                if (key in firstRow) {
                    aggregations[key] = this.convertBigInt(firstRow[key]);
                }
            });
            intent.aggregations.sums.forEach(field => {
                const key = `sum_${field}`;
                if (key in firstRow) {
                    aggregations[key] = this.convertBigInt(firstRow[key]);
                }
            });
            intent.aggregations.counts.forEach(count => {
                if (count.alias in firstRow) {
                    aggregations[count.alias] = this.convertBigInt(firstRow[count.alias]);
                }
            });
            intent.aggregations.lists.forEach(field => {
                const key = `list_${field}`;
                if (key in firstRow) {
                    aggregations[key] = firstRow[key];
                }
            });
        }
        return aggregations;
    }
    convertBigInt(value) {
        if (typeof value === 'bigint') {
            return Number(value);
        }
        return value;
    }
    convertBigIntInData(data) {
        return data.map(record => {
            const converted = {};
            Object.keys(record).forEach(key => {
                converted[key] = this.convertBigInt(record[key]);
            });
            return converted;
        });
    }
}
exports.QueryBuilder = QueryBuilder;
async function executeQueryIntent(intent, userId, options = {}) {
    const builder = new QueryBuilder({
        userId,
        includeCount: options.includeCount
    });
    return builder.executeQuery(intent);
}
