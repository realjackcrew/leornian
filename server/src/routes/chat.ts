import express from 'express';
import { chatCompletion, chatWithForcedFunctionCalling } from '../llm/openai';
import { buildJsonIntentPrompt } from '../llm/jsonIntentPromptBuilder';
import { parseJsonIntent, ParsedQueryIntent } from '../llm/jsonIntentParser';
import { executeQueryFromIntent, QueryExecutionResult, formatQueryResults } from '../llm/queryExecutor';
import { buildDynamicPrompt } from '../llm/promptBuilder';
import { execute_sql_query_with_params } from '../db/queries';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import database from '../db/database';
import { summarizeQueryResults, SummarizationRequest } from '../llm/summarizationService';

const router = express.Router();

router.post('/chat', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Chat request received:', req.body);
    const { message, useDirectSQL, conversationHistory, includeHistory } = req.body;
    
    if (!message || typeof message !== 'string') {
      console.log('Invalid message format');
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    const userId = req.userId!;
    console.log('Processing message for user:', userId, message, 'useDirectSQL:', useDirectSQL);

    if (useDirectSQL) {
      // Use Direct SQL System (prompt2)
      return await handleDirectSQLMode(req, res, message, userId, conversationHistory, includeHistory);
    } else {
      // Use JSON Intent System (current)
      return await handleJsonIntentMode(req, res, message, userId);
    }

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// Handle JSON Intent Mode (current system)
async function handleJsonIntentMode(_req: AuthenticatedRequest, res: express.Response, message: string, userId: string) {
    // Get user's chat settings
    const chatSettings = await getUserChatSettings(userId);
    
    // Build the JSON intent prompt with user's datapoints and today's date
    const systemPrompt = await buildJsonIntentPrompt({ userId });
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI for JSON intent generation...');
    const response = await chatCompletion(messages, chatSettings.model);
    console.log('OpenAI response:', response);

    // Parse the JSON intent from the response
    let parsedIntent: ParsedQueryIntent | null = null;
    let parseError: string | null = null;
    let queryResult: QueryExecutionResult | null = null;
    
    try {
      if (!response.content) {
        throw new Error('No content in response');
      }
      parsedIntent = parseJsonIntent(response.content);
      console.log('Parsed query intent:', parsedIntent);
      
      // Execute the query
      queryResult = await executeQueryFromIntent(parsedIntent, userId, { includeCount: true });
      console.log('Query execution result:', queryResult);
      
    } catch (error) {
      console.error('Failed to parse JSON intent:', error);
      parseError = `Failed to parse JSON intent: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Always use summarization for client-facing responses
    let clientResponse = '';
    let followUpQuestions: string[] = [];
    let debugInfo: any = {};
    
    if (queryResult && queryResult.success) {
      // If we have successful query results, use the summarization service
      try {
        const summarizationRequest: SummarizationRequest = {
          originalQuestion: message,
          queryResults: queryResult,
          userId: userId,
          settings: chatSettings
        };
        
        const summarizationResult = await summarizeQueryResults(summarizationRequest);
        
        if (summarizationResult.success) {
          clientResponse = summarizationResult.summary;
          followUpQuestions = summarizationResult.followUpQuestions || [];
        } else {
          console.error('Summarization failed:', summarizationResult.error);
          // Fall back to basic formatting if summarization fails
          clientResponse = formatQueryResults(queryResult);
        }
      } catch (error) {
        console.error('Error in summarization:', error);
        // Fall back to basic formatting if summarization fails
        clientResponse = formatQueryResults(queryResult);
      }
    } else if (queryResult && !queryResult.success) {
      // If query failed, use summarization with error data
      try {
        const summarizationRequest: SummarizationRequest = {
          originalQuestion: message,
          queryResults: { success: false, error: queryResult.error },
          userId: userId,
          settings: chatSettings
        };
        
        const summarizationResult = await summarizeQueryResults(summarizationRequest);
        
        if (summarizationResult.success) {
          clientResponse = summarizationResult.summary;
          followUpQuestions = summarizationResult.followUpQuestions || [];
        } else {
          clientResponse = `I couldn't execute your query: ${queryResult.error}`;
        }
      } catch (error) {
        clientResponse = `I couldn't execute your query: ${queryResult.error}`;
      }
    } else if (parseError) {
      // If parsing failed, use summarization with parse error
      try {
        const summarizationRequest: SummarizationRequest = {
          originalQuestion: message,
          queryResults: { success: false, error: parseError },
          userId: userId,
          settings: chatSettings
        };
        
        const summarizationResult = await summarizeQueryResults(summarizationRequest);
        
        if (summarizationResult.success) {
          clientResponse = summarizationResult.summary;
          followUpQuestions = summarizationResult.followUpQuestions || [];
        } else {
          clientResponse = `I couldn't understand your request: ${parseError}`;
        }
      } catch (error) {
        clientResponse = `I couldn't understand your request: ${parseError}`;
      }
    }

    // Check if debug mode is enabled
    const isDebugMode = process.env.DEBUG_MODE === 'true';
    
    if (isDebugMode) {
      debugInfo = {
        jsonIntent: parsedIntent,
        executedQuery: queryResult?.executedQuery || null,
        queryParams: queryResult?.queryParams || null,
        queryError: queryResult?.error || parseError || null,
        rawLlmResponse: response.content
      };
    }

    const responseData: any = {
      success: true,
      response: clientResponse,
      jsonIntent: true,
      followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined
    };

    console.log('Follow-up questions in response:', responseData.followUpQuestions);

    // Include debug information if debug mode is enabled
    if (isDebugMode) {
      responseData.debug = debugInfo;
    }

    console.log('Sending response:', responseData);
    return res.json(responseData);
}

// Helper function to get user's chat settings
async function getUserChatSettings(userId: string) {
  try {
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { settings: true }
    });

    if (!user) {
      return { voice: 'default', verbosity: 'balanced', model: 'gpt-4o-mini' };
    }

    const settings = user.settings as any || {};
    return {
      voice: settings.voice || 'default',
      verbosity: settings.verbosity || 'balanced',
      model: settings.model || 'gpt-4o-mini'
    };
  } catch (error) {
    console.error('Error getting user chat settings:', error);
    return { voice: 'default', verbosity: 'balanced', model: 'gpt-4o-mini' };
  }
}

// Handle Direct SQL Mode (prompt2 system)
async function handleDirectSQLMode(_req: AuthenticatedRequest, res: express.Response, message: string, userId: string, conversationHistory: any[], includeHistory: boolean) {
  // Get user's chat settings
  const chatSettings = await getUserChatSettings(userId);
  
  // Build the dynamic prompt for direct SQL generation
  const systemPrompt = buildDynamicPrompt(chatSettings);
  
  // Build messages array with optional conversation history
  const messages = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Add conversation history if requested
  if (includeHistory && conversationHistory && conversationHistory.length > 0) {
    messages.push(...conversationHistory);
  }
  
  // Add current user message
  messages.push({ role: 'user', content: message });

  console.log('Calling OpenAI with forced function calling for direct SQL...');
  const response = await chatWithForcedFunctionCalling(messages, chatSettings.model);
  console.log('OpenAI response:', response);

  // Force function calling - if no function call, create a default one
  if (!response.function_call) {
    console.log('No function call received, creating default query...');
    // Create a default query to get some data
    const defaultQuery = 'SELECT COUNT(*) as "count" FROM "DailyLog" WHERE "userId" = $1';
    const defaultParams = [userId];
    
    let sqlResult = null;
    let sqlError = null;
    
    try {
      sqlResult = await execute_sql_query_with_params(defaultQuery, defaultParams);
    } catch (error) {
      console.error('Default SQL execution error:', error);
      sqlError = error instanceof Error ? error.message : 'Unknown SQL execution error';
    }

    // Convert BigInt values to regular numbers for JSON serialization
    const convertBigIntToNumber = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj === 'bigint') return Number(obj);
      if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
      if (typeof obj === 'object') {
        const converted: any = {};
        for (const [key, value] of Object.entries(obj)) {
          converted[key] = convertBigIntToNumber(value);
        }
        return converted;
      }
      return obj;
    };

    const serializableSqlResult = convertBigIntToNumber(sqlResult);

    // Get a response from the AI with the default results
    const followUpMessages = [
      ...messages,
      {
        role: 'assistant',
        content: response.content || 'I understand your question. Let me check your data.'
      },
      {
        role: 'function',
        name: 'execute_sql_query_with_params',
        content: sqlError ? `Error: ${sqlError}` : JSON.stringify(serializableSqlResult)
      }
    ];
    
    console.log('Getting follow-up response with default SQL results...');
    const finalResponse = await chatCompletion(followUpMessages);
    
    const responseData = {
      success: true,
      response: finalResponse.content || 'I found some data for you. Please try rephrasing your question to be more specific.',
      jsonIntent: false,
      directSQL: true,
      sqlQuery: defaultQuery,
      sqlParams: defaultParams,
      sqlResult: serializableSqlResult,
      sqlError: sqlError,
      rawLlmResponse: response.content,
      finalLlmResponse: finalResponse.content
    };
    
    console.log('Sending default SQL response:', responseData);
    return res.json(responseData);
  }

  // Handle function calling response
  if (response.function_call) {
    const functionName = response.function_call.name;
    const functionArgs = JSON.parse(response.function_call.arguments);
    
    console.log('Function call:', functionName, functionArgs);
    
    let sqlResult = null;
    let sqlError = null;
    
    try {
      if (functionName === 'execute_sql_query_with_params') {
        // Add userId filter to the query if not already present
        let { query, params } = functionArgs;
        
        // Basic validation - ensure query includes userId filter for security
        if (!query.toLowerCase().includes('userid') && !query.toLowerCase().includes('"userid"')) {
          // Remove trailing semicolon if present to avoid syntax errors
          query = query.replace(/;\s*$/, '');
          
          // Add userId filter to WHERE clause or create one
          if (query.toLowerCase().includes('where')) {
            query += ` AND "userId" = $${params.length + 1}`;
          } else {
            query += ` WHERE "userId" = $${params.length + 1}`;
          }
          params.push(userId);
        } else {
          // Replace any placeholder userId values with the real userId
          for (let i = 0; i < params.length; i++) {
            if (typeof params[i] === 'string' && (
              params[i].includes('user-') || 
              params[i] === 'user_id_placeholder' || 
              params[i].match(/^user[_-]?\d*$/i)
            )) {
              params[i] = userId;
            }
          }
        }
        
        console.log('Executing SQL with params:', query, params);
        sqlResult = await execute_sql_query_with_params(query, params);
      }
    } catch (error) {
      console.error('SQL execution error:', error);
      sqlError = error instanceof Error ? error.message : 'Unknown SQL execution error';
    }
    
    // Convert BigInt values to regular numbers for JSON serialization
    const convertBigIntToNumber = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj === 'bigint') return Number(obj);
      if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
      if (typeof obj === 'object') {
        const converted: any = {};
        for (const [key, value] of Object.entries(obj)) {
          converted[key] = convertBigIntToNumber(value);
        }
        return converted;
      }
      return obj;
    };

    const serializableSqlResult = convertBigIntToNumber(sqlResult);

    // Get the follow-up response from the AI with the SQL results
    const followUpMessages = [
      ...messages,
      {
        role: 'assistant',
        content: response.content,
        function_call: response.function_call
      },
      {
        role: 'function',
        name: functionName,
        content: sqlError ? `Error: ${sqlError}` : JSON.stringify(serializableSqlResult)
      }
    ];
    
    console.log('Getting follow-up response with SQL results...');
    const finalResponse = await chatCompletion(followUpMessages, chatSettings.model);
    
    // If there was an SQL error, check if the AI wants to try another query
    if (sqlError && finalResponse.content) {
      const responseContent = finalResponse.content.toLowerCase();
      if (responseContent.includes('select ') && (responseContent.includes('let me') || responseContent.includes('try') || responseContent.includes('fix'))) {
        console.log('AI wants to retry with a corrected query, attempting second function call...');
        
        // Try to get another function call for the corrected query
        const retryMessages = [
          ...followUpMessages,
          {
            role: 'assistant',
            content: finalResponse.content
          },
          {
            role: 'user',
            content: 'Please execute that corrected query now.'
          }
        ];
        
        try {
          const retryResponse = await chatWithForcedFunctionCalling(retryMessages, chatSettings.model);
          console.log('Retry OpenAI response:', retryResponse);
          
          if (retryResponse.function_call) {
            const retryFunctionArgs = JSON.parse(retryResponse.function_call.arguments);
            console.log('Retry function call:', retryFunctionArgs);
            
            let retrySqlResult = null;
            
            try {
              let { query: retryQuery, params: retryParams } = retryFunctionArgs;
              
              // Add userId filter if not present
              if (!retryQuery.toLowerCase().includes('userid') && !retryQuery.toLowerCase().includes('"userid"')) {
                // Remove trailing semicolon if present to avoid syntax errors
                retryQuery = retryQuery.replace(/;\s*$/, '');
                
                if (retryQuery.toLowerCase().includes('where')) {
                  retryQuery += ` AND "userId" = $${retryParams.length + 1}`;
                } else {
                  retryQuery += ` WHERE "userId" = $${retryParams.length + 1}`;
                }
                retryParams.push(userId);
              } else {
                // Replace any placeholder userId values with the real userId
                for (let i = 0; i < retryParams.length; i++) {
                  if (typeof retryParams[i] === 'string' && (
                    retryParams[i].includes('user-') || 
                    retryParams[i] === 'user_id_placeholder' || 
                    retryParams[i].match(/^user[_-]?\d*$/i)
                  )) {
                    retryParams[i] = userId;
                  }
                }
              }
              
              console.log('Executing retry SQL with params:', retryQuery, retryParams);
              retrySqlResult = await execute_sql_query_with_params(retryQuery, retryParams);
              
              const retrySerializableResult = convertBigIntToNumber(retrySqlResult);
              
              // Get final response with successful results
              const retryFollowUpMessages = [
                ...retryMessages,
                {
                  role: 'assistant',
                  content: retryResponse.content,
                  function_call: retryResponse.function_call
                },
                {
                  role: 'function',
                  name: 'execute_sql_query_with_params',
                  content: JSON.stringify(retrySerializableResult)
                }
              ];
              
                          console.log('Getting final response with retry results...');
            const retryFinalResponse = await chatCompletion(retryFollowUpMessages, chatSettings.model);
              
              const responseData = {
                success: true,
                response: retryFinalResponse.content || 'Query executed successfully!',
                jsonIntent: false,
                directSQL: true,
                sqlQuery: retryFunctionArgs.query,
                sqlParams: retryFunctionArgs.params,
                sqlResult: retrySerializableResult,
                sqlError: null,
                rawLlmResponse: response.content,
                finalLlmResponse: retryFinalResponse.content,
                retryAttempted: true
              };
              
              console.log('Sending successful retry response:', responseData);
              return res.json(responseData);
              
            } catch (retryError) {
              console.error('Retry SQL execution error:', retryError);
              // If retry fails, we'll fall through to the original error response
            }
          }
        } catch (retryError) {
          console.error('Error during retry attempt:', retryError);
        }
      }
    }
    
    const responseData = {
      success: true,
      response: finalResponse.content || 'No response generated',
      jsonIntent: false,
      directSQL: true,
      sqlQuery: functionArgs.query,
      sqlParams: functionArgs.params,
      sqlResult: serializableSqlResult,
      sqlError: sqlError,
      rawLlmResponse: response.content,
      finalLlmResponse: finalResponse.content
    };
    
    console.log('Sending direct SQL response:', responseData);
    return res.json(responseData);
    
  } else {
    // No function call - just return the regular response
    const responseData = {
      success: true,
      response: response.content || 'No response generated',
      jsonIntent: false,
      directSQL: true,
      rawLlmResponse: response.content
    };
    
    console.log('Sending direct response (no function call):', responseData);
    return res.json(responseData);
  }
}

export default router; 