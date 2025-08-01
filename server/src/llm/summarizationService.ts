import { chatCompletion } from './openai';
import { buildSummarizationPrompt, SummarizationPromptSettings } from './summarizationPromptBuilder';

export interface SummarizationRequest {
  originalQuestion: string;
  queryResults: any;
  userId: string;
  settings: SummarizationPromptSettings;
}

export interface SummarizationResponse {
  success: boolean;
  summary: string;
  error?: string;
}

export async function summarizeQueryResults(request: SummarizationRequest): Promise<SummarizationResponse> {
  try {
    // Build the summarization prompt with user's voice and brevity settings
    const systemPrompt = buildSummarizationPrompt(request.settings);
    
    // Prepare the data for the LLM
    const dataContext = formatQueryResultsForSummarization(request.queryResults);
    
    // Create the user message with the original question and data in the format expected by examples
    const userMessage = `User Question: "${request.originalQuestion}"

Data: ${dataContext}

Please provide a comprehensive summary that answers the user's question using the data provided.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    // Call the LLM for summarization
    const model = request.settings.model || 'gpt-4o-mini';
    const response = await chatCompletion(messages, model);
    
    if (!response.content) {
      throw new Error('No content in summarization response');
    }

    return {
      success: true,
      summary: response.content
    };

  } catch (error) {
    console.error('Error in summarization service:', error);
    return {
      success: false,
      summary: '',
      error: error instanceof Error ? error.message : 'Unknown error during summarization'
    };
  }
}

function formatQueryResultsForSummarization(queryResults: any): string {
  // Handle error cases
  if (!queryResults) {
    return '{}';
  }
  
  if (queryResults.success === false) {
    return `{"success": false, "error": "${queryResults.error || 'Unknown error'}"}`;
  }
  
  if (!queryResults.data) {
    return '{}';
  }

  const { data, metadata } = queryResults;
  
  // Return the data in JSON format as expected by the voice examples
  const formattedResult = {
    success: true,
    data: data,
    metadata: metadata || {}
  };

  return JSON.stringify(formattedResult);
}

 