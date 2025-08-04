import { getVoicePersonality } from './voicePrompts';
import { getResponseLength } from './responsePrompts';
import fs from 'fs';
import path from 'path';
import { defaultVoiceExamples } from './examples/defaultVoiceExamples';
import { cowboyVoiceExamples } from './examples/cowboyVoiceExamples';
import { alienVoiceExamples } from './examples/alienVoiceExamples';
import { pirateVoiceExamples } from './examples/pirateVoiceExamples';
import { robotVoiceExamples } from './examples/robotVoiceExamples';
import { wizardVoiceExamples } from './examples/wizardVoiceExamples';
import { surferVoiceExamples } from './examples/surferVoiceExamples';
import { detectiveVoiceExamples } from './examples/detectiveVoiceExamples';
import { shakespeareVoiceExamples } from './examples/shakespeareVoiceExamples';
export interface SummarizationPromptSettings {
  voice?: string;
  verbosity?: string;
  model?: string;
}
const voiceExamplesMap = {
  'default': defaultVoiceExamples,
  'cowboy': cowboyVoiceExamples,
  'alien': alienVoiceExamples,
  'pirate': pirateVoiceExamples,
  'robot': robotVoiceExamples,
  'wizard': wizardVoiceExamples,
  'surfer': surferVoiceExamples,
  'detective': detectiveVoiceExamples,
  'shakespeare': shakespeareVoiceExamples,
};
export function buildSummarizationPrompt(settings: SummarizationPromptSettings = {}): string {
  const voice = settings.voice || 'default';
  const verbosity = settings.verbosity || 'balanced';
  const voicePersonality = getVoicePersonality(voice);
  const responseLength = getResponseLength(verbosity);
  const promptPath = path.join(__dirname, 'prompts', 'summarizationPrompt.md');
  let prompt = '';
  try {
    prompt = fs.readFileSync(promptPath, 'utf8');
  } catch (error) {
    console.error('Error reading summarization prompt file:', error);
    prompt = `# SYSTEM PROMPT — Query Result Summarizer
You are a specialized wellness data analyst tasked with summarizing query results in a clear, engaging, and personalized manner.
## PERSONALITY & COMMUNICATION STYLE
**Voice Personality: ${voicePersonality.name}**
${voicePersonality.personality}
**Communication Examples:**
${voicePersonality.examples}
**Response Length: ${responseLength.name} (${responseLength.characterRange})**
${responseLength.instructions}
Please provide a comprehensive summary that answers the user's question using the data provided.`;
  }
  const examples = getExamplesForVoiceAndVerbosity(voice, verbosity);
  const examplesText = examples.map((example, index) => {
    return `### Example ${index + 1}: ${example.userQuestion}
**User Question:** "${example.userQuestion}"
**Data:** 
${example.data}
**Response:** "${example.response}"
**Extension Queries:**
1. "${example.extensionQueries[0]}"
2. "${example.extensionQueries[1]}"
3. "${example.extensionQueries[2]}"`;
  }).join('\n\n');
  prompt = prompt
    .replace('{{VOICE_NAME}}', voicePersonality.name)
    .replace('{{VOICE_PERSONALITY}}', voicePersonality.personality)
    .replace('{{VOICE_EXAMPLES}}', voicePersonality.examples)
    .replace('{{VERBOSITY_NAME}}', responseLength.name)
    .replace('{{VERBOSITY_RANGE}}', responseLength.characterRange)
    .replace('{{VERBOSITY_INSTRUCTIONS}}', responseLength.instructions)
    .replace('{{EXAMPLES}}', examplesText);
  return prompt;
}
export function getExamplesForVoiceAndVerbosity(voice: string, verbosity: string): any[] {
  const voiceExamples = voiceExamplesMap[voice as keyof typeof voiceExamplesMap];
  if (!voiceExamples) {
    console.warn(`No examples found for voice: ${voice}, falling back to default`);
    return defaultVoiceExamples.filter(example => 
      example.verbosity === verbosity
    ).slice(0, 7);
  }
  return voiceExamples.filter(example => 
    example.verbosity === verbosity
  ).slice(0, 7);
}
export function getAvailableVoices(): string[] {
  return ['default', 'cowboy', 'alien', 'pirate', 'robot', 'wizard', 'surfer', 'detective', 'shakespeare'];
}
export function getAvailableVerbosities(): string[] {
  return ['concise', 'balanced', 'detailed', 'very-detailed'];
} 