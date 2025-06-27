import { execute_sql_query } from './queries';

export function bigIntToString(key: string, value: any) {
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
    const result = await execute_sql_query(sql);
    // Print as JSON for easy copy-paste
    console.log(JSON.stringify(result, bigIntToString, 2));
  } catch (err) {
    console.error('Error executing query:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main(); 