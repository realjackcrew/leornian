"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQueryFromJson = executeQueryFromJson;
exports.executeQueryFromIntent = executeQueryFromIntent;
exports.formatQueryResults = formatQueryResults;
const jsonIntentParser_1 = require("./jsonIntentParser");
const queryBuilder_1 = require("./queryBuilder");
/**
 * Executes a query from raw JSON intent response
 */
async function executeQueryFromJson(jsonResponse, userId, options = {}) {
    try {
        // Parse the JSON intent
        const parsed = (0, jsonIntentParser_1.parseJsonIntent)(jsonResponse);
        // Validate the intent
        const validation = await (0, jsonIntentParser_1.validateQueryIntent)(parsed, userId);
        if (!validation.isValid) {
            return {
                success: false,
                error: `Query validation failed: ${validation.errors.join(', ')}`,
                intent: parsed
            };
        }
        // Execute the query
        const result = await (0, queryBuilder_1.executeQueryIntent)(parsed, userId, options);
        return {
            success: true,
            data: result.data,
            totalCount: result.totalCount,
            aggregations: result.aggregations,
            warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
            intent: parsed
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
/**
 * Executes a query from a pre-parsed and validated intent
 */
async function executeQueryFromIntent(intent, userId, options = {}) {
    try {
        // Validate the intent
        const validation = await (0, jsonIntentParser_1.validateQueryIntent)(intent, userId);
        if (!validation.isValid) {
            return {
                success: false,
                error: `Query validation failed: ${validation.errors.join(', ')}`,
                intent
            };
        }
        // Execute the query
        const result = await (0, queryBuilder_1.executeQueryIntent)(intent, userId, options);
        return {
            success: true,
            data: result.data,
            totalCount: result.totalCount,
            aggregations: result.aggregations,
            warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
            intent
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
/**
 * Helper function to format query results for user-friendly display
 */
function formatQueryResults(result) {
    if (!result.success) {
        return `Query failed: ${result.error}`;
    }
    if (!result.data || result.data.length === 0) {
        return 'No data found for your query.';
    }
    let output = '';
    // Add warnings if any
    if (result.warnings && result.warnings.length > 0) {
        output += `⚠️ Warnings:\n${result.warnings.map(w => `- ${w}`).join('\n')}\n\n`;
    }
    // Format data based on whether it's aggregated or not
    if (result.aggregations && Object.keys(result.aggregations).length > 0) {
        output += 'Aggregation Results:\n';
        Object.entries(result.aggregations).forEach(([key, value]) => {
            output += `- ${key}: ${value}\n`;
        });
        output += '\n';
    }
    // Show data count
    output += `Found ${result.data.length} records`;
    if (result.totalCount && result.totalCount !== result.data.length) {
        output += ` (showing ${result.data.length} of ${result.totalCount} total)`;
    }
    output += '.\n\n';
    // For small result sets, show the actual data
    if (result.data.length <= 10) {
        output += 'Data:\n';
        result.data.forEach((record, index) => {
            output += `${index + 1}. `;
            if (record.date) {
                output += `${record.date}: `;
            }
            // Show the relevant fields
            const fields = Object.keys(record).filter(key => !['id', 'userId', 'createdAt', 'updatedAt', 'date'].includes(key));
            fields.forEach((field, fieldIndex) => {
                if (fieldIndex > 0)
                    output += ', ';
                const value = record[field];
                if (typeof value === 'object' && value !== null) {
                    // For category objects, show a summary
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
