export interface ResponseLength {
  name: string;
  characterRange: string;
  instructions: string;
}
export const responseLengths: Record<string, ResponseLength> = {
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
export function getResponseLength(verbosity: string): ResponseLength {
  return responseLengths[verbosity] || responseLengths.balanced;
} 