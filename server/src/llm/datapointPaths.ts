export const fieldPathMap: Record<string, string> = {
  sleep: `"healthData"->'values'->'sleep'`,
  nutrition: `"healthData"->'values'->'nutrition'`,
  lifestyle: `"healthData"->'values'->'lifestyle'`,
  physicalHealth: `"healthData"->'values'->'physicalHealth'`,
  mentalHealth: `"healthData"->'values'->'mentalHealth'`,
  usedScreenBeforeBed: `"healthData"->'values'->'sleep'->>'usedScreenBeforeBed'`,
  usedScreenAfterWake: `"healthData"->'values'->'sleep'->>'usedScreenAfterWake'`,
  sleptInHomeBed: `"healthData"->'values'->'sleep'->>'sleptInHomeBed'`,
  viewedSunlightWithin30minOfWakeup: `"healthData"->'values'->'sleep'->>'viewedSunlightWithin30minOfWakeup'`,
  hadCaffeineAfter2PM: `"healthData"->'values'->'sleep'->>'hadCaffeineAfter2PM'`,
  watchedSunset: `"healthData"->'values'->'sleep'->>'watchedSunset'`,
  bedtime: `"healthData"->'values'->'sleep'->>'bedtime'`,
  watchSunrise: `"healthData"->'values'->'sleep'->>'watchSunrise'`,
  wakeTime: `"healthData"->'values'->'sleep'->>'wakeTime'`,
  sleepEfficiencyPercent: `"healthData"->'values'->'sleep'->>'sleepEfficiencyPercent'`,
  sleepPerformancePercent: `"healthData"->'values'->'sleep'->>'sleepPerformancePercent'`,
  sleepConsistencyPercent: `"healthData"->'values'->'sleep'->>'sleepConsistencyPercent'`,
  sleepFulfillmentPercent: `"healthData"->'values'->'sleep'->>'sleepFulfillmentPercent'`,
  sleepDebtMinutes: `"healthData"->'values'->'sleep'->>'sleepDebtMinutes'`,
  consumedUltraProcessedFood: `"healthData"->'values'->'nutrition'->>'consumedUltraProcessedFood'`,
  consumedAddedSugar: `"healthData"->'values'->'nutrition'->>'consumedAddedSugar'`,
  consumedAlcohol: `"healthData"->'values'->'nutrition'->>'consumedAlcohol'`,
  consumedDairy: `"healthData"->'values'->'nutrition'->>'consumedDairy'`,
  consumedFruits: `"healthData"->'values'->'nutrition'->>'consumedFruits'`,
  consumedCaffeine: `"healthData"->'values'->'nutrition'->>'consumedCaffeine'`,
  timeOfFirstMeal: `"healthData"->'values'->'nutrition'->>'timeOfFirstMeal'`,
  trackedNutrition: `"healthData"->'values'->'nutrition'->>'trackedNutrition'`,
  timeOfLastMeal: `"healthData"->'values'->'nutrition'->>'timeOfLastMeal'`,
  waterIntakePints: `"healthData"->'values'->'nutrition'->>'waterIntakePints'`,
  proteinGrams: `"healthData"->'values'->'nutrition'->>'proteinGrams'`,
  consumedElectrolytes: `"healthData"->'values'->'nutrition'->>'consumedElectrolytes'`,
  carbGrams: `"healthData"->'values'->'nutrition'->>'carbGrams'`,
  caloriesConsumed: `"healthData"->'values'->'nutrition'->>'caloriesConsumed'`,
  mealsConsumed: `"healthData"->'values'->'nutrition'->>'mealsConsumed'`,
  mealsWithVegetables: `"healthData"->'values'->'nutrition'->>'mealsWithVegetables'`,
  snacked: `"healthData"->'values'->'nutrition'->>'snacked'`,
  totalScreenTimeHours: `"healthData"->'values'->'lifestyle'->>'totalScreenTimeHours'`,
  consumedEntertainmentContent: `"healthData"->'values'->'lifestyle'->>'consumedEntertainmentContent'`,
  didColdTherapy: `"healthData"->'values'->'lifestyle'->>'didColdTherapy'`,
  engagedInCreativeActivity: `"healthData"->'values'->'lifestyle'->>'engagedInCreativeActivity'`,
  practicedMeditation: `"healthData"->'values'->'lifestyle'->>'practicedMeditation'`,
  wroteInJournal: `"healthData"->'values'->'lifestyle'->>'wroteInJournal'`,
  spentQualityTimeWithOthers: `"healthData"->'values'->'lifestyle'->>'spentQualityTimeWithOthers'`,
  spentMostOfDayAlone: `"healthData"->'values'->'lifestyle'->>'spentMostOfDayAlone'`,
  spentDayTraveling: `"healthData"->'values'->'lifestyle'->>'spentDayTraveling'`,
  spentDayAbroad: `"healthData"->'values'->'lifestyle'->>'spentDayAbroad'`,
  spentMostOfDayWorking: `"healthData"->'values'->'lifestyle'->>'spentMostOfDayWorking'`,
  spentMostOfDayAtHome: `"healthData"->'values'->'lifestyle'->>'spentMostOfDayAtHome'`,
  spentMostOfDayAwayFromHome: `"healthData"->'values'->'lifestyle'->>'spentMostOfDayAwayFromHome'`,
  didStrengthTrainingWorkout: `"healthData"->'values'->'physicalHealth'->>'didStrengthTrainingWorkout'`,
  wentForRun: `"healthData"->'values'->'physicalHealth'->>'wentForRun'`,
  didStretchingOrMobility: `"healthData"->'values'->'physicalHealth'->>'didStretchingOrMobility'`,
  stepsTakenThousands: `"healthData"->'values'->'physicalHealth'->>'stepsTakenThousands'`,
  caloriesBurned: `"healthData"->'values'->'physicalHealth'->>'caloriesBurned'`,
  spentTimeOutdoors: `"healthData"->'values'->'physicalHealth'->>'spentTimeOutdoors'`,
  headache: `"healthData"->'values'->'physicalHealth'->>'headache'`,
  stomachAche: `"healthData"->'values'->'physicalHealth'->>'stomachAche'`,
  soreness: `"healthData"->'values'->'physicalHealth'->>'soreness'`,
  sick: `"healthData"->'values'->'physicalHealth'->>'sick'`,
  otherPainOrInjury: `"healthData"->'values'->'physicalHealth'->>'otherPainOrInjury'`,
  tookPainReliefMedication: `"healthData"->'values'->'physicalHealth'->>'tookPainReliefMedication'`,
  tookOtherOTCMedication: `"healthData"->'values'->'physicalHealth'->>'tookOtherOTCMedication'`,
  tookPrescribedMedication: `"healthData"->'values'->'physicalHealth'->>'tookPrescribedMedication'`,
  feltPhysicallyRecovered: `"healthData"->'values'->'physicalHealth'->>'feltPhysicallyRecovered'`,
  restingHR: `"healthData"->'values'->'physicalHealth'->>'restingHR'`,
  heartRateVariability: `"healthData"->'values'->'physicalHealth'->>'heartRateVariability'`,
  whoopStrainScore: `"healthData"->'values'->'physicalHealth'->>'whoopStrainScore'`,
  whoopRecoveryScorePercent: `"healthData"->'values'->'physicalHealth'->>'whoopRecoveryScorePercent'`,
  experiencedStressfulEvent: `"healthData"->'values'->'mentalHealth'->>'experiencedStressfulEvent'`,
  feltIrritable: `"healthData"->'values'->'mentalHealth'->>'feltIrritable'`,
  feltAnxious: `"healthData"->'values'->'mentalHealth'->>'feltAnxious'`,
  feltLonely: `"healthData"->'values'->'mentalHealth'->>'feltLonely'`,
  feltOptimistic: `"healthData"->'values'->'mentalHealth'->>'feltOptimistic'`,
  madeGoalProgress: `"healthData"->'values'->'mentalHealth'->>'madeGoalProgress'`,
  mindWasNotablyClear: `"healthData"->'values'->'mentalHealth'->>'mindWasNotablyClear'`,
  mindWasNotablyFoggy: `"healthData"->'values'->'mentalHealth'->>'mindWasNotablyFoggy'`,
  feltEnergized: `"healthData"->'values'->'mentalHealth'->>'feltEnergized'`,
  feltPurposeful: `"healthData"->'values'->'mentalHealth'->>'feltPurposeful'`,
};
export const categoryFieldMap: Record<string, string[]> = {
  sleep: [
    'usedScreenBeforeBed', 'usedScreenAfterWake', 'sleptInHomeBed', 
    'viewedSunlightWithin30minOfWakeup', 'hadCaffeineAfter2PM', 'watchedSunset', 
    'bedtime', 'watchSunrise', 'wakeTime', 'sleepEfficiencyPercent', 
    'sleepPerformancePercent', 'sleepConsistencyPercent', 'sleepFulfillmentPercent', 
    'sleepDebtMinutes'
  ],
  nutrition: [
    'consumedUltraProcessedFood', 'consumedAddedSugar', 'consumedAlcohol', 
    'consumedDairy', 'consumedFruits', 'consumedCaffeine', 'timeOfFirstMeal', 
    'trackedNutrition', 'timeOfLastMeal', 'waterIntakePints', 'proteinGrams', 
    'consumedElectrolytes', 'carbGrams', 'caloriesConsumed', 'mealsConsumed', 
    'mealsWithVegetables', 'snacked'
  ],
  lifestyle: [
    'totalScreenTimeHours', 'consumedEntertainmentContent', 'didColdTherapy', 
    'engagedInCreativeActivity', 'practicedMeditation', 'wroteInJournal', 
    'spentQualityTimeWithOthers', 'spentMostOfDayAlone', 'spentDayTraveling', 
    'spentDayAbroad', 'spentMostOfDayWorking', 'spentMostOfDayAtHome', 
    'spentMostOfDayAwayFromHome'
  ],
  physicalHealth: [
    'didStrengthTrainingWorkout', 'wentForRun', 'didStretchingOrMobility', 
    'stepsTakenThousands', 'caloriesBurned', 'spentTimeOutdoors', 'headache', 
    'stomachAche', 'soreness', 'sick', 'otherPainOrInjury', 'tookPainReliefMedication', 
    'tookOtherOTCMedication', 'tookPrescribedMedication', 'feltPhysicallyRecovered', 
    'restingHR', 'heartRateVariability', 'whoopStrainScore', 'whoopRecoveryScorePercent'
  ],
  mentalHealth: [
    'experiencedStressfulEvent', 'feltIrritable', 'feltAnxious', 'feltLonely', 
    'feltOptimistic', 'madeGoalProgress', 'mindWasNotablyClear', 'mindWasNotablyFoggy', 
    'feltEnergized', 'feltPurposeful'
  ]
};
export function getFieldPath(fieldName: string): string {
  return fieldPathMap[fieldName] || `"healthData"->'values'->'${fieldName}'`;
}
export function getCategoryFields(categoryName: string): string[] {
  return categoryFieldMap[categoryName] || [];
}
export function isCategory(fieldName: string): boolean {
  return Object.keys(categoryFieldMap).includes(fieldName);
}
export function isDatapoint(fieldName: string): boolean {
  return fieldPathMap.hasOwnProperty(fieldName) && !isCategory(fieldName);
}
export function getDatapointCategory(datapointName: string): string | null {
  for (const [category, fields] of Object.entries(categoryFieldMap)) {
    if (fields.includes(datapointName)) {
      return category;
    }
  }
  return null;
} 