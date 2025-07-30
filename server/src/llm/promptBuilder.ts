import { getVoicePersonality } from './voicePrompts';
import { getResponseLength } from './responsePrompts';
import { promptTemplate } from './promptTemplate';
import { promptExamples } from './examples';

export interface PromptSettings {
  voice?: string;
  verbosity?: string;
}

export function buildDynamicPrompt(settings: PromptSettings = {}): string {
  const voice = settings.voice || 'default';
  const verbosity = settings.verbosity || 'balanced';
  
  // Calculate current date
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const voicePersonality = getVoicePersonality(voice);
  const responseLength = getResponseLength(verbosity);
  const responseExample = responseLength.examples[voice] || responseLength.examples.default;

  // Get all example blocks for this voice
  const example_small_result = promptExamples.smallResult[voice] || promptExamples.smallResult.default;
  const example_filtered_analysis = promptExamples.filteredAnalysis[voice] || promptExamples.filteredAnalysis.default;
  const example_trend_analysis = promptExamples.trendAnalysis[voice] || promptExamples.trendAnalysis.default;
  const example_no_results = promptExamples.noResults[voice] || promptExamples.noResults.default;
  const example_invalid_request = promptExamples.invalidRequest[voice] || promptExamples.invalidRequest.default;

  // Replace placeholders in the template
  let prompt = promptTemplate
    .replace('{{example_small_result}}', example_small_result)
    .replace('{{example_filtered_analysis}}', example_filtered_analysis)
    .replace('{{example_trend_analysis}}', example_trend_analysis)
    .replace('{{example_no_results}}', example_no_results)
    .replace('{{example_invalid_request}}', example_invalid_request)
    .replace('{{CURRENT_DATE}}', currentDate);

  // Insert the personality and response length section at the top (after Overview)
  const personalitySection = `\n## PERSONALITY & COMMUNICATION STYLE\n\n**Voice Personality: ${voicePersonality.name}**\n${voicePersonality.personality}\n\n**Communication Examples:**\n${voicePersonality.examples}\n\n**Response Length: ${responseLength.name} (${responseLength.characterRange})**\n${responseLength.instructions}\n\n**Response Length Example in Your Voice:**\n${responseExample}\n\n---\n`;

  // Insert after Overview section
  const overviewEnd = prompt.indexOf('---');
  if (overviewEnd !== -1) {
    prompt = prompt.slice(0, overviewEnd) + personalitySection + prompt.slice(overviewEnd);
  } else {
    prompt = personalitySection + prompt;
  }

  return prompt;
}

export function getAvailableVoices(): string[] {
  return ['default', 'cowboy', 'vampire', 'alien', 'pirate', 'robot', 'wizard', 'surfer', 'detective'];
}

export function getAvailableVerbosities(): string[] {
  return ['concise', 'balanced', 'detailed', 'very-detailed'];
} 