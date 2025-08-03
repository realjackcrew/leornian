"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeQueryResults = summarizeQueryResults;
exports.parseFollowUpQuestions = parseFollowUpQuestions;
const openai_1 = require("./openai");
const summarizationPromptBuilder_1 = require("./summarizationPromptBuilder");
async function summarizeQueryResults(request) {
    try {
        // Build the summarization prompt with user's voice and brevity settings
        const systemPrompt = (0, summarizationPromptBuilder_1.buildSummarizationPrompt)(request.settings);
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
        const response = await (0, openai_1.chatCompletion)(messages, model);
        if (!response.content) {
            throw new Error('No content in summarization response');
        }
        // Parse follow-up questions from the response
        const { summary, followUpQuestions } = parseFollowUpQuestions(response.content);
        return {
            success: true,
            summary,
            followUpQuestions
        };
    }
    catch (error) {
        console.error('Error in summarization service:', error);
        return {
            success: false,
            summary: '',
            error: error instanceof Error ? error.message : 'Unknown error during summarization'
        };
    }
}
function parseFollowUpQuestions(response) {
    console.log('Attempting to parse JSON response...');
    // First, try to extract JSON from markdown code blocks
    let jsonContent = response;
    // Look for JSON code blocks: ```json ... ```
    const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
        console.log('Found JSON code block, extracting content...');
        jsonContent = jsonBlockMatch[1].trim();
    }
    try {
        // Try to parse the JSON content
        const parsed = JSON.parse(jsonContent);
        if (parsed.summary && Array.isArray(parsed.followUpQuestions)) {
            console.log('Successfully parsed JSON response');
            console.log('Summary length:', parsed.summary.length);
            console.log('Follow-up questions:', parsed.followUpQuestions);
            return {
                summary: parsed.summary,
                followUpQuestions: parsed.followUpQuestions.slice(0, 3) // Limit to 3 questions
            };
        }
        else {
            console.log('JSON parsed but missing required fields');
            return {
                summary: response,
                followUpQuestions: []
            };
        }
    }
    catch (error) {
        console.log('Failed to parse as JSON, falling back to text parsing');
        // Fallback to the old text parsing method for backward compatibility
        const followUpQuestions = [];
        const lines = response.split('\n');
        let summary = response;
        let inFollowUpSection = false;
        let summaryLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Check if we're entering a follow-up questions section
            if (line.match(/^(Follow[- ]?Up Questions?|Extension Queries?|Questions?|Explore Further):?$/i) ||
                line.match(/^(Recommendations|Next Steps|Further Analysis):?$/i) ||
                line.match(/^\*\*Follow[- ]?Up Questions?\*\*:?$/i)) {
                inFollowUpSection = true;
                continue;
            }
            if (inFollowUpSection) {
                // Look for numbered questions with quotes: 1. "question"
                let questionMatch = line.match(/^(\d+\.|\-|\*)\s*["""]([^"""]+)["""]?/);
                if (questionMatch) {
                    followUpQuestions.push(questionMatch[2].trim());
                }
                // Look for numbered questions without quotes but ending with ?
                else if (line.match(/^(\d+\.|\-|\*)\s*(.+\?)$/)) {
                    const question = line.replace(/^(\d+\.|\-|\*)\s*/, '').trim();
                    followUpQuestions.push(question);
                }
                // Look for questions that start with question words
                else if (line.match(/^(\d+\.|\-|\*)\s*((?:How|What|Which|When|Where|Why).+)$/i)) {
                    const question = line.replace(/^(\d+\.|\-|\*)\s*/, '').trim();
                    followUpQuestions.push(question);
                }
                // Skip empty lines but continue parsing
                else if (line === '') {
                    continue;
                }
                // Stop parsing if we hit a new section
                else if (line.match(/^#{1,6}\s/)) {
                    break;
                }
                // If we hit a non-question line, stop parsing
                else if (line.length > 0) {
                    break;
                }
            }
            else {
                summaryLines.push(lines[i]);
            }
        }
        if (followUpQuestions.length > 0) {
            summary = summaryLines.join('\n').trim();
        }
        console.log('Fallback parsing found questions:', followUpQuestions);
        return {
            summary,
            followUpQuestions: followUpQuestions.slice(0, 3)
        };
    }
}
function formatQueryResultsForSummarization(queryResults) {
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
