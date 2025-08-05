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
    const today = new Date();
    const todayFormatted = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const userDatapoints = await database_1.default.userDatapoint.findMany({
        where: {
            userId,
            enabled: true
        },
        select: {
            category: true,
            name: true
        }
    });
    const availableDatapoints = {};
    Object.keys(datapointDefinitions_1.masterDatapointDefinitions).forEach(category => {
        availableDatapoints[category] = [];
    });
    userDatapoints.forEach((datapoint) => {
        const category = datapoint.category;
        const name = datapoint.name;
        if (!availableDatapoints[category]) {
            availableDatapoints[category] = [];
        }
        availableDatapoints[category].push(name);
    });
    if (userDatapoints.length === 0) {
        Object.keys(datapointDefinitions_1.masterDatapointDefinitions).forEach(category => {
            availableDatapoints[category] = Object.keys(datapointDefinitions_1.masterDatapointDefinitions[category]);
        });
    }
    let datapointsString = '';
    Object.entries(availableDatapoints).forEach(([category, datapoints]) => {
        if (datapoints.length > 0) {
            datapointsString += `**${category}**\n\n- ${datapoints.join(', ')}\n\n`;
        }
    });
    const promptPath = (0, path_1.join)(__dirname, 'prompts', 'mainJsonIntentPrompt.md');
    let prompt = (0, fs_1.readFileSync)(promptPath, 'utf8');
    prompt = prompt
        .replace('{{AVAILABLE_DATAPOINTS}}', datapointsString)
        .replace('{{TODAYS_DATE}}', todayFormatted);
    return prompt;
}
