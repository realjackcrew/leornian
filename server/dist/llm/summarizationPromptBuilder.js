"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSummarizationPrompt = buildSummarizationPrompt;
exports.getExamplesForVoiceAndVerbosity = getExamplesForVoiceAndVerbosity;
exports.getAvailableVoices = getAvailableVoices;
exports.getAvailableVerbosities = getAvailableVerbosities;
const voicePrompts_1 = require("./voicePrompts");
const responsePrompts_1 = require("./responsePrompts");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Import all voice example files
const defaultVoiceExamples_1 = require("./examples/defaultVoiceExamples");
const cowboyVoiceExamples_1 = require("./examples/cowboyVoiceExamples");
const alienVoiceExamples_1 = require("./examples/alienVoiceExamples");
const pirateVoiceExamples_1 = require("./examples/pirateVoiceExamples");
const robotVoiceExamples_1 = require("./examples/robotVoiceExamples");
const wizardVoiceExamples_1 = require("./examples/wizardVoiceExamples");
const surferVoiceExamples_1 = require("./examples/surferVoiceExamples");
const detectiveVoiceExamples_1 = require("./examples/detectiveVoiceExamples");
const shakespeareVoiceExamples_1 = require("./examples/shakespeareVoiceExamples");
// Map voice names to their example arrays
const voiceExamplesMap = {
    'default': defaultVoiceExamples_1.defaultVoiceExamples,
    'cowboy': cowboyVoiceExamples_1.cowboyVoiceExamples,
    'alien': alienVoiceExamples_1.alienVoiceExamples,
    'pirate': pirateVoiceExamples_1.pirateVoiceExamples,
    'robot': robotVoiceExamples_1.robotVoiceExamples,
    'wizard': wizardVoiceExamples_1.wizardVoiceExamples,
    'surfer': surferVoiceExamples_1.surferVoiceExamples,
    'detective': detectiveVoiceExamples_1.detectiveVoiceExamples,
    'shakespeare': shakespeareVoiceExamples_1.shakespeareVoiceExamples,
};
function buildSummarizationPrompt(settings = {}) {
    const voice = settings.voice || 'default';
    const verbosity = settings.verbosity || 'balanced';
    // Get voice personality and response length settings
    const voicePersonality = (0, voicePrompts_1.getVoicePersonality)(voice);
    const responseLength = (0, responsePrompts_1.getResponseLength)(verbosity);
    // Read the base prompt template
    const promptPath = path_1.default.join(__dirname, 'prompts', 'summarizationPrompt.md');
    let prompt = '';
    try {
        prompt = fs_1.default.readFileSync(promptPath, 'utf8');
    }
    catch (error) {
        console.error('Error reading summarization prompt file:', error);
        // Fallback to a basic prompt if file reading fails
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
    // Get examples for this voice and verbosity combination
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
    // Replace placeholders with actual values
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
function getExamplesForVoiceAndVerbosity(voice, verbosity) {
    const voiceExamples = voiceExamplesMap[voice];
    if (!voiceExamples) {
        console.warn(`No examples found for voice: ${voice}, falling back to default`);
        return defaultVoiceExamples_1.defaultVoiceExamples.filter(example => example.verbosity === verbosity).slice(0, 7);
    }
    return voiceExamples.filter(example => example.verbosity === verbosity).slice(0, 7);
}
function getAvailableVoices() {
    return ['default', 'cowboy', 'alien', 'pirate', 'robot', 'wizard', 'surfer', 'detective', 'shakespeare'];
}
function getAvailableVerbosities() {
    return ['concise', 'balanced', 'detailed', 'very-detailed'];
}
