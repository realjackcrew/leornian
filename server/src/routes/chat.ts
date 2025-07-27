import express from 'express';
import { chatCompletion } from '../llm/openai';
import { buildJsonIntentPrompt } from '../llm/jsonIntentPromptBuilder';
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

    const responseData = {
      success: true,
      response: response.content,
      jsonIntent: true
    };

    console.log('Sending response:', responseData);
    return res.json(responseData);

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router; 