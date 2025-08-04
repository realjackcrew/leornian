"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithFunctionCalling = chatWithFunctionCalling;
exports.chatWithForcedFunctionCalling = chatWithForcedFunctionCalling;
exports.chatCompletion = chatCompletion;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const functions = [
    {
        name: 'execute_sql_query',
        description: 'Execute a read-only SQL query to get data from the database',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The SQL query to execute (must be a SELECT statement)'
                }
            },
            required: ['query']
        }
    },
    {
        name: 'execute_sql_query_with_params',
        description: 'Execute a parameterized read-only SQL query to get data from the database',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The SQL query template with placeholders ($1, $2, etc.)'
                },
                params: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    description: 'Array of parameters to substitute in the query'
                }
            },
            required: ['query', 'params']
        }
    }
];
async function chatWithFunctionCalling(messages, model = 'gpt-4o-mini') {
    try {
        console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
        console.log('Messages being sent to OpenAI:', messages);
        const response = await openai.chat.completions.create({
            model,
            messages,
            functions,
            function_call: 'auto',
        });
        console.log('OpenAI response received successfully');
        return response.choices[0].message;
    }
    catch (error) {
        console.error('OpenAI API error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            name: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? error.stack : undefined
        });
        throw new Error(`Failed to get response from OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function chatWithForcedFunctionCalling(messages, model = 'gpt-4o-mini') {
    try {
        console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
        console.log('Messages being sent to OpenAI with forced function call:', messages);
        const response = await openai.chat.completions.create({
            model,
            messages,
            functions,
            function_call: { name: 'execute_sql_query_with_params' },
        });
        console.log('OpenAI response received successfully');
        return response.choices[0].message;
    }
    catch (error) {
        console.error('OpenAI API error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            name: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? error.stack : undefined
        });
        throw new Error(`Failed to get response from OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function chatCompletion(messages, model = 'gpt-4o-mini') {
    try {
        const response = await openai.chat.completions.create({
            model,
            messages,
        });
        return response.choices[0].message;
    }
    catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('Failed to get response from OpenAI');
    }
}
