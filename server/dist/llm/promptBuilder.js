"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDynamicPrompt = buildDynamicPrompt;
exports.getAvailableVoices = getAvailableVoices;
exports.getAvailableVerbosities = getAvailableVerbosities;
const voicePrompts_1 = require("./voicePrompts");
const responsePrompts_1 = require("./responsePrompts");
const promptTemplate_1 = require("./prompts/promptTemplate");
const examples_1 = require("./prompts/examples");
function buildDynamicPrompt(settings = {}) {
    const voice = settings.voice || 'default';
    const verbosity = settings.verbosity || 'balanced';
    // Calculate current date
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const voicePersonality = (0, voicePrompts_1.getVoicePersonality)(voice);
    const responseLength = (0, responsePrompts_1.getResponseLength)(verbosity);
    // Get all example blocks for this voice
    const example_small_result = examples_1.promptExamples.smallResult[voice] || examples_1.promptExamples.smallResult.default;
    const example_filtered_analysis = examples_1.promptExamples.filteredAnalysis[voice] || examples_1.promptExamples.filteredAnalysis.default;
    const example_trend_analysis = examples_1.promptExamples.trendAnalysis[voice] || examples_1.promptExamples.trendAnalysis.default;
    const example_no_results = examples_1.promptExamples.noResults[voice] || examples_1.promptExamples.noResults.default;
    const example_invalid_request = examples_1.promptExamples.invalidRequest[voice] || examples_1.promptExamples.invalidRequest.default;
    // Replace placeholders in the template
    let prompt = promptTemplate_1.promptTemplate
        .replace('{{example_small_result}}', example_small_result)
        .replace('{{example_filtered_analysis}}', example_filtered_analysis)
        .replace('{{example_trend_analysis}}', example_trend_analysis)
        .replace('{{example_no_results}}', example_no_results)
        .replace('{{example_invalid_request}}', example_invalid_request)
        .replace('{{CURRENT_DATE}}', currentDate);
    // Insert the personality and response length section at the top (after Overview)
    const personalitySection = `\n## PERSONALITY & COMMUNICATION STYLE\n\n**Voice Personality: ${voicePersonality.name}**\n${voicePersonality.personality}\n\n**Communication Examples:**\n${voicePersonality.examples}\n\n**Response Length: ${responseLength.name} (${responseLength.characterRange})**\n${responseLength.instructions}\n\n---\n`;
    // Insert after Overview section
    const overviewEnd = prompt.indexOf('---');
    if (overviewEnd !== -1) {
        prompt = prompt.slice(0, overviewEnd) + personalitySection + prompt.slice(overviewEnd);
    }
    else {
        prompt = personalitySection + prompt;
    }
    return prompt;
}
function getAvailableVoices() {
    return ['default', 'cowboy', 'shakespeare', 'alien', 'pirate', 'robot', 'wizard', 'surfer', 'detective'];
}
function getAvailableVerbosities() {
    return ['concise', 'balanced', 'detailed', 'very-detailed'];
}
