"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = require("../llm/openai");
const queries_1 = require("../db/queries");
const promptBuilder_1 = require("../llm/promptBuilder");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../db/database"));
const router = express_1.default.Router();
function bigIntToString(key, value) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}
router.post('/chat', auth_1.authenticateToken, async (req, res) => {
    try {
        console.log('Chat request received:', req.body);
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            console.log('Invalid message format');
            return res.status(400).json({
                error: 'Message is required and must be a string'
            });
        }
        const userId = req.userId;
        console.log('Processing message for user:', userId, message);
        // Get user's chat settings
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { settings: true }
        });
        const settings = user?.settings || {};
        const chatSettings = {
            voice: settings.voice || 'default',
            verbosity: settings.verbosity || 'balanced'
        };
        console.log('Using chat settings:', chatSettings);
        // Build dynamic prompt based on user preferences
        const dynamicPrompt = (0, promptBuilder_1.buildDynamicPrompt)(chatSettings);
        const SYSTEM_PROMPT = {
            role: 'system',
            content: dynamicPrompt
        };
        // Only send the current message and system prompt
        const messages = [
            SYSTEM_PROMPT,
            { role: 'user', content: message }
        ];
        console.log('Calling OpenAI with function calling...');
        // First call to OpenAI with function calling
        const firstResponse = await (0, openai_1.chatWithFunctionCalling)(messages);
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
                queryResult = await (0, queries_1.execute_sql_query)(functionArgs.query);
            }
            else if (functionName === 'execute_sql_query_with_params') {
                console.log('Executing parameterized SQL query:', functionArgs.query, functionArgs.params);
                queryResult = await (0, queries_1.execute_sql_query_with_params)(functionArgs.query, functionArgs.params);
            }
            else {
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
            finalResponse = await (0, openai_1.chatCompletion)(interpretationMessages);
            console.log('Final response:', finalResponse);
        }
        const responseData = {
            success: true,
            response: finalResponse.content,
            functionCalled: firstResponse.function_call ? firstResponse.function_call.name : null
        };
        console.log('Sending response:', responseData);
        res.json(responseData);
    }
    catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            success: false
        });
    }
});
exports.default = router;
