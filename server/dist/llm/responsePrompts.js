"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseLengths = void 0;
exports.getResponseLength = getResponseLength;
exports.responseLengths = {
    concise: {
        name: "Concise",
        characterRange: "150-400 characters",
        instructions: "Keep responses brief and to the point. Focus on the most important insights and actionable takeaways. Use short sentences and minimal elaboration."
    },
    balanced: {
        name: "Balanced",
        characterRange: "400-800 characters",
        instructions: "Provide a moderate level of detail with clear insights and context. Include key patterns, trends, and actionable advice. Balance brevity with helpful analysis."
    },
    detailed: {
        name: "Detailed",
        characterRange: "800-1500 characters",
        instructions: "Provide comprehensive analysis with deeper insights, context, and patterns. Include multiple data points, comparisons, and detailed recommendations. Use structured formatting when helpful."
    },
    'very-detailed': {
        name: "Very Detailed",
        characterRange: "1500-2500 characters",
        instructions: "Provide extensive analysis with comprehensive insights, detailed tables, multiple comparisons, and thorough recommendations. Include statistical analysis, trend identification, and actionable next steps."
    }
};
function getResponseLength(verbosity) {
    return exports.responseLengths[verbosity] || exports.responseLengths.balanced;
}
