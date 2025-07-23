import express from 'express';
import { chatWithFunctionCalling, chatCompletion } from '../llm/openai';
import { execute_sql_query, execute_sql_query_with_params } from '../db/queries';
import { buildDynamicPrompt } from '../llm/promptBuilder';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import database from '../db/database';

const router = express.Router();

function bigIntToString(value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

router.post('/chat', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Chat request received:', req.body);
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      console.log('Invalid message format');
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    const userId = req.userId!;
    console.log('Processing message for user:', userId, message);

    // Get user's chat settings
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { settings: true }
    });

    const settings = user?.settings as any || {};
    const chatSettings = {
      voice: settings.voice || 'default',
      verbosity: settings.verbosity || 'balanced'
    };

    console.log('Using chat settings:', chatSettings);

    // Build dynamic prompt based on user preferences
    const dynamicPrompt = buildDynamicPrompt(chatSettings);
    const SYSTEM_PROMPT = {
      role: 'system',
      content: dynamicPrompt
    };

    // Multi-turn function call loop
    let messages = [SYSTEM_PROMPT, { role: 'user', content: message }];
    let tries = 0;
    const maxTries = 3;
    let firstResponse: any = null;
    let gotFunctionCall = false;
    let finalResponse: any = null;

    while (tries < maxTries && !gotFunctionCall) {
      console.log(`Calling OpenAI with function calling... (try ${tries + 1})`);
      firstResponse = await chatWithFunctionCalling(messages);
      console.log('OpenAI response:', firstResponse);
      if (firstResponse.function_call) {
        gotFunctionCall = true;
        break;
      } else if (tries < maxTries - 1) {
        // Add the model's message to the conversation and try again
        messages.push({ role: 'assistant', content: firstResponse.content });
      }
      tries++;
    }

    if (gotFunctionCall && firstResponse.function_call) {
      console.log('Function call detected:', firstResponse.function_call);
      const functionName = firstResponse.function_call.name;
      const functionArgs = JSON.parse(firstResponse.function_call.arguments);
      console.log('Function args:', functionArgs);
      let queryResult;
      // Execute the appropriate function
      if (functionName === 'execute_sql_query') {
        console.log('Executing SQL query:', functionArgs.query);
        queryResult = await execute_sql_query(functionArgs.query);
      } else if (functionName === 'execute_sql_query_with_params') {
        if (Array.isArray(functionArgs.params)) {
          // Replace any known user ID placeholders with the real userId
          functionArgs.params = functionArgs.params.map((param: any) =>
            [
              'your-user-id',
              'USER_ID',
              'user_id',
              'current_user_id',
              '<user-id>',
              '<USER_ID>'
            ].includes((param || '').toString().toLowerCase()) ? userId : param
          );
          // If the query contains a userId filter but the userId is not in params, prepend it
          if (/"userId"\s*=\s*\$1/.test(functionArgs.query) && functionArgs.params[0] !== userId) {
            functionArgs.params.unshift(userId);
          }
        }
        console.log('Executing parameterized SQL query:', functionArgs.query, functionArgs.params);
        queryResult = await execute_sql_query_with_params(functionArgs.query, functionArgs.params);
      } else {
        throw new Error(`Unknown function: ${functionName}`);
      }
      console.log('Query result:', queryResult);
      // For the interpretation call, only include the original message context
      const interpretationMessages = [
        SYSTEM_PROMPT,
        { role: 'user', content: message },
        firstResponse,
        {
          role: 'function',
          name: functionName,
          content: JSON.stringify(queryResult, bigIntToString, 2)
        }
      ];
      console.log('Calling OpenAI for interpretation...');
      // Second call to OpenAI to interpret the results
      finalResponse = await chatCompletion(interpretationMessages);
      console.log('Final response:', finalResponse);
    } else {
      // No function call after max tries, just use the last response
      finalResponse = firstResponse;
    }

    const responseData = {
      success: true,
      response: finalResponse.content,
      functionCalled: firstResponse.function_call ? firstResponse.function_call.name : null
    };

    console.log('Sending response:', responseData);
    return res.json(responseData);

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router; 