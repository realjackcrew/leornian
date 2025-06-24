import prisma from './database';

const DANGEROUS_SQL_KEYWORDS = [
  'insert', 'update', 'delete', 'drop', 'create', 'alter',
  'truncate', 'grant', 'revoke', 'commit', 'rollback',
  'savepoint', 'begin', 'end'
];

function validateReadOnlyQuery(sqlQuery: string) {
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
export async function execute_sql_query(sqlQuery: string): Promise<any> {
  validateReadOnlyQuery(sqlQuery);

  try {
    return await prisma.$queryRawUnsafe(sqlQuery);
  } catch (error) {
    throw new Error(`SQL query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

//executes query with params
export async function execute_sql_query_with_params(sqlQuery: string, params: any[]): Promise<any> {
  validateReadOnlyQuery(sqlQuery);

  try {
    return await prisma.$queryRawUnsafe(sqlQuery, ...params);
  } catch (error) {
    throw new Error(`SQL query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}