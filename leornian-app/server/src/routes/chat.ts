import express from 'express';
import { chatWithFunctionCalling, chatCompletion } from '../llm/openai';
import { execute_sql_query, execute_sql_query_with_params } from '../db/queries';
import { readFileSync } from 'fs';
import path from 'path';

const router = express.Router();

const prompt = readFileSync(path.join(__dirname, '../llm/prompt.txt'), 'utf8');

function bigIntToString(key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

// System message that provides context about the database
const SYSTEM_MESSAGE = {
  role: 'system',
  content: prompt
};

router.post('/chat', async (req, res) => {
  try {
    console.log('Chat request received:', req.body);
    const { message, conversationHistory = [], includeHistory = false } = req.body;
    
    if (!message || typeof message !== 'string') {
      console.log('Invalid message format');
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    console.log('Processing message:', message);

    // Build the conversation - only include history if explicitly requested
    const messages = includeHistory 
      ? [
          SYSTEM_MESSAGE,
          ...conversationHistory,
          { role: 'user', content: message }
        ]
      : [
          SYSTEM_MESSAGE,
          { role: 'user', content: message }
        ];

    console.log('Calling OpenAI with function calling...');
    // First call to OpenAI with function calling
    const firstResponse = await chatWithFunctionCalling(messages);
    console.log('OpenAI response:', firstResponse);
    
    let finalResponse = firstResponse;

    // If the model wants to call a function
    if (firstResponse.function_call) {
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
        console.log('Executing parameterized SQL query:', functionArgs.query, functionArgs.params);
        queryResult = await execute_sql_query_with_params(functionArgs.query, functionArgs.params);
      } else {
        throw new Error(`Unknown function: ${functionName}`);
      }

      console.log('Query result:', queryResult);

      // For the interpretation call, we can include the original message context
      // but not the full conversation history to save tokens
      const interpretationMessages = [
        SYSTEM_MESSAGE,
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
    }

    const responseData = {
      success: true,
      response: finalResponse.content,
      functionCalled: firstResponse.function_call ? firstResponse.function_call.name : null
    };

    console.log('Sending response:', responseData);
    res.json(responseData);

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false 
    });
  }
});

export default router; 