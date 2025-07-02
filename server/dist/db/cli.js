"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigIntToString = bigIntToString;
const queries_1 = require("./queries");
function bigIntToString(key, value) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: ts-node src/db/cli.ts "SELECT * FROM \"User\""');
        process.exit(1);
    }
    const sql = args.join(' ');
    try {
        const result = await (0, queries_1.execute_sql_query)(sql);
        // Print as JSON for easy copy-paste
        console.log(JSON.stringify(result, bigIntToString, 2));
    }
    catch (err) {
        console.error('Error executing query:', err instanceof Error ? err.message : err);
        process.exit(1);
    }
}
main();
