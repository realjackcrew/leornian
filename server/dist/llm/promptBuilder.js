"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDynamicPrompt = buildDynamicPrompt;
exports.getAvailableVoices = getAvailableVoices;
exports.getAvailableVerbosities = getAvailableVerbosities;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const voicePrompts_1 = require("./voicePrompts");
const responsePrompts_1 = require("./responsePrompts");
// Read the base prompt template
const basePrompt = (0, fs_1.readFileSync)(path_1.default.join(__dirname, 'prompt2.md'), 'utf8');
function buildDynamicPrompt(settings = {}) {
    const voice = settings.voice || 'default';
    const verbosity = settings.verbosity || 'balanced';
    const voicePersonality = (0, voicePrompts_1.getVoicePersonality)(voice);
    const responseLength = (0, responsePrompts_1.getResponseLength)(verbosity);
    // Create the personality injection
    const personalitySection = `
## PERSONALITY & COMMUNICATION STYLE

**Voice Personality: ${voicePersonality.name}**
${voicePersonality.personality}

**Communication Examples:**
${voicePersonality.examples}

**Response Length: ${responseLength.name} (${responseLength.characterRange})**
${responseLength.instructions}

**Response Length Example:**
${responseLength.examples}

---
`;
    // Find the insertion point (after the "Response Style Guide" section)
    const insertionPoint = basePrompt.indexOf('## Response Style Guide');
    if (insertionPoint === -1) {
        // If we can't find the insertion point, append to the beginning after overview
        const overviewEnd = basePrompt.indexOf('---\n\n## Database Schema');
        if (overviewEnd !== -1) {
            return basePrompt.slice(0, overviewEnd) + '\n' + personalitySection + basePrompt.slice(overviewEnd);
        }
        else {
            // Fallback: prepend the personality section
            return personalitySection + '\n' + basePrompt;
        }
    }
    // Insert the personality section before the Response Style Guide
    return basePrompt.slice(0, insertionPoint) + personalitySection + basePrompt.slice(insertionPoint);
}
function getAvailableVoices() {
    return ['default', 'cowboy', 'vampire', 'alien', 'pirate', 'robot', 'wizard', 'surfer', 'detective'];
}
function getAvailableVerbosities() {
    return ['concise', 'balanced', 'detailed', 'very-detailed'];
}
