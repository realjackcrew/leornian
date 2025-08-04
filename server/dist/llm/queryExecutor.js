"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQueryFromJson = executeQueryFromJson;
exports.executeQueryFromIntent = executeQueryFromIntent;
exports.formatQueryResults = formatQueryResults;
const jsonIntentParser_1 = require("./jsonIntentParser");
const queryBuilder_1 = require("./queryBuilder");
async function executeQueryFromJson(jsonResponse, userId, options = {}) {
    try {
        const parsed = (0, jsonIntentParser_1.parseJsonIntent)(jsonResponse);
        const validation = await (0, jsonIntentParser_1.validateQueryIntent)(parsed, userId);
        if (!validation.isValid) {
            return {
                success: false,
                error: `Query validation failed: ${validation.errors.join(', ')}`,
                intent: parsed
            };
        }
        const result = await (0, queryBuilder_1.executeQueryIntent)(parsed, userId, options);
        return {
            success: true,
            data: result.data,
            totalCount: result.totalCount,
            aggregations: result.aggregations,
            warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
            intent: parsed,
            executedQuery: result.executedQuery,
            queryParams: result.queryParams
        };
    }
    catch (error) {
        console.error('Error executing query from JSON:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
async function executeQueryFromIntent(intent, userId, options = {}) {
    try {
        const validation = await (0, jsonIntentParser_1.validateQueryIntent)(intent, userId);
        if (!validation.isValid) {
            return {
                success: false,
                error: `Query validation failed: ${validation.errors.join(', ')}`,
                intent
            };
        }
        const result = await (0, queryBuilder_1.executeQueryIntent)(intent, userId, options);
        return {
            success: true,
            data: result.data,
            totalCount: result.totalCount,
            aggregations: result.aggregations,
            warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
            intent,
            executedQuery: result.executedQuery,
            queryParams: result.queryParams
        };
    }
    catch (error) {
        console.error('Error executing query from intent:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            intent
        };
    }
}
function formatQueryResults(result) {
    if (!result.success) {
        return `Query failed: ${result.error}`;
    }
    if (!result.data || result.data.length === 0) {
        return 'No data found for your query.';
    }
    let output = '';
    if (result.warnings && result.warnings.length > 0) {
        output += `⚠️ Warnings:\n${result.warnings.map(w => `- ${w}`).join('\n')}\n\n`;
    }
    if (result.aggregations && Object.keys(result.aggregations).length > 0) {
        output += 'Aggregation Results:\n';
        Object.entries(result.aggregations).forEach(([key, value]) => {
            output += `- ${key}: ${value}\n`;
        });
        output += '\n';
    }
    output += `Found ${result.data.length} records`;
    if (result.totalCount && result.totalCount !== result.data.length) {
        output += ` (showing ${result.data.length} of ${result.totalCount} total)`;
    }
    output += '.\n\n';
    if (result.data.length <= 10) {
        output += 'Data:\n';
        result.data.forEach((record, index) => {
            output += `${index + 1}. `;
            if (record.date) {
                output += `${record.date}: `;
            }
            const fields = Object.keys(record).filter(key => !['id', 'userId', 'createdAt', 'updatedAt', 'date'].includes(key));
            fields.forEach((field, fieldIndex) => {
                if (fieldIndex > 0)
                    output += ', ';
                const value = record[field];
                if (typeof value === 'object' && value !== null) {
                    const subFields = Object.keys(value).slice(0, 3);
                    output += `${field}: {${subFields.join(', ')}}`;
                }
                else {
                    output += `${field}: ${value}`;
                }
            });
            output += '\n';
        });
    }
    return output.trim();
}
