import express from 'express';
import { chatCompletion } from '../llm/openai';
import { buildJsonIntentPrompt } from '../llm/jsonIntentPromptBuilder';
import { parseJsonIntent, validateQueryIntent, ParsedQueryIntent } from '../llm/jsonIntentParser';
import { executeQueryFromIntent, QueryExecutionResult, formatQueryResults } from '../llm/queryExecutor';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

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

    // Build the JSON intent prompt with user's datapoints and today's date
    const systemPrompt = await buildJsonIntentPrompt({ userId });
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI for JSON intent generation...');
    const response = await chatCompletion(messages);
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

    // Format the response based on whether we have query results
    let formattedResponse = response.content || '';
    
    if (queryResult && queryResult.success) {
      // If we have successful query results, format them for the user
      formattedResponse = formatQueryResults(queryResult);
    } else if (queryResult && !queryResult.success) {
      // If query failed, show the error
      formattedResponse = `I couldn't execute your query: ${queryResult.error}`;
    } else if (parseError) {
      // If parsing failed, show the parse error
      formattedResponse = `I couldn't understand your request: ${parseError}`;
    }

    const responseData = {
      success: true,
      response: formattedResponse,
      jsonIntent: true,
      parsedIntent: parsedIntent,
      queryResult: queryResult,
      parseError,
      // Keep the raw LLM response for debugging
      rawLlmResponse: response.content
    };

    console.log('Sending response:', responseData);
    return res.json(responseData);

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router; 