"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseLengths = void 0;
exports.getResponseLength = getResponseLength;
exports.responseLengths = {
    concise: {
        name: "Concise",
        characterRange: "150-400 characters",
        instructions: "Keep responses brief and to the point. Focus on the most important insights and actionable takeaways. Use short sentences and minimal elaboration.",
        examples: "Example: 'Great sleep efficiency at 89%! Your 10:30 PM bedtime is working well. Try adding meditation to boost those numbers even higher. Questions: How's your morning energy? Any screen time before bed? Want to compare with last week?'"
    },
    balanced: {
        name: "Balanced",
        characterRange: "400-800 characters",
        instructions: "Provide a moderate level of detail with clear insights and context. Include key patterns, trends, and actionable advice. Balance brevity with helpful analysis.",
        examples: "Example: 'Looking at your last 3 days, your sleep efficiency averaged 89% - that's fantastic! Your consistent 10:30 PM bedtime and 6:45 AM wake time are creating a solid foundation. I noticed you hit your water goals consistently with 8+ pints daily and kept up that meditation practice. This combination is clearly working for your recovery patterns. Questions: Did this consistent bedtime improve your sleep fulfillment? How did your meals with vegetables look? Any mental health factors contributing to feeling great?'"
    },
    detailed: {
        name: "Detailed",
        characterRange: "800-1500 characters",
        instructions: "Provide comprehensive analysis with deeper insights, context, and patterns. Include multiple data points, comparisons, and detailed recommendations. Use structured formatting when helpful.",
        examples: "Example: 'Excellent progress over these 3 days! Your sleep metrics show remarkable consistency with an average efficiency of 89%. The pattern reveals: consistent bedtime (10:30 PM ±15 min), steady wake time (6:45 AM), and strong hydration habits (8+ pints daily). Your meditation practice appears to be a key factor - on days you meditated, your sleep fulfillment scored 15% higher. Nutrition-wise, you maintained 6+ servings of vegetables and avoided late-night eating. Your WHOOP recovery scores correlate strongly with these habits. The data suggests your current routine is optimizing multiple wellness dimensions simultaneously. Questions: How do you feel this routine impacts your afternoon energy? Have you noticed changes in stress levels? Want to explore the correlation between meditation and recovery scores?'"
    },
    veryDetailed: {
        name: "Very Detailed",
        characterRange: "1500-2500 characters",
        instructions: "Provide extensive analysis with comprehensive insights, detailed tables, multiple comparisons, and thorough recommendations. Include statistical analysis, trend identification, and actionable next steps.",
        examples: "Example: 'Outstanding wellness optimization detected across your 3-day period! Let me break down the comprehensive analysis:\n\n**Sleep Performance**: Your 89% average efficiency demonstrates exceptional sleep hygiene. The consistency metrics show bedtime variance of only ±12 minutes and wake time stability within ±8 minutes. Sleep debt accumulated minimal increase (avg 14 minutes/night).\n\n**Recovery Correlation**: WHOOP recovery scores averaged 84%, with perfect correlation (r=0.96) to your meditation practice. Days with 10+ minute meditation sessions showed 18% higher recovery scores.\n\n**Nutrition Synergy**: Your hydration consistency (8.2 pints avg) combined with vegetable intake (6.4 servings avg) and meal timing (last meal 3+ hours before bed) created optimal digestive support for sleep quality.\n\n**Lifestyle Integration**: Zero screen time 1 hour before bed, morning sunlight within 20 minutes of waking, and evening sunset viewing created powerful circadian rhythm support.\n\nQuestions for deeper analysis: How does this routine affect your HRV trends over time? What environmental factors (temperature, light) support these patterns? Would you like me to project optimal adjustments for next week?'"
    }
};
function getResponseLength(verbosity) {
    return exports.responseLengths[verbosity] || exports.responseLengths.balanced;
}
