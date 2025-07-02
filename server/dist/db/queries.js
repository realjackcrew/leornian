"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute_sql_query = execute_sql_query;
exports.execute_sql_query_with_params = execute_sql_query_with_params;
const database_1 = __importDefault(require("./database"));
const DANGEROUS_SQL_KEYWORDS = [
    'insert', 'update', 'delete', 'drop', 'create', 'alter',
    'truncate', 'grant', 'revoke', 'commit', 'rollback',
    'savepoint', 'begin', 'end'
];
function validateReadOnlyQuery(sqlQuery) {
    const trimmed = sqlQuery.trim();
    const normalized = trimmed.toLowerCase();
    //only allow SELECT queries
    if (!normalized.startsWith('select')) {
        throw new Error('Query rejected: Only SELECT queries are allowed.');
    }
    //disallow multiple SQL statements
    const semicolonIndex = trimmed.indexOf(';');
    if (semicolonIndex !== -1 && semicolonIndex !== trimmed.length - 1) {
        throw new Error('Query rejected: Multiple SQL statements are not allowed.');
    }
    //check for dangerous keywords
    for (const keyword of DANGEROUS_SQL_KEYWORDS) {
        const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
        if (pattern.test(normalized)) {
            throw new Error(`Query rejected: Contains dangerous keyword '${keyword}'.`);
        }
    }
}
//executes a raw SELECT SQL query
async function execute_sql_query(sqlQuery) {
    validateReadOnlyQuery(sqlQuery);
    try {
        return await database_1.default.$queryRawUnsafe(sqlQuery);
    }
    catch (error) {
        throw new Error(`SQL query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//executes query with params
async function execute_sql_query_with_params(sqlQuery, params) {
    validateReadOnlyQuery(sqlQuery);
    try {
        return await database_1.default.$queryRawUnsafe(sqlQuery, ...params);
    }
    catch (error) {
        throw new Error(`SQL query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
