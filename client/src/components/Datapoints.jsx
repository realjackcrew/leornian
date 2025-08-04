import { useState, useEffect } from 'react';
import { getEnabledDatapoints } from '../api/datapoints';
const fallbackDataPointDefinitions = {
  sleep: {
    usedScreenBeforeBed: { type: 'boolean', label: 'Used a device within 1 hour of bedtime' },
    usedScreenAfterWake: { type: 'boolean', label: 'Used a device within 30 minutes after waking up' },
    sleptInHomeBed: { type: 'boolean', label: 'Slept in your home bed' },
    viewedSunlightWithin30minOfWakeup: { type: 'boolean', label: 'Viewed sunlight within 30min of wakeup' },
    hadCaffeineAfter2PM: { type: 'boolean', label: 'Had caffeine after 2 PM' },
    watchedSunset: { type: 'boolean', label: 'Watched sunset' },
    bedtime: { type: 'time', label: 'Last night\'s bedtime' },
    watchSunrise: { type: 'boolean', label: 'Watched sunrise' },
    wakeTime: { type: 'time', label: 'This morning\'s wake time' },
    sleepEfficiencyPercent: { type: 'number', label: 'Sleep efficiency (0-100%)', min: 0, max: 100, step: 1 },
    sleepPerformancePercent: { type: 'number', label: 'Sleep performance (0-100%)', min: 0, max: 100, step: 1 },
    sleepFulfillmentPercent: { type: 'number', label: 'Sleep achieved / sleep needed (0-100%)', min: 0, max: 100, step: 1 },
    sleepDebtMinutes: { type: 'number', label: 'Sleep debt (minutes)', min: 0, max: 200, step: 1 }
  },
  nutrition: {
    consumedUltraProcessedFood: { type: 'boolean', label: 'Consumed ultra-processed food' },
    consumedAddedSugar: { type: 'boolean', label: 'Consumed added sugar' },
    consumedAlcohol: { type: 'boolean', label: 'Consumed alcohol' },
    consumedDairy: { type: 'boolean', label: 'Consumed dairy' },
    consumedFruits: { type: 'boolean', label: 'Consumed fruits' },
    consumedCaffeine: { type: 'boolean', label: 'Consumed caffeine' },
    timeOfFirstMeal: { type: 'time', label: 'First meal of the day' },
    trackedNutrition: { type: 'boolean', label: 'Tracked nutrition' },
    timeOfLastMeal: { type: 'time', label: 'Last meal of the day' },
    waterIntakePints: { type: 'number', label: 'Water intake (pints)', min: 0, max: 15, step: 1 },
    proteinGrams: { type: 'number', label: 'Protein intake (grams)' },
    consumedElectrolytes: { type: 'boolean', label: 'Consumed electrolytes' },
    carbGrams: { type: 'number', label: 'Carb intake (grams)' },
    caloriesConsumed: { type: 'number', label: 'Calories consumed', min: 0, max: 3000, step: 1 },
    mealsConsumed: { type: 'number', label: 'Meals consumed', min: 0, max: 5, step: 1 },
    mealsWithVegetables: { type: 'number', label: 'Meals with vegetables', min: 0, max: 5, step: 1 },
    snacked: { type: 'boolean', label: 'Snacked (ate one non-meal item)' }
  },
  lifestyle: {
    totalScreenTimeHours: { type: 'number', label: 'Total screen time (hours)', min: 0, max: 16, step: 0.5 },
    consumedEntertainmentContent: { type: 'boolean', label: 'Consumed entertainment content' },
    didColdTherapy: { type: 'boolean', label: 'Cold shower/plunge' },
    engagedInCreativeActivity: { type: 'boolean', label: 'Engaged in creative activity' },
    practicedMeditation: { type: 'boolean', label: 'Practiced meditation' },
    wroteInJournal: { type: 'boolean', label: 'Wrote in a journal' },
    spentQualityTimeWithOthers: { type: 'boolean', label: 'Spent quality time with others' },
    spentMostOfDayAlone: { type: 'boolean', label: 'Spent most of the day alone' },
    spentDayTraveling: { type: 'boolean', label: 'Spent day traveling' },
    spentDayAbroad: { type: 'boolean', label: 'Spent day abroad' },
    spentMostOfDayWorking: { type: 'boolean', label: 'Worked' },
    spentMostOfDayAtHome: { type: 'boolean', label: 'Spent most of the day at home' },
    spentMostOfDayAwayFromHome: { type: 'boolean', label: 'Spent most of the day away from home' },
  },
  physicalHealth: {
    didStrengthTrainingWorkout: { type: 'boolean', label: 'Completed strength training workout' },
    wentForRun: { type: 'boolean', label: 'Completed run' },
    didStretchingOrMobility: { type: 'boolean', label: 'Did stretching/mobility work' },
    stepsTakenThousands: { type: 'number', label: 'Steps (thousands)', min: 0, max: 40, step: 1 },
    caloriesBurned: { type: 'number', label: 'Calories burned', min: 0, max: 3000, step: 1 },
    spentTimeOutdoors: { type: 'boolean', label: 'Spent time outdoors' },
    headache: { type: 'boolean', label: 'Experienced headache' },
    stomachAche: { type: 'boolean', label: 'Experienced stomach ache/vomiting' },
    soreness: { type: 'boolean', label: 'Experienced soreness' },
    sick: { type: 'boolean', label: 'Currently sick or injured' },
    otherPainOrInjury: { type: 'boolean', label: 'Experienced other minor pain/injury' },
    tookPainReliefMedication: { type: 'boolean', label: 'Took pain relief medication' },
    tookOtherOTCMedication: { type: 'boolean', label: 'Took other over-the-counter medication' },
    tookPrescribedMedication: { type: 'boolean', label: 'Took prescription medication' },
    feltPhysicallyRecovered: { type: 'boolean', label: 'Felt physically recovered' },
    restingHR: { type: 'number', label: 'Resting heart rate', min: 35, max: 70, step: 1 },
    heartRateVariability: { type: 'number', label: 'Heart rate variability', min: 10, max: 100, step: 5 },
    whoopStrainScore: { type: 'number', label: 'Whoop Strain', min: 0, max: 25, step: 0.5 },
    whoopRecoveryScorePercent: { type: 'number', label: 'Recovery Score (0-100%)', min: 0, max: 100, step: 1 }
  },
  mentalHealth: {
    experiencedStressfulEvent: { type: 'boolean', label: 'Experienced stressful event' },
    feltIrritable: { type: 'boolean', label: 'Felt unexplainably irritable' },
    feltAnxious: { type: 'boolean', label: 'Felt anxious' },
    feltLonely: { type: 'boolean', label: 'Felt lonely' },
    feltOptimistic: { type: 'boolean', label: 'Felt optimistic' },
    madeGoalProgress: { type: 'boolean', label: 'Made progress on significant goal' },
    mindWasNotablyClear: { type: 'boolean', label: 'Mind was noticeably clear' },
    mindWasNotablyFoggy: { type: 'boolean', label: 'Mind was noticeably foggy' },
    feltEnergized: { type: 'boolean', label: 'Felt energized' },
    feltPurposeful: { type: 'boolean', label: 'Strong sense of purpose' },
  },
};
export const useEnabledDatapoints = () => {
  const [dataPointDefinitions, setDataPointDefinitions] = useState(fallbackDataPointDefinitions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchDatapoints = async () => {
      try {
        setLoading(true);
        const enabledDatapoints = await getEnabledDatapoints();
        setDataPointDefinitions(enabledDatapoints);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch enabled datapoints:', err);
        setError(err.message);
        setDataPointDefinitions(fallbackDataPointDefinitions);
      } finally {
        setLoading(false);
      }
    };
    fetchDatapoints();
  }, []);
  return { dataPointDefinitions, loading, error };
};
export const dataPointDefinitions = fallbackDataPointDefinitions;
export const getDefaultValues = (definitions = dataPointDefinitions) => {
  const values = {};
  Object.entries(definitions).forEach(([category, dataPoints]) => {
    values[category] = {};
    Object.entries(dataPoints).forEach(([key, def]) => {
      values[category][key] = def.type === 'boolean' ? null : def.min;
    });
  });
  return values;
};
export const getCategoryNames = (definitions = dataPointDefinitions) => {
  return Object.keys(definitions).map(key => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
  }));
};
