import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import database from '../db/database';

const router = Router();

// Master datapoint definitions - this should be the source of truth
const masterDatapointDefinitions = {
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

// GET /api/datapoints/definitions - Get master datapoint definitions
router.get('/definitions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(masterDatapointDefinitions);
  } catch (err) {
    console.error('Get datapoint definitions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/datapoints/preferences - Get user's datapoint preferences
router.get('/preferences', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const preferences = await database.datapointPreference.findMany({
      where: { userId },
      select: {
        category: true,
        datapoint: true,
        enabled: true
      }
    });

    // Convert to the format expected by the frontend
    const preferencesMap: Record<string, Record<string, boolean>> = {};
    preferences.forEach(pref => {
      if (!preferencesMap[pref.category]) {
        preferencesMap[pref.category] = {};
      }
      preferencesMap[pref.category][pref.datapoint] = pref.enabled;
    });

    res.json(preferencesMap);
  } catch (err) {
    console.error('Get datapoint preferences error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/datapoints/preferences - Save user's datapoint preferences
router.post('/preferences', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      res.status(400).json({ error: 'Invalid preferences format' });
      return;
    }

    // Start a transaction to update all preferences
    await database.$transaction(async (tx) => {
      // Delete existing preferences for this user
      await tx.datapointPreference.deleteMany({
        where: { userId }
      });

      // Insert new preferences
      const preferencesToInsert: Array<{
        userId: string;
        category: string;
        datapoint: string;
        enabled: boolean;
      }> = [];
      
      Object.entries(preferences).forEach(([category, datapoints]) => {
        if (typeof datapoints === 'object' && datapoints !== null) {
          Object.entries(datapoints as Record<string, unknown>).forEach(([datapoint, enabled]) => {
            if (typeof enabled === 'boolean' && category && datapoint) {
              preferencesToInsert.push({
                userId,
                category,
                datapoint,
                enabled
              });
            }
          });
        }
      });

      if (preferencesToInsert.length > 0) {
        await tx.datapointPreference.createMany({
          data: preferencesToInsert
        });
      }
    });

    res.json({ message: 'Datapoint preferences saved successfully' });
  } catch (err) {
    console.error('Save datapoint preferences error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/datapoints/enabled - Get only enabled datapoints for the user
router.get('/enabled', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    
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

    // If no preferences found, return all datapoints as enabled by default
    if (preferences.length === 0) {
      res.json(masterDatapointDefinitions);
      return;
    }

    // Filter master definitions to only include enabled datapoints
    const enabledDatapoints: Record<string, Record<string, any>> = {};
    preferences.forEach(pref => {
      if (!enabledDatapoints[pref.category]) {
        enabledDatapoints[pref.category] = {};
      }
      const category = pref.category as string;
      const datapoint = pref.datapoint as string;
      const categoryDefinitions = masterDatapointDefinitions[category as keyof typeof masterDatapointDefinitions];
      if (categoryDefinitions && categoryDefinitions[datapoint as keyof typeof categoryDefinitions]) {
        enabledDatapoints[category][datapoint] = categoryDefinitions[datapoint as keyof typeof categoryDefinitions];
      }
    });

    res.json(enabledDatapoints);
  } catch (err) {
    console.error('Get enabled datapoints error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 