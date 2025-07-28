import { ParsedQueryIntent } from './jsonIntentParser';
import { getFieldPath, getCategoryFields, isCategory } from './datapointPaths';
import prisma from '../db/database';

export interface QueryResult {
  data: any[];
  totalCount?: number;
  aggregations?: Record<string, any>;
}

export interface QueryBuilderOptions {
  userId: string;
  includeCount?: boolean;
}

export class QueryBuilder {
  private userId: string;
  private includeCount: boolean;
  
  constructor(options: QueryBuilderOptions) {
    this.userId = options.userId;
    this.includeCount = options.includeCount || false;
  }

  /**
   * Builds and executes a raw SQL query from a ParsedQueryIntent
   */
  async executeQuery(intent: ParsedQueryIntent): Promise<QueryResult> {
    if (!intent.isSatisfiable) {
      return {
        data: [],
        totalCount: 0
      };
    }

    // All queries now use raw SQL for consistency and power
    return this.executeRawSQLQuery(intent);
  }

            /**
           * Executes any query using raw SQL - handles both regular and aggregation queries
           */
          private async executeRawSQLQuery(intent: ParsedQueryIntent): Promise<QueryResult> {
            const sql = this.buildSQL(intent);
            const params = this.buildSQLParams(intent);

            // Validate SQL before execution
            const validation = this.validateSQL(sql, params);
            if (!validation.isValid) {
              throw new Error(`SQL validation failed: ${validation.error}`);
            }

            try {
              console.log('Executing SQL:', sql);
              console.log('With params:', params);

              const result = await prisma.$queryRawUnsafe(sql, ...params);
              const data = Array.isArray(result) ? result : [result];
      
      // Get total count if requested (for non-aggregation queries)
      let totalCount: number | undefined;
      if (this.includeCount && !this.hasAggregations(intent)) {
        const countSQL = this.buildCountSQL(intent);
        const countResult = await prisma.$queryRawUnsafe(countSQL, ...params.slice(0, -2)); // Remove LIMIT/OFFSET params
        totalCount = Array.isArray(countResult) && countResult.length > 0 ? Number(countResult[0].count) : 0;
      }

                    // Transform the results to include computed fields (for non-aggregation queries)
              const transformedData = this.hasAggregations(intent)
                ? this.convertBigIntInData(data)
                : this.transformResults(data, intent);

      return {
        data: transformedData,
        totalCount,
        aggregations: this.hasAggregations(intent) ? this.extractAggregations(result, intent) : undefined
      };
    } catch (error) {
      console.error('Error executing raw SQL query:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Builds the complete SQL query for any type of query
   */
  private buildSQL(intent: ParsedQueryIntent): string {
    if (this.hasAggregations(intent)) {
      return this.buildAggregationSQL(intent);
    } else {
      return this.buildRegularSQL(intent);
    }
  }

  /**
   * Builds SQL for regular (non-aggregated) queries
   */
  private buildRegularSQL(intent: ParsedQueryIntent): string {
    const selectClauses = [
      '"id"',
      '"date"',
      '"userId"',
      '"createdAt"',
      '"updatedAt"',
      '"healthData"'
    ];

    // Add selected field extractions to SELECT clause for better performance
    intent.selectedFields.forEach(field => {
      const fieldPath = intent.fieldPaths[field];
      if (fieldPath) {
        selectClauses.push(`${fieldPath} as "${field}"`);
      }
    });

    let sql = `SELECT ${selectClauses.join(', ')} FROM "DailyLog"`;
    
    // Add WHERE clause
    sql += this.buildWhereClause(intent);

    // Add ORDER BY
    sql += this.buildOrderByClause(intent);

    // Add LIMIT/OFFSET
    sql += this.buildPaginationClause(intent);

    return sql;
  }

  /**
   * Builds a COUNT query for getting total record count
   */
  private buildCountSQL(intent: ParsedQueryIntent): string {
    let sql = `SELECT COUNT(*) as count FROM "DailyLog"`;
    sql += this.buildWhereClause(intent);
    return sql;
  }



  /**
   * Builds the WHERE clause for SQL queries
   */
  private buildWhereClause(intent: ParsedQueryIntent): string {
    const whereConditions: string[] = [];
    let paramIndex = 1;
    
    whereConditions.push(`"userId" = $${paramIndex++}`);
    whereConditions.push(`"date" >= $${paramIndex++}`);
    whereConditions.push(`"date" <= $${paramIndex++}`);

    // Add field filters
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

  /**
   * Builds the ORDER BY clause for SQL queries
   */
  private buildOrderByClause(intent: ParsedQueryIntent): string {
    if (intent.sorting.length === 0) {
      return ` ORDER BY "date" DESC`;
    }

    const orderClauses = intent.sorting.map(sort => {
      if (sort.field === 'date') {
        return `"date" ${sort.order.toUpperCase()}`;
      }
      // For JSON fields, sort by the extracted value
      const fieldPath = intent.fieldPaths[sort.field];
      if (fieldPath) {
        return `${fieldPath} ${sort.order.toUpperCase()}`;
      }
      return `"date" ${sort.order.toUpperCase()}`;
    });
    
    return ` ORDER BY ${orderClauses.join(', ')}`;
  }

  /**
   * Builds the LIMIT/OFFSET clause for SQL queries
   */
  private buildPaginationClause(intent: ParsedQueryIntent): string {
    let clause = '';
    let paramIndex = 3 + intent.filters.length; // Start after userId, startDate, endDate, and filters
    
    if (intent.pagination.limit > 0) {
      clause += ` LIMIT $${paramIndex++}`;
    }
    
    if (intent.pagination.offset > 0) {
      clause += ` OFFSET $${paramIndex++}`;
    }
    
    return clause;
  }

  /**
   * Transforms raw query results to extract JSON field values
   */
  private transformResults(data: any[], intent: ParsedQueryIntent): any[] {
    return data.map(record => {
      const transformed: any = {
        id: this.convertBigInt(record.id),
        date: record.date,
        userId: record.userId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };

      // Extract selected fields from healthData JSON
      intent.selectedFields.forEach(fieldName => {
        transformed[fieldName] = this.extractFieldValue(record.healthData, fieldName, intent.fieldPaths[fieldName]);
      });

      // Extract category fields
      intent.selectedCategories.forEach(categoryName => {
        const categoryFields = getCategoryFields(categoryName);
        const categoryData: any = {};
        
        categoryFields.forEach(fieldName => {
          categoryData[fieldName] = this.extractFieldValue(record.healthData, fieldName, intent.fieldPaths[fieldName]);
        });
        
        transformed[categoryName] = categoryData;
      });

      // Convert any BigInt values in the record
      Object.keys(record).forEach(key => {
        if (key in transformed) {
          transformed[key] = this.convertBigInt(record[key]);
        }
      });

      return transformed;
    });
  }

  /**
   * Extracts a field value from the healthData JSON using the field path
   */
  private extractFieldValue(healthData: any, fieldName: string, fieldPath: string): any {
    if (!healthData || !fieldPath) return null;

    try {
      // Parse the JSON path and navigate through the object
      const pathParts = this.parseJSONPath(fieldPath);
      let current = healthData;
      
      for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return null;
        }
      }
      
      return current;
    } catch (error) {
      console.error(`Error extracting field ${fieldName}:`, error);
      return null;
    }
  }

  /**
   * Parses a JSON path string into an array of keys
   */
  private parseJSONPath(jsonPath: string): string[] {
    // Convert "healthData->'values'->'sleep'->>'bedtime'" to ["values", "sleep", "bedtime"]
    return jsonPath
      .replace(/^healthData->/, '') // Remove the healthData prefix
      .replace(/'/g, '') // Remove quotes
      .replace(/->/g, '.') // Replace -> with .
      .replace(/>>/, '.') // Replace >> with .
      .split('.')
      .filter(part => part.length > 0);
  }



  /**
   * Checks if the intent has any aggregations
   */
  private hasAggregations(intent: ParsedQueryIntent): boolean {
    const agg = intent.aggregations;
    return agg.averages.length > 0 || 
           agg.sums.length > 0 || 
           agg.counts.length > 0 || 
           agg.lists.length > 0 || 
           agg.groupBy.length > 0;
  }

  /**
   * Builds SQL for aggregation queries
   */
  private buildAggregationSQL(intent: ParsedQueryIntent): string {
    const selectClauses: string[] = [];
    const groupByClauses: string[] = [];
    let paramIndex = 1;

    // Add groupBy fields first
    intent.aggregations.groupBy.forEach(field => {
      if (field === 'date') {
        selectClauses.push('"date"');
        groupByClauses.push('"date"');
      } else if (field === 'weekday') {
        selectClauses.push('EXTRACT(DOW FROM "date"::date) as weekday');
        groupByClauses.push('EXTRACT(DOW FROM "date"::date)');
      } else if (field === 'isoWeek') {
        selectClauses.push('EXTRACT(WEEK FROM "date"::date) as "isoWeek"');
        groupByClauses.push('EXTRACT(WEEK FROM "date"::date)');
      } else if (field === 'month') {
        selectClauses.push('EXTRACT(MONTH FROM "date"::date) as month');
        groupByClauses.push('EXTRACT(MONTH FROM "date"::date)');
      } else if (field === 'year') {
        selectClauses.push('EXTRACT(YEAR FROM "date"::date) as year');
        groupByClauses.push('EXTRACT(YEAR FROM "date"::date)');
      } else {
        const fieldPath = intent.fieldPaths[field];
        if (fieldPath) {
          selectClauses.push(`${fieldPath} as "${field}"`);
          groupByClauses.push(fieldPath);
        }
      }
    });

    // Add aggregation functions with bulletproof handling - only operate on valid numeric strings
    intent.aggregations.averages.forEach(field => {
      const fieldPath = intent.fieldPaths[field];
      if (fieldPath) {
        selectClauses.push(`AVG(${fieldPath}::numeric) as "avg_${field}"`);
      }
    });

    intent.aggregations.sums.forEach(field => {
      const fieldPath = intent.fieldPaths[field];
      if (fieldPath) {
        selectClauses.push(`SUM(${fieldPath}::numeric) as "sum_${field}"`);
      }
    });

    // Handle count aggregations with proper parameter indexing and safe counting
    let countFilterParamIndex = 4; // Start after userId, startDate, endDate
    intent.aggregations.counts.forEach(count => {
      const fieldPath = intent.fieldPaths[count.field];
      if (fieldPath) {
        if (count.filter) {
          const filterCondition = this.buildSQLFilterCondition(fieldPath, count.filter.operator, count.filter.value, countFilterParamIndex);
          selectClauses.push(`COUNT(CASE WHEN ${filterCondition} THEN 1 END) as "${count.alias}"`);
          countFilterParamIndex++;
        } else {
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

    // Build the complete SQL query
    let sql = `SELECT ${selectClauses.join(', ')} FROM "DailyLog"`;
    
    // Add WHERE clause (reuse the same method)
    sql += this.buildWhereClause(intent);

    // Add GROUP BY
    if (groupByClauses.length > 0) {
      sql += ` GROUP BY ${groupByClauses.join(', ')}`;
    }

    // Add ORDER BY for aggregation queries
    if (intent.sorting.length > 0) {
      const orderClauses = intent.sorting.map(sort => {
        if (sort.field === 'date') {
          return `"date" ${sort.order.toUpperCase()}`;
        }
        // For aggregation queries, we can sort by the aggregated fields directly
        return `"${sort.field}" ${sort.order.toUpperCase()}`;
      });
      sql += ` ORDER BY ${orderClauses.join(', ')}`;
    }

    // Note: Aggregation queries typically don't use LIMIT/OFFSET, but we could add them if needed

    return sql;
  }

            /**
           * Builds SQL parameters array in the correct order
           */
          private buildSQLParams(intent: ParsedQueryIntent): any[] {
            const params: any[] = [];
            
            // Always start with basic parameters
            params.push(this.userId);           // $1
            params.push(intent.timeRange.startDate); // $2
            params.push(intent.timeRange.endDate);   // $3

            // Count filter values (for aggregation queries only)
            if (this.hasAggregations(intent)) {
              intent.aggregations.counts.forEach(count => {
                if (count.filter && this.needsParameter(count.filter.value)) {
                  params.push(count.filter.value);
                }
              });
            }

            // Regular filter values - only add if they need parameters
            intent.filters.forEach(filter => {
              if (this.needsParameter(filter.value)) {
                params.push(filter.value);
              }
            });

            // Pagination parameters (only for non-aggregation queries)
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

          /**
           * Checks if a value needs a parameter (booleans, nulls, numbers, and dates don't)
           */
          private needsParameter(value: any): boolean {
            // Only strings need parameters, and only if they're not field names
            if (typeof value === 'string' && value !== null && value !== undefined) {
              // Don't use parameters for values that are likely field names
              const commonFieldNames = [
                'bedtime', 'wakeTime', 'timeOfFirstMeal', 'timeOfLastMeal',
                'waterIntakePints', 'caloriesConsumed', 'proteinGrams', 'carbGrams',
                'stepsTakenThousands', 'caloriesBurned', 'restingHR', 'heartRateVariability',
                'whoopStrainScore', 'whoopRecoveryScorePercent', 'totalScreenTimeHours',
                'consumedFruits', 'consumedDairy', 'consumedAlcohol', 'consumedCaffeine'
              ];
              
              if (commonFieldNames.includes(value)) {
                return false; // Don't use parameters for field names
              }
              
              return true; // Use parameters for legitimate string values
            }
            
            return false; // All other types don't need parameters
          }

            /**
           * Builds a SQL filter condition with bulletproof logic for all data types
           */
          private buildSQLFilterCondition(fieldPath: string, operator: string, value: any, paramIndex: number): string {
            // Handle boolean values - convert to string comparison
            if (typeof value === 'boolean') {
              const boolString = value.toString();
              return `${fieldPath} ${this.convertOperatorToSQL(operator)} '${boolString}'`;
            }
            
            // Handle null values - no parameters needed
            if (value === null || value === undefined) {
              return operator === '==' || operator === '=' 
                ? `${fieldPath} IS NULL`
                : `${fieldPath} IS NOT NULL`;
            }
            
            // Handle numeric values - convert to string, no parameters needed
            if (typeof value === 'number') {
              return `${fieldPath} ${this.convertOperatorToSQL(operator)} '${value.toString()}'`;
            }
            
            // Handle Date objects - convert to ISO string
            if (value instanceof Date) {
              return `${fieldPath} ${this.convertOperatorToSQL(operator)} '${value.toISOString()}'`;
            }
            
            // For strings, check if it's a field name that should be excluded
            if (typeof value === 'string') {
              // If the value is exactly the field name, this is likely invalid data
              const fieldName = this.extractFieldNameFromPath(fieldPath);
              if (value === fieldName) {
                // This comparison will always be false for valid data
                return '1 = 0';
              }
              
              // Use parameter for legitimate string values
              return `${fieldPath} ${this.convertOperatorToSQL(operator)} $${paramIndex}`;
            }
            
            // Fallback for any other data types - convert to string
            return `${fieldPath} ${this.convertOperatorToSQL(operator)} '${String(value)}'`;
          }

          /**
           * Extracts the field name from a JSON path
           */
          private extractFieldNameFromPath(fieldPath: string): string {
            // Extract field name from path like "healthData"->'values'->'nutrition'->>'waterIntakePints'
            const match = fieldPath.match(/->>'([^']+)'$/);
            return match ? match[1] : '';
          }

  



          /**
           * Validates SQL before execution to catch common issues
           */
          private validateSQL(sql: string, params: any[]): { isValid: boolean; error?: string } {
            try {
              // Check for basic SQL injection patterns
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

              // Check for proper parameter count
              const paramPlaceholders = (sql.match(/\$/g) || []).length;
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

              // Check for basic SQL structure
              if (!sql.trim().toUpperCase().startsWith('SELECT')) {
                console.error('SQL validation failed: not a SELECT query', { sql });
                return { isValid: false, error: 'Only SELECT queries are allowed' };
              }

              // Check for balanced parentheses
              const openParens = (sql.match(/\(/g) || []).length;
              const closeParens = (sql.match(/\)/g) || []).length;
              if (openParens !== closeParens) {
                console.error('SQL validation failed: unbalanced parentheses', { sql, openParens, closeParens });
                return { isValid: false, error: 'Unbalanced parentheses in SQL query' };
              }

              // Validate parameter values
              for (let i = 0; i < params.length; i++) {
                const param = params[i];
                if (param === undefined) {
                  console.error('SQL validation failed: undefined parameter', { sql, params, paramIndex: i });
                  return { isValid: false, error: `Parameter ${i + 1} is undefined` };
                }
              }

              console.log('SQL validation passed', { sql, paramCount: params.length });
              return { isValid: true };

            } catch (error) {
              console.error('SQL validation error:', error, { sql, params });
              return { isValid: false, error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` };
            }
          }

          /**
           * Converts filter operators to SQL operators
           */
          private convertOperatorToSQL(operator: string): string {
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

            /**
           * Extracts aggregation results from raw SQL results
           */
          private extractAggregations(result: any, intent: ParsedQueryIntent): Record<string, any> {
            const aggregations: Record<string, any> = {};

            if (Array.isArray(result) && result.length > 0) {
              const firstRow = result[0];

              // Extract averages
              intent.aggregations.averages.forEach(field => {
                const key = `avg_${field}`;
                if (key in firstRow) {
                  aggregations[key] = this.convertBigInt(firstRow[key]);
                }
              });

              // Extract sums
              intent.aggregations.sums.forEach(field => {
                const key = `sum_${field}`;
                if (key in firstRow) {
                  aggregations[key] = this.convertBigInt(firstRow[key]);
                }
              });

              // Extract counts
              intent.aggregations.counts.forEach(count => {
                if (count.alias in firstRow) {
                  aggregations[count.alias] = this.convertBigInt(firstRow[count.alias]);
                }
              });

              // Extract lists
              intent.aggregations.lists.forEach(field => {
                const key = `list_${field}`;
                if (key in firstRow) {
                  aggregations[key] = firstRow[key];
                }
              });
            }

            return aggregations;
          }

          /**
           * Converts BigInt values to regular numbers for JSON serialization
           */
          private convertBigInt(value: any): any {
            if (typeof value === 'bigint') {
              return Number(value);
            }
            return value;
          }

          /**
           * Converts BigInt values in an array of data objects
           */
          private convertBigIntInData(data: any[]): any[] {
            return data.map(record => {
              const converted: any = {};
              Object.keys(record).forEach(key => {
                converted[key] = this.convertBigInt(record[key]);
              });
              return converted;
            });
          }
}

/**
 * Convenience function to execute a query from a ParsedQueryIntent
 */
export async function executeQueryIntent(
  intent: ParsedQueryIntent, 
  userId: string, 
  options: { includeCount?: boolean } = {}
): Promise<QueryResult> {
  const builder = new QueryBuilder({ 
    userId, 
    includeCount: options.includeCount 
  });
  
  return builder.executeQuery(intent);
} 