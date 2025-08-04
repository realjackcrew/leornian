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
  const preferences = await database.datapointPreference.findMany({
    where: { 
      userId,
      enabled: true
    },
    select: {
      category: true,
      datapoint: true
    }
  });
  const availableDatapoints: Record<string, string[]> = {};
  Object.keys(masterDatapointDefinitions).forEach(category => {
    availableDatapoints[category] = [];
  });
  preferences.forEach(pref => {
    const category = pref.category as string;
    const datapoint = pref.datapoint as string;
    if (!availableDatapoints[category]) {
      availableDatapoints[category] = [];
    }
    if (datapoint.startsWith('{')) {
      try {
        const definition = JSON.parse(datapoint);
        availableDatapoints[category].push(definition.name);
      } catch (e) {
        console.error('Failed to parse custom datapoint definition:', e);
      }
    } else {
      availableDatapoints[category].push(datapoint);
    }
  });
  if (preferences.length === 0) {
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