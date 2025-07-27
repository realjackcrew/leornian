import express from 'express';
import { chatCompletion } from '../llm/openai';
import { buildJsonIntentPrompt } from '../llm/jsonIntentPromptBuilder';
import { parseJsonIntent, validateQueryIntent, ParsedQueryIntent } from '../llm/jsonIntentParser';
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
    let validationErrors: string[] = [];
    let validationWarnings: string[] = [];
    
    try {
      if (!response.content) {
        throw new Error('No content in response');
      }
      parsedIntent = parseJsonIntent(response.content);
      console.log('Parsed query intent:', parsedIntent);
      
      // Validate the parsed intent
      const validation = await validateQueryIntent(parsedIntent, userId);
      if (!validation.isValid) {
        console.error('Query intent validation failed:', validation.errors);
        validationErrors = validation.errors;
      }
      validationWarnings = validation.warnings;
      
      if (validation.warnings.length > 0) {
        console.log('Query intent validation warnings:', validation.warnings);
      }
    } catch (error) {
      console.error('Failed to parse JSON intent:', error);
      parseError = `Failed to parse JSON intent: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    const responseData = {
      success: true,
      response: response.content || '',
      jsonIntent: true,
      parsedIntent: parseError || validationErrors.length > 0 ? null : parsedIntent,
      parseError,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      validationWarnings: validationWarnings.length > 0 ? validationWarnings : undefined
    };

    console.log('Sending response:', responseData);
    return res.json(responseData);

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router; 