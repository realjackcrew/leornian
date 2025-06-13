// Data point definitions
export const dataPointDefinitions = {
  sleep: {
    screenBeforeBed: { type: 'boolean', label: 'Used a device within 1 hour of bedtime' },
    screenAfterBed: { type: 'boolean', label: 'Used a device within 30 minutes after waking up' },
    homeBed: { type: 'boolean', label: 'Slept in your home bed' },
    sunlightWakeup: { type: 'boolean', label: 'Viewed sunlight within 30min of waking up' },
    caffeineLate: { type: 'boolean', label: 'Had caffeine after 2 PM' },
    watchSunset: { type: 'boolean', label: 'Watched sunset' },
    watchSunrise: { type: 'boolean', label: 'Watched sunrise' },
    bedTime: { type: 'number', label: 'Bedtime (hour)', min: 18, max: 27, step: 0.5 },
    wakeTime: { type: 'number', label: 'Wake time (hour)', min: 4, max: 12, step: 0.5 },
    sleepEfficiency: { type: 'number', label: 'Sleep efficiency (0-100%)', min: 0, max: 100, step: 1 },
    sleepFulfillment: { type: 'number', label: 'Sleep achieved / sleep needed (0-100%)', min: 0, max: 100, step: 1 },
    sleepDebt: { type: 'number', label: 'Sleep debt (hours)', min: 0, max: 6, step: 0.25 }
  },
  nutrition: {
    fastFood: { type: 'boolean', label: 'Consumed ultra-processed food' },
    addedSugar: { type: 'boolean', label: 'Consumed added sugar' },
    alcohol: { type: 'boolean', label: 'Consumed alcohol' },
    dairy: { type: 'boolean', label: 'Consumed dairy' },
    fruits: { type: 'boolean', label: 'Consumed fruits' },
    caffeine: { type: 'boolean', label: 'Consumed caffeine' },
    trackedNutrition: { type: 'boolean', label: 'Tracked nutrition' },
    timeOfFirstMeal: { type: 'number', label: 'Time of first meal (hour)', min: 0, max: 24, step: 0.5 },
    timeOfLastMeal: { type: 'number', label: 'Time of last meal (hour)', min: 0, max: 24, step: 0.5 },
    waterIntake: { type: 'number', label: 'Water intake (pints)', min: 0, max: 15, step: 1 },
    electrolytes: { type: 'boolean', label: 'Consumed electrolytes' },
    proteinGrams: { type: 'number', label: 'Protein intake (grams)', min: 0, max: 200, step: 1 },
    carbGrams: { type: 'number', label: 'Carb intake (grams)', min: 0, max: 400, step: 1 },
    caloriesConsumed: { type: 'number', label: 'Calories consumed', min: 0, max: 3000, step: 1 },
    mealCount: { type: 'number', label: 'Meals consumed', min: 0, max: 5, step: 1 },
    mealsWithVegetables: { type: 'number', label: 'Meals with vegetables', min: 0, max: 5, step: 1 },
    snacking: { type: 'boolean', label: 'Snacked (ate one non-meal item)' }
  },
  lifestyle: {
    screenTime: { type: 'number', label: 'Total screen time (hours)', min: 0, max: 16, step: 0.5 },
    consumedContent: { type: 'boolean', label: 'Consumed content' },
    coldTherapy: { type: 'boolean', label: 'Cold shower/plunge' },
    creativityTime: { type: 'boolean', label: 'Engaged in creative activity' },
    meditation: { type: 'boolean', label: 'Practiced meditation' },
    journaling: { type: 'boolean', label: 'Wrote in a journal' },
    socialTime: { type: 'boolean', label: 'Spent quality time with others' },
    aloneTime: { type: 'boolean', label: 'Spent most of the day alone' },
    travel: { type: 'boolean', label: 'Spent day traveling' },
    abroad: { type: 'boolean', label: 'Spent day abroad' },
    work: { type: 'boolean', label: 'Worked' },
    home: { type: 'boolean', label: 'Spent most of the day at home' },
    awayFromHome: { type: 'boolean', label: 'Spent most of the day away from home' },
  },
  physicalHealth: {
    workout: { type: 'boolean', label: 'Completed strength training workout' },
    run: { type: 'boolean', label: 'Completed run' },
    stretching: { type: 'boolean', label: 'Did stretching/mobility work' },
    steps: { type: 'number', label: 'Steps (thousands)', min: 0, max: 40, step: 1 },
    caloriesBurned: { type: 'number', label: 'Calories burned', min: 0, max: 3000, step: 1 },
    outdoorActivity: { type: 'boolean', label: 'Spent time outdoors' },
    headache: { type: 'boolean', label: 'Experienced headache' },
    stomachAche: { type: 'boolean', label: 'Experienced stomach ache/vomiting' },
    soreness: { type: 'boolean', label: 'Experienced soreness' },
    sick: { type: 'boolean', label: 'Currently sick or injured' },
    painOrInjury: { type: 'boolean', label: 'Experienced other minor pain/injury' },
    painRelief: { type: 'boolean', label: 'Took pain relief medication' },
    overTheCounter: { type: 'boolean', label: 'Took other over-the-counter medication' },
    prescription: { type: 'boolean', label: 'Took prescription medication' },
    recovered: { type: 'boolean', label: 'Felt physically recovered' },
    restingHR: { type: 'number', label: 'Resting heart rate', min: 35, max: 70, step: 1 },
    hrv: { type: 'number', label: 'Heart rate variability', min: 10, max: 100, step: 5 },
    strain: { type: 'number', label: 'Whoop Strain', min: 0, max: 25, step: 0.5 },
    recoveryScore: { type: 'number', label: 'Recovery Score (0-100%)', min: 0, max: 100, step: 1 }
  },
  mentalHealth: {
    stressfulEvent: { type: 'boolean', label: 'Experienced stressful event' },
    irritability: { type: 'boolean', label: 'Felt unexplainably irritable' },
    anxiety: { type: 'boolean', label: 'Felt anxious' },
    loneliness: { type: 'boolean', label: 'Felt lonely' },
    optimism: { type: 'boolean', label: 'Felt optimistic' },
    progress: { type: 'boolean', label: 'Progress was made on significant goal' },
    clarity: { type: 'boolean', label: 'Mind was noticeably clear' },
    foggy: { type: 'boolean', label: 'Mind was noticeably foggy' },
    energy: { type: 'boolean', label: 'Felt energized' },
    purpose: { type: 'boolean', label: 'Strong sense of purpose' },
  },
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
