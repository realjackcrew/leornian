// Data point definitions
export const dataPointDefinitions = {
  sleep: {
    screenInBed: { type: 'boolean', label: 'Used screen device in bed' },
    homeBed: { type: 'boolean', label: 'Slept in your home bed' },
    sunlightWakeup: { type: 'boolean', label: 'Viewed sunlight within 30min of wakeup' },
    sleepMeditation: { type: 'boolean', label: 'Did sleep meditation/relaxation' },
    caffeineLate: { type: 'boolean', label: 'Had caffeine after 2 PM' },
    sleepHours: { type: 'number', label: 'Hours of sleep', min: 0, max: 12, step: 0.5 },
    bedTime: { type: 'number', label: 'Bedtime (hour)', min: 18, max: 26, step: 0.5 },
    wakeTime: { type: 'number', label: 'Wake time (hour)', min: 4, max: 12, step: 0.5 },
    sleepQuality: { type: 'number', label: 'Sleep quality (1-10)', min: 1, max: 10, step: 1 }
  },
  nutrition: {
    vegetables: { type: 'boolean', label: 'Ate 5+ servings of vegetables' },
    fastFood: { type: 'boolean', label: 'Had fast food' },
    cookAtHome: { type: 'boolean', label: 'Cooked meal at home' },
    vitamins: { type: 'boolean', label: 'Took vitamins/supplements' },
    alcohol: { type: 'boolean', label: 'Consumed alcohol' },
    waterIntake: { type: 'number', label: 'Water intake (glasses)', min: 0, max: 15, step: 1 },
    mealsBetweenSleep: { type: 'number', label: 'Hours between last meal and sleep', min: 0, max: 8, step: 0.5 },
    proteinServings: { type: 'number', label: 'Protein servings', min: 0, max: 6, step: 1 },
    sugarCravings: { type: 'number', label: 'Sugar cravings (1-10)', min: 1, max: 10, step: 1 }
  },
  mentalHealth: {
    meditation: { type: 'boolean', label: 'Practiced meditation' },
    journaling: { type: 'boolean', label: 'Did journaling' },
    socialTime: { type: 'boolean', label: 'Spent quality time with others' },
    stressfulEvent: { type: 'boolean', label: 'Experienced stressful event' },
    gratitudePractice: { type: 'boolean', label: 'Practiced gratitude' },
    moodRating: { type: 'number', label: 'Overall mood (1-10)', min: 1, max: 10, step: 1 },
    anxietyLevel: { type: 'number', label: 'Anxiety level (1-10)', min: 1, max: 10, step: 1 },
    focusScore: { type: 'number', label: 'Focus/concentration (1-10)', min: 1, max: 10, step: 1 },
    energyLevel: { type: 'number', label: 'Energy level (1-10)', min: 1, max: 10, step: 1 }
  },
  physicalHealth: {
    exercise: { type: 'boolean', label: 'Did structured exercise' },
    medication: { type: 'boolean', label: 'Took prescribed medication' },
    stretching: { type: 'boolean', label: 'Did stretching/mobility work' },
    outdoorActivity: { type: 'boolean', label: 'Spent time outdoors' },
    painOrDiscomfort: { type: 'boolean', label: 'Experienced pain/discomfort' },
    exerciseMinutes: { type: 'number', label: 'Exercise duration (minutes)', min: 0, max: 180, step: 15 },
    steps: { type: 'number', label: 'Steps (thousands)', min: 0, max: 25, step: 1 },
    hrv: { type: 'number', label: 'HRV (if tracked)', min: 10, max: 100, step: 5 },
    restingHR: { type: 'number', label: 'Resting heart rate', min: 40, max: 100, step: 1 }
  },
  lifestyle: {
    screenBreaks: { type: 'boolean', label: 'Took regular screen breaks' },
    coldTherapy: { type: 'boolean', label: 'Did cold therapy (shower/bath)' },
    sauna: { type: 'boolean', label: 'Used sauna/heat therapy' },
    massage: { type: 'boolean', label: 'Had massage/self-massage' },
    creativityTime: { type: 'boolean', label: 'Engaged in creative activity' },
    screenTime: { type: 'number', label: 'Total screen time (hours)', min: 0, max: 16, step: 0.5 },
    stressLevel: { type: 'number', label: 'Stress level (1-10)', min: 1, max: 10, step: 1 },
    productivityScore: { type: 'number', label: 'Productivity score (1-10)', min: 1, max: 10, step: 1 },
    recoveryScore: { type: 'number', label: 'Recovery feeling (1-10)', min: 1, max: 10, step: 1 }
  }
};

// Helper function to get default values for all data points
export const getDefaultValues = () => {
  const values = {};
  Object.entries(dataPointDefinitions).forEach(([category, dataPoints]) => {
    values[category] = {};
    Object.entries(dataPoints).forEach(([key, def]) => {
      values[category][key] = def.type === 'boolean' ? null : def.min;
    });
  });
  return values;
};

// Helper function to get category names in a display-friendly format
export const getCategoryNames = () => {
  return Object.keys(dataPointDefinitions).map(key => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
  }));
};
