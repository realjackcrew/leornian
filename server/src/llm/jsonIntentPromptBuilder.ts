import { readFileSync } from 'fs';
import { join } from 'path';
import database from '../db/database';
import { masterDatapointDefinitions } from './datapointDefinitions';
export interface JsonIntentPromptSettings {
  userId: string;
}
export async function buildJsonIntentPrompt(settings: JsonIntentPromptSettings): Promise<string> {
  const { userId } = settings;
  const today = new Date();
  const todayFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const userDatapoints = await database.userDatapoint.findMany({
    where: { 
      userId,
      enabled: true
    },
    select: {
      category: true,
      name: true
    }
  });
  const availableDatapoints: Record<string, string[]> = {};
  Object.keys(masterDatapointDefinitions).forEach(category => {
    availableDatapoints[category] = [];
  });
  userDatapoints.forEach((datapoint: { category: string; name: string }) => {
    const category = datapoint.category;
    const name = datapoint.name;
    if (!availableDatapoints[category]) {
      availableDatapoints[category] = [];
    }
    availableDatapoints[category].push(name);
  });
  if (userDatapoints.length === 0) {
    Object.keys(masterDatapointDefinitions).forEach(category => {
      availableDatapoints[category] = Object.keys(masterDatapointDefinitions[category as keyof typeof masterDatapointDefinitions]);
    });
  }
  let datapointsString = '';
  Object.entries(availableDatapoints).forEach(([category, datapoints]) => {
    if (datapoints.length > 0) {
      datapointsString += `**${category}**\n\n- ${datapoints.join(', ')}\n\n`;
    }
  });
  const promptPath = join(__dirname, 'prompts', 'mainJsonIntentPrompt.md');
  let prompt = readFileSync(promptPath, 'utf8');
  prompt = prompt
    .replace('{{AVAILABLE_DATAPOINTS}}', datapointsString)
    .replace('{{TODAYS_DATE}}', todayFormatted);
  return prompt;
} 