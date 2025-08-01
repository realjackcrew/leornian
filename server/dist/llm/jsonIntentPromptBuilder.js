"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildJsonIntentPrompt = buildJsonIntentPrompt;
const fs_1 = require("fs");
const path_1 = require("path");
const database_1 = __importDefault(require("../db/database"));
const datapointDefinitions_1 = require("./datapointDefinitions");
async function buildJsonIntentPrompt(settings) {
    const { userId } = settings;
    // Get today's date in a readable format
    const today = new Date();
    const todayFormatted = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    // Get user's enabled datapoints (including custom ones)
    const preferences = await database_1.default.datapointPreference.findMany({
        where: {
            userId,
            enabled: true
        },
        select: {
            category: true,
            datapoint: true
        }
    });
    // Build the available datapoints string
    const availableDatapoints = {};
    // Initialize with all categories
    Object.keys(datapointDefinitions_1.masterDatapointDefinitions).forEach(category => {
        availableDatapoints[category] = [];
    });
    // Add enabled datapoints
    preferences.forEach(pref => {
        const category = pref.category;
        const datapoint = pref.datapoint;
        if (!availableDatapoints[category]) {
            availableDatapoints[category] = [];
        }
        // Handle custom datapoints (stored as JSON in datapoint field)
        if (datapoint.startsWith('{')) {
            try {
                const definition = JSON.parse(datapoint);
                availableDatapoints[category].push(definition.name);
            }
            catch (e) {
                console.error('Failed to parse custom datapoint definition:', e);
            }
        }
        else {
            // Handle standard datapoints
            availableDatapoints[category].push(datapoint);
        }
    });
    // If no preferences found, include all standard datapoints
    if (preferences.length === 0) {
        Object.keys(datapointDefinitions_1.masterDatapointDefinitions).forEach(category => {
            availableDatapoints[category] = Object.keys(datapointDefinitions_1.masterDatapointDefinitions[category]);
        });
    }
    // Format the datapoints string
    let datapointsString = '';
    Object.entries(availableDatapoints).forEach(([category, datapoints]) => {
        if (datapoints.length > 0) {
            datapointsString += `**${category}**\n\n- ${datapoints.join(', ')}\n\n`;
        }
    });
    // Read the prompt template
    const promptPath = (0, path_1.join)(__dirname, 'prompts', 'mainJsonIntentPrompt.md');
    let prompt = (0, fs_1.readFileSync)(promptPath, 'utf8');
    // Replace placeholders
    prompt = prompt
        .replace('{{AVAILABLE_DATAPOINTS}}', datapointsString)
        .replace('{{TODAYS_DATE}}', todayFormatted);
    return prompt;
}
