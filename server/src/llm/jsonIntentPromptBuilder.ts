import { readFileSync } from 'fs';
import { join } from 'path';
import database from '../db/database';
import { masterDatapointDefinitions } from './datapointDefinitions';

export interface JsonIntentPromptSettings {
  userId: string;
}

export async function buildJsonIntentPrompt(settings: JsonIntentPromptSettings): Promise<string> {
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

  // Build the available datapoints string
  const availableDatapoints: Record<string, string[]> = {};
  
  // Initialize with all categories
  Object.keys(masterDatapointDefinitions).forEach(category => {
    availableDatapoints[category] = [];
  });

  // Add enabled datapoints
  preferences.forEach(pref => {
    const category = pref.category as string;
    const datapoint = pref.datapoint as string;
    
    if (!availableDatapoints[category]) {
      availableDatapoints[category] = [];
    }
    
    // Handle custom datapoints (stored as JSON in datapoint field)
    if (datapoint.startsWith('{')) {
      try {
        const definition = JSON.parse(datapoint);
        availableDatapoints[category].push(definition.name);
      } catch (e) {
        console.error('Failed to parse custom datapoint definition:', e);
      }
    } else {
      // Handle standard datapoints
      availableDatapoints[category].push(datapoint);
    }
  });

  // If no preferences found, include all standard datapoints
  if (preferences.length === 0) {
    Object.keys(masterDatapointDefinitions).forEach(category => {
      availableDatapoints[category] = Object.keys(masterDatapointDefinitions[category as keyof typeof masterDatapointDefinitions]);
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
  const promptPath = join(__dirname, 'mainJsonIntentPrompt.md');
  let prompt = readFileSync(promptPath, 'utf8');

  // Replace placeholders
  prompt = prompt
    .replace('{{AVAILABLE_DATAPOINTS}}', datapointsString)
    .replace('{{TODAYS_DATE}}', todayFormatted);

  return prompt;
} 