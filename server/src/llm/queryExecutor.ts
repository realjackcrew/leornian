import { parseJsonIntent, validateQueryIntent, ParsedQueryIntent } from './jsonIntentParser';
import { executeQueryIntent } from './queryBuilder';
export interface QueryExecutionResult {
  success: boolean;
  data?: any[];
  totalCount?: number;
  aggregations?: Record<string, any>;
  error?: string;
  warnings?: string[];
  intent?: ParsedQueryIntent;
  executedQuery?: string;
  queryParams?: any[];
}
export async function executeQueryFromJson(
  jsonResponse: string,
  userId: string,
  options: { includeCount?: boolean } = {}
): Promise<QueryExecutionResult> {
  try {
    const parsed = parseJsonIntent(jsonResponse);
    const validation = await validateQueryIntent(parsed, userId);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Query validation failed: ${validation.errors.join(', ')}`,
        intent: parsed
      };
    }
    const result = await executeQueryIntent(parsed, userId, options);
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
  } catch (error) {
    console.error('Error executing query from JSON:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
export async function executeQueryFromIntent(
  intent: ParsedQueryIntent,
  userId: string,
  options: { includeCount?: boolean } = {}
): Promise<QueryExecutionResult> {
  try {
    const validation = await validateQueryIntent(intent, userId);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Query validation failed: ${validation.errors.join(', ')}`,
        intent
      };
    }
    const result = await executeQueryIntent(intent, userId, options);
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
  } catch (error) {
    console.error('Error executing query from intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      intent
    };
  }
}
export function formatQueryResults(result: QueryExecutionResult): string {
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
      const fields = Object.keys(record).filter(key => 
        !['id', 'userId', 'createdAt', 'updatedAt', 'date'].includes(key)
      );
      fields.forEach((field, fieldIndex) => {
        if (fieldIndex > 0) output += ', ';
        const value = record[field];
        if (typeof value === 'object' && value !== null) {
          const subFields = Object.keys(value).slice(0, 3);
          output += `${field}: {${subFields.join(', ')}}`;
        } else {
          output += `${field}: ${value}`;
        }
      });
      output += '\n';
    });
  }
  return output.trim();
} 