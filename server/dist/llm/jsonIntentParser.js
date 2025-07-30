"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonIntent = parseJsonIntent;
exports.validateQueryIntent = validateQueryIntent;
const datapointPaths_1 = require("./datapointPaths");
const database_1 = __importDefault(require("../db/database"));
function parseJsonIntent(response) {
    try {
        // Try to extract JSON from the response
        let jsonString = response.trim();
        // If the response contains markdown code blocks, extract the JSON from them
        const codeBlockMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
            jsonString = codeBlockMatch[1];
        }
        // Parse the JSON
        const queryIntent = JSON.parse(jsonString);
        // Extract field paths for all selected fields
        const fieldPaths = {};
        const selectedFields = [];
        const selectedCategories = [];
        queryIntent.fields.forEach(field => {
            if (field.isCategory) {
                selectedCategories.push(field.name);
                fieldPaths[field.name] = (0, datapointPaths_1.getFieldPath)(field.name);
                // Also add all individual fields in the category
                const categoryFields = (0, datapointPaths_1.getCategoryFields)(field.name);
                categoryFields.forEach(catField => {
                    fieldPaths[catField] = (0, datapointPaths_1.getFieldPath)(catField);
                });
            }
            else {
                selectedFields.push(field.name);
                fieldPaths[field.name] = (0, datapointPaths_1.getFieldPath)(field.name);
            }
        });
        // Extract and structure the information
        const parsed = {
            isSatisfiable: queryIntent.satisfiable,
            reason: queryIntent.reason,
            timeRange: queryIntent.timeRange,
            selectedFields,
            selectedCategories,
            fieldPaths,
            filters: queryIntent.filters?.map(filter => ({
                fieldName: filter.name,
                operator: filter.filter.op,
                value: filter.filter.value,
                fieldPath: (0, datapointPaths_1.getFieldPath)(filter.name)
            })) || [],
            filtersMode: queryIntent.filtersMode || "AND",
            aggregations: {
                averages: queryIntent.aggregations?.average || [],
                sums: queryIntent.aggregations?.sum || [],
                counts: queryIntent.aggregations?.count?.map(count => ({
                    alias: count.alias,
                    field: count.field,
                    fieldPath: (0, datapointPaths_1.getFieldPath)(count.field),
                    filter: count.filter ? {
                        operator: count.filter.op,
                        value: count.filter.value
                    } : undefined
                })) || [],
                lists: queryIntent.aggregations?.list || [],
                groupBy: queryIntent.aggregations?.groupBy || []
            },
            sorting: queryIntent.sort || [],
            pagination: {
                offset: queryIntent.pagination?.offset || 0,
                limit: queryIntent.pagination?.limit || 0
            }
        };
        return parsed;
    }
    catch (error) {
        console.error('Failed to parse JSON intent:', error);
        throw new Error(`Failed to parse JSON intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Helper function to check if a value is a valid filter value type
function isValidFilterValue(value) {
    // Boolean values
    if (typeof value === 'boolean')
        return true;
    // Numeric values
    if (typeof value === 'number' && !isNaN(value))
        return true;
    // Date strings (YYYY-MM-DD)
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))
        return true;
    // Time strings (HH:MM)
    if (typeof value === 'string' && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value))
        return true;
    // String values (but not empty)
    if (typeof value === 'string' && value.trim().length > 0)
        return true;
    return false;
}
// Helper function to get all field names that are available for use
function getAllAvailableFields(parsed) {
    const availableFields = new Set();
    // Add selected fields
    parsed.selectedFields.forEach(field => availableFields.add(field));
    // Add fields from selected categories
    parsed.selectedCategories.forEach(category => {
        const categoryFields = (0, datapointPaths_1.getCategoryFields)(category);
        categoryFields.forEach(field => availableFields.add(field));
    });
    // Add special groupBy fields
    availableFields.add('date');
    availableFields.add('weekday');
    availableFields.add('isoWeek');
    availableFields.add('month');
    availableFields.add('year');
    availableFields.add('__all__');
    return availableFields;
}
async function validateQueryIntent(parsed, userId) {
    const errors = [];
    const warnings = [];
    // Check if satisfiable
    if (!parsed.isSatisfiable) {
        if (!parsed.reason) {
            errors.push('Query is not satisfiable but no reason provided');
        }
        return { isValid: true, errors: [], warnings: [] }; // Unsatisfiable queries are valid
    }
    // Get user's first log date and today's date
    const today = new Date().toISOString().split('T')[0];
    let firstLogDate = null;
    try {
        const firstLog = await database_1.default.dailyLog.findFirst({
            where: { userId },
            orderBy: { date: 'asc' },
            select: { date: true }
        });
        firstLogDate = firstLog?.date || today;
    }
    catch (error) {
        console.error('Error fetching first log date:', error);
        firstLogDate = today;
    }
    // Check and clip date range
    let { startDate, endDate } = parsed.timeRange;
    if (!startDate || !endDate) {
        errors.push('Time range is required');
        return { isValid: false, errors, warnings };
    }
    // Check date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        errors.push('Invalid date format. Expected YYYY-MM-DD');
        return { isValid: false, errors, warnings };
    }
    // Clip start date to first log date
    if (startDate < firstLogDate) {
        warnings.push(`Start date clipped from ${startDate} to ${firstLogDate} (user's first log)`);
        parsed.timeRange.startDate = firstLogDate;
        startDate = firstLogDate;
    }
    // Clip end date to today
    if (endDate > today) {
        warnings.push(`End date clipped from ${endDate} to ${today} (today)`);
        parsed.timeRange.endDate = today;
        endDate = today;
    }
    // Check if start date is before end date
    if (startDate > endDate) {
        errors.push('Start date must be before or equal to end date');
    }
    // Check that at least one field is valid
    const hasValidFields = parsed.selectedFields.some(field => (0, datapointPaths_1.isDatapoint)(field)) ||
        parsed.selectedCategories.some(category => (0, datapointPaths_1.isCategory)(category));
    if (!hasValidFields) {
        errors.push('At least one valid datapoint or category must be selected');
    }
    // Validate individual fields
    for (const field of parsed.selectedFields) {
        if (!(0, datapointPaths_1.isDatapoint)(field)) {
            errors.push(`Invalid datapoint: '${field}'`);
        }
    }
    for (const category of parsed.selectedCategories) {
        if (!(0, datapointPaths_1.isCategory)(category)) {
            errors.push(`Invalid category: '${category}'`);
        }
    }
    // Get all available fields for validation
    const availableFields = getAllAvailableFields(parsed);
    // Check aggregations
    if (parsed.aggregations.averages.length > 0 || parsed.aggregations.sums.length > 0 ||
        parsed.aggregations.counts.length > 0 || parsed.aggregations.lists.length > 0) {
        if (parsed.aggregations.groupBy.length === 0) {
            errors.push('Aggregations require a groupBy clause');
        }
    }
    // Validate aggregation fields are in available fields
    for (const field of parsed.aggregations.averages) {
        if (!availableFields.has(field)) {
            errors.push(`Aggregation average field '${field}' must be declared in the initial fields list`);
        }
    }
    for (const field of parsed.aggregations.sums) {
        if (!availableFields.has(field)) {
            errors.push(`Aggregation sum field '${field}' must be declared in the initial fields list`);
        }
    }
    for (const field of parsed.aggregations.lists) {
        if (!availableFields.has(field)) {
            errors.push(`Aggregation list field '${field}' must be declared in the initial fields list`);
        }
    }
    for (const count of parsed.aggregations.counts) {
        if (!availableFields.has(count.field)) {
            errors.push(`Aggregation count field '${count.field}' must be declared in the initial fields list`);
        }
    }
    // Check filters
    for (const filter of parsed.filters) {
        if (!filter.fieldName) {
            errors.push('Filter field name is required');
            continue;
        }
        if (!availableFields.has(filter.fieldName)) {
            errors.push(`Filter field '${filter.fieldName}' must be declared in the initial fields list`);
        }
        if (!['==', '!=', '>', '<', '>=', '<='].includes(filter.operator)) {
            errors.push(`Invalid filter operator: ${filter.operator}`);
        }
        if (!isValidFilterValue(filter.value)) {
            errors.push(`Invalid filter value for '${filter.fieldName}': must be boolean, numeric, date (YYYY-MM-DD), time (HH:MM), or non-empty string`);
        }
    }
    // Check sorting
    for (const sort of parsed.sorting) {
        if (!sort.field) {
            errors.push('Sort field is required');
            continue;
        }
        if (!availableFields.has(sort.field)) {
            errors.push(`Sort field '${sort.field}' must be declared in the initial fields list`);
        }
        if (!['asc', 'desc'].includes(sort.order)) {
            errors.push(`Invalid sort order: ${sort.order}`);
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
