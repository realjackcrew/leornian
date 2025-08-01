"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizationExamples = void 0;
exports.getExamplesForVoiceAndVerbosity = getExamplesForVoiceAndVerbosity;
exports.summarizationExamples = [
    // DEFAULT VOICE - CONCISE
    {
        voice: 'default',
        verbosity: 'concise',
        userQuestion: "How's my sleep this week?",
        data: "Sleep efficiency: 89% avg, Duration: 7.8 hours avg, Recovery: 85% avg",
        response: "Great sleep week! **89%** efficiency and **7.8 hours** average duration are excellent. Your **85%** recovery shows good rest quality. Keep up this consistent pattern!",
        extensionQueries: [
            "How does my bedtime consistency correlate with recovery scores?",
            "What are the trends in sleep efficiency over the past month?",
            "Which sleep factors show the strongest relationship with morning energy?"
        ]
    },
    {
        voice: 'default',
        verbosity: 'concise',
        userQuestion: "Am I hitting my nutrition goals?",
        data: "Calories: 2,100 (target: 2,000), Protein: 85g (target: 90g), Vegetables: 6 servings (target: 5)",
        response: "You're doing great! **2,100** calories is close to target, and **6 servings** of vegetables exceed goals. Just need a bit more protein - you're at **85g** vs **90g** target.",
        extensionQueries: [
            "How does my protein intake correlate with recovery scores?",
            "What are the trends in vegetable consumption over the past two weeks?",
            "Which nutrition factors show the strongest relationship with energy levels?"
        ]
    },
    {
        voice: 'default',
        verbosity: 'concise',
        userQuestion: "What's my workout pattern?",
        data: "3 workouts/week, 45 min avg duration, Strength/Cardio mix, Recovery: 78% avg",
        response: "Solid **3-day** routine with good variety! **45-minute** sessions show good intensity. Your **78%** recovery suggests challenging but manageable workouts. Great consistency!",
        extensionQueries: [
            "How does workout intensity correlate with next-day recovery?",
            "What are the trends in recovery time after different workout types?",
            "Which exercise factors show the strongest relationship with sleep quality?"
        ]
    },
    // DEFAULT VOICE - BALANCED
    {
        voice: 'default',
        verbosity: 'balanced',
        userQuestion: "How did my sleep look this week?",
        data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
        response: "Looking at your sleep data this week, I can see some really positive patterns! Your average sleep efficiency of **89%** is excellent, and you're consistently getting 7.5-8.2 hours of quality rest. Your recovery scores are strong too, averaging **88%** - that's fantastic! The consistency in your sleep schedule is really paying off.",
        extensionQueries: [
            "How does my bedtime consistency correlate with recovery scores?",
            "What are the trends in sleep efficiency over the past month?",
            "Which sleep factors show the strongest relationship with morning energy levels?"
        ]
    },
    {
        voice: 'default',
        verbosity: 'balanced',
        userQuestion: "How is my stress management working?",
        data: "Stress Level: 4.2 avg (down from 6.1), Meditation: 5/week, Journaling: 3/week, Outdoor Time: 2.5 hours/week",
        response: "Your stress management is working really well! Your stress levels have dropped significantly from **6.1** to **4.2** - that's a **31%** improvement! Your meditation practice at **5 sessions/week** and journaling at **3 sessions/week** are creating a solid foundation. The **2.5 hours** of outdoor time each week is also contributing to your improved mental state.",
        extensionQueries: [
            "How does meditation frequency correlate with stress level fluctuations?",
            "What are the trends in sleep quality when outdoor time increases?",
            "Which stress management factors show the strongest relationship with recovery scores?"
        ]
    },
    {
        voice: 'default',
        verbosity: 'balanced',
        userQuestion: "What's my average recovery score this month?",
        data: "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"avg_recovery\": 87.2,\n      \"total_days\": 30,\n      \"days_above_90\": 8,\n      \"days_below_80\": 3,\n      \"best_day\": 95,\n      \"worst_day\": 72\n    }\n  ],\n  \"metadata\": {\n    \"query\": \"SELECT AVG(CAST(healthData->'values'->'physicalHealth'->>'whoopRecoveryScorePercent' AS DECIMAL)) as avg_recovery, COUNT(*) as total_days, COUNT(CASE WHEN CAST(healthData->'values'->'physicalHealth'->>'whoopRecoveryScorePercent' AS DECIMAL) > 90 THEN 1 END) as days_above_90, COUNT(CASE WHEN CAST(healthData->'values'->'physicalHealth'->>'whoopRecoveryScorePercent' AS DECIMAL) < 80 THEN 1 END) as days_below_80, MAX(CAST(healthData->'values'->'physicalHealth'->>'whoopRecoveryScorePercent' AS DECIMAL)) as best_day, MIN(CAST(healthData->'values'->'physicalHealth'->>'whoopRecoveryScorePercent' AS DECIMAL)) as worst_day FROM DailyLog WHERE userId = $1 AND date >= $2 AND date <= $3\",\n    \"params\": [\"user123\", \"2025-01-01\", \"2025-01-31\"]\n  }\n}",
        response: "Your recovery scores this month are looking really strong! You averaged **87.2%** recovery across all 30 days, which is excellent. You had **8 days** where you hit above 90% recovery - that's fantastic! Only **3 days** dipped below 80%, showing good consistency. Your best day hit **95%** recovery, while your lowest was **72%**. Overall, you're maintaining a solid recovery pattern that suggests good sleep, stress management, and exercise balance.",
        extensionQueries: [
            "How does my recovery score correlate with my sleep efficiency on the same days?",
            "What are the trends in recovery scores when I exercise vs rest days?",
            "Which lifestyle factors show the strongest relationship with recovery performance?"
        ]
    },
    {
        voice: 'default',
        verbosity: 'balanced',
        userQuestion: "How many days did I sleep less than 7 hours?",
        data: "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"days_with_less_than_7_hours\": 12,\n      \"total_days\": 30,\n      \"percentage\": 40.0,\n      \"avg_sleep_hours\": 7.3,\n      \"most_common_bedtime\": \"23:30\",\n      \"most_common_wake_time\": \"06:45\"\n    }\n  ],\n  \"metadata\": {\n    \"query\": \"SELECT COUNT(*) as days_with_less_than_7_hours, COUNT(*) OVER() as total_days, ROUND(COUNT(*) * 100.0 / COUNT(*) OVER(), 1) as percentage, ROUND(AVG(CAST(healthData->'values'->'sleep'->>'sleepDurationMinutes' AS DECIMAL) / 60.0), 1) as avg_sleep_hours, MODE() WITHIN GROUP (ORDER BY healthData->'values'->'sleep'->>'bedtime') as most_common_bedtime, MODE() WITHIN GROUP (ORDER BY healthData->'values'->'sleep'->>'wakeTime') as most_common_wake_time FROM DailyLog WHERE userId = $1 AND CAST(healthData->'values'->'sleep'->>'sleepDurationMinutes' AS DECIMAL) < 420\",\n    \"params\": [\"user123\", \"2025-01-01\", \"2025-01-31\"]\n  }\n}",
        response: "You slept less than 7 hours on **12 out of 30 days** this month, which is **40%** of the time. Your average sleep duration is **7.3 hours**, so you're generally getting good sleep, but there's room for improvement. Your most common bedtime is **11:30 PM** and wake time is **6:45 AM**, which suggests a consistent schedule. To improve your sleep duration, you might want to consider going to bed a bit earlier or adjusting your wake time.",
        extensionQueries: [
            "How does my sleep duration correlate with my recovery scores the next day?",
            "What are the trends in sleep duration when I have stressful events?",
            "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
        ]
    },
    {
        voice: 'default',
        verbosity: 'balanced',
        userQuestion: "What's my weekly average calorie intake?",
        data: "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"week\": \"2025-01-01\",\n      \"avg_calories\": 2150,\n      \"avg_protein\": 88,\n      \"avg_water\": 8.2,\n      \"days_tracked\": 7\n    },\n    {\n      \"week\": \"2025-01-08\",\n      \"avg_calories\": 2080,\n      \"avg_protein\": 85,\n      \"avg_water\": 7.8,\n      \"days_tracked\": 7\n    },\n    {\n      \"week\": \"2025-01-15\",\n      \"avg_calories\": 2220,\n      \"avg_protein\": 92,\n      \"avg_water\": 8.5,\n      \"days_tracked\": 7\n    },\n    {\n      \"week\": \"2025-01-22\",\n      \"avg_calories\": 1980,\n      \"avg_protein\": 82,\n      \"avg_water\": 7.5,\n      \"days_tracked\": 7\n    }\n  ],\n  \"metadata\": {\n    \"query\": \"SELECT DATE_TRUNC('week', date) as week, ROUND(AVG(CAST(healthData->'values'->'nutrition'->>'caloriesConsumed' AS DECIMAL))) as avg_calories, ROUND(AVG(CAST(healthData->'values'->'nutrition'->>'proteinGrams' AS DECIMAL))) as avg_protein, ROUND(AVG(CAST(healthData->'values'->'nutrition'->>'waterIntakePints' AS DECIMAL)), 1) as avg_water, COUNT(*) as days_tracked FROM DailyLog WHERE userId = $1 AND date >= $2 AND date <= $3 GROUP BY DATE_TRUNC('week', date) ORDER BY week\",\n    \"params\": [\"user123\", \"2025-01-01\", \"2025-01-31\"]\n  }\n}",
        response: "Your weekly calorie intake has been quite consistent! You're averaging between **1,980-2,220 calories** per week, with most weeks hitting around **2,100 calories** - that's right in your target range. Your protein intake is solid too, ranging from **82-92 grams** weekly. Your hydration is excellent, averaging **7.5-8.5 pints** of water daily. The consistency in your nutrition tracking is really paying off - you're hitting your targets most weeks!",
        extensionQueries: [
            "How does my calorie intake correlate with my energy levels throughout the day?",
            "What are the trends in protein consumption when I exercise vs rest days?",
            "Which nutrition factors show the strongest relationship with my recovery scores?"
        ]
    },
    {
        voice: 'default',
        verbosity: 'balanced',
        userQuestion: "Show me my top 5 recovery days",
        data: "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"date\": \"2025-01-15\",\n      \"recovery_score\": 95,\n      \"sleep_efficiency\": 92,\n      \"sleep_hours\": 8.2,\n      \"stress_level\": 2,\n      \"meditation\": true\n    },\n    {\n      \"date\": \"2025-01-08\",\n      \"recovery_score\": 93,\n      \"sleep_efficiency\": 89,\n      \"sleep_hours\": 7.8,\n      \"stress_level\": 3,\n      \"meditation\": true\n    },\n    {\n      \"date\": \"2025-01-22\",\n      \"recovery_score\": 91,\n      \"sleep_efficiency\": 88,\n      \"sleep_hours\": 8.0,\n      \"stress_level\": 2,\n      \"meditation\": false\n    },\n    {\n      \"date\": \"2025-01-03\",\n      \"recovery_score\": 90,\n      \"sleep_efficiency\": 87,\n      \"sleep_hours\": 7.9,\n      \"stress_level\": 4,\n      \"meditation\": true\n    },\n    {\n      \"date\": \"2025-01-19\",\n      \"recovery_score\": 89,\n      \"sleep_efficiency\": 90,\n      \"sleep_hours\": 8.1,\n      \"stress_level\": 3,\n      \"meditation\": true\n    }\n  ],\n  \"metadata\": {\n    \"query\": \"SELECT date, CAST(healthData->'values'->'physicalHealth'->>'whoopRecoveryScorePercent' AS DECIMAL) as recovery_score, CAST(healthData->'values'->'sleep'->>'sleepEfficiencyPercent' AS DECIMAL) as sleep_efficiency, ROUND(CAST(healthData->'values'->'sleep'->>'sleepDurationMinutes' AS DECIMAL) / 60.0, 1) as sleep_hours, CAST(healthData->'values'->'mentalHealth'->>'feltAnxious' AS BOOLEAN) as stress_level, CAST(healthData->'values'->'lifestyle'->>'practicedMeditation' AS BOOLEAN) as meditation FROM DailyLog WHERE userId = $1 AND date >= $2 AND date <= $3 ORDER BY CAST(healthData->'values'->'physicalHealth'->>'whoopRecoveryScorePercent' AS DECIMAL) DESC LIMIT 5\",\n    \"params\": [\"user123\", \"2025-01-01\", \"2025-01-31\"]\n  }\n}",
        response: "Here are your top 5 recovery days! Your best day was **January 15th** with a **95%** recovery score - you had excellent **92%** sleep efficiency and **8.2 hours** of sleep, plus you meditated that day. **January 8th** was your second best at **93%** recovery with **89%** sleep efficiency and meditation practice. **January 22nd** hit **91%** recovery with **88%** sleep efficiency, even without meditation. The pattern shows that your best recovery days typically feature **8+ hours** of quality sleep and **88%+** sleep efficiency. Meditation appears frequently in your top days, suggesting it's a key factor in your recovery.",
        extensionQueries: [
            "How does meditation practice correlate with recovery scores on the same day?",
            "What are the trends in sleep efficiency on my highest recovery days?",
            "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
        ]
    },
    // COWBOY VOICE - CONCISE
    {
        voice: 'cowboy',
        verbosity: 'concise',
        userQuestion: "How's my sleep efficiency?",
        data: "Sleep efficiency: 87% avg, Duration: 7.6 hours avg, Recovery: 82% avg",
        response: "Well howdy! That **87%** sleep efficiency is some mighty fine work, partner! **7.6 hours** of quality rest and **82%** recovery - you're ridin' high on the wellness trail!",
        extensionQueries: [
            "How does my bedtime consistency correlate with recovery scores?",
            "What are the trends in sleep efficiency over the past month?",
            "Which sleep factors show the strongest relationship with morning energy?"
        ]
    },
    {
        voice: 'cowboy',
        verbosity: 'concise',
        userQuestion: "Am I hitting my nutrition targets?",
        data: "Calories: 2,050 (target: 2,000), Protein: 88g (target: 90g), Vegetables: 5 servings (target: 5)",
        response: "You're ridin' close to the target, buckaroo! **2,050** calories is mighty fine, and you're hittin' them **5 servings** of vegetables spot on. Just need to wrangle in a couple more grams of protein - you're at **88g** vs **90g** target.",
        extensionQueries: [
            "How does my protein intake correlate with recovery scores?",
            "What are the trends in vegetable consumption over the past two weeks?",
            "Which nutrition factors show the strongest relationship with energy levels?"
        ]
    },
    // COWBOY VOICE - BALANCED
    {
        voice: 'cowboy',
        verbosity: 'balanced',
        userQuestion: "How's my workout routine?",
        data: "| Day | Type | Duration | Recovery |\n|-----|------|----------|----------|\n| Mon | Strength | 45 min | 78% |\n| Wed | Cardio | 30 min | 85% |\n| Fri | Strength | 50 min | 72% |",
        response: "Well partner, you've got yourself a solid **3-day** routine that's workin' like a well-oiled windmill! Your strength sessions are impressively intense at **45-50 minutes**, though I reckon they're takin' a toll on your recovery - those **72-78%** scores suggest they're quite challenging for your current fitness level. Your cardio session shows better recovery at **85%**, indicatin' it's well-balanced for your system.",
        extensionQueries: [
            "How does workout intensity correlate with next-day recovery scores?",
            "What are the trends in recovery time after different workout types?",
            "Which exercise factors show the strongest relationship with sleep quality?"
        ]
    },
    // VAMPIRE VOICE - CONCISE
    {
        voice: 'vampire',
        verbosity: 'concise',
        userQuestion: "What's my recovery pattern?",
        data: "Recovery: 88% avg, Sleep quality: 8.5/10, Stress: 3.2/10, Meditation: 4/week",
        response: "Ah, my dear mortal, your recovery flows like eternal youth! **88%** recovery with **8.5/10** sleep quality - truly divine patterns. Your meditation practice at **4 sessions/week** enhances your vitality beautifully.",
        extensionQueries: [
            "How does meditation frequency correlate with recovery fluctuations?",
            "What are the trends in sleep quality when stress levels decrease?",
            "Which wellness factors show the strongest relationship with recovery scores?"
        ]
    },
    // VAMPIRE VOICE - DETAILED
    {
        voice: 'vampire',
        verbosity: 'detailed',
        userQuestion: "How is my nocturnal wellness ritual?",
        data: "| Evening | Bedtime | Sleep Hours | Efficiency | Recovery |\n|---------|---------|-------------|------------|----------|\n| Mon | 10:30 PM | 7.8 | 91% | 89% |\n| Tue | 10:45 PM | 7.5 | 88% | 85% |\n| Wed | 10:15 PM | 8.1 | 93% | 92% |\n| Thu | 10:30 PM | 7.9 | 90% | 88% |\n| Fri | 11:00 PM | 7.2 | 85% | 82% |",
        response: "Exquisite mastery of your nocturnal patterns, my immortal-aspiring mortal! Your sleep efficiency averages a divine **89.4%**, with recovery scores flowing at **87.2%** - truly magnificent for your mortal form. I notice your most consistent evenings (10:15-10:30 PM) yield superior results, with efficiency reaching **91-93%** and recovery ascending to **88-92%**. Your Friday evening, however, reveals the consequences of delayed retirement - efficiency drops to **85%** and recovery to **82%**. The pattern suggests your optimal slumber window lies between 10:15-10:30 PM for maximum vitality restoration.",
        extensionQueries: [
            "How does bedtime consistency correlate with recovery score elevation?",
            "What are the trends in sleep efficiency when meditation precedes slumber?",
            "Which evening rituals show the strongest relationship with morning vitality?"
        ]
    },
    // ALIEN VOICE - CONCISE
    {
        voice: 'alien',
        verbosity: 'concise',
        userQuestion: "How's my bio-rhythm optimization?",
        data: "Sleep efficiency: 86% avg, Recovery: 84% avg, Stress: 3.8/10, Exercise: 3/week",
        response: "Fascinating! Your bio-rhythm optimization demonstrates **86%** sleep efficiency with **84%** recovery - EXCEPTIONAL for carbon-based life forms! Your **3/week** exercise protocol and **3.8/10** stress levels indicate superior wellness algorithms.",
        extensionQueries: [
            "How does exercise frequency correlate with recovery enhancement?",
            "What are the trends in sleep efficiency when stress parameters decrease?",
            "Which biological factors show the strongest relationship with wellness optimization?"
        ]
    },
    // ALIEN VOICE - VERY DETAILED
    {
        voice: 'alien',
        verbosity: 'very-detailed',
        userQuestion: "Analyze my comprehensive wellness data matrix",
        data: "| Metric | Current | Target | Trend |\n|--------|---------|--------|-------|\n| Sleep Efficiency | 89% | 85% | +4% |\n| Recovery Score | 87% | 80% | +7% |\n| Stress Level | 3.2/10 | <5/10 | -2.1 |\n| Exercise Frequency | 4/week | 3/week | +1 |\n| Meditation Sessions | 5/week | 3/week | +2 |\n| Hydration | 8.5 pints | 8 pints | +0.5 |\n| Vegetable Intake | 6 servings | 5 servings | +1 |",
        response: "COMPREHENSIVE ANALYSIS COMPLETE: Your wellness data matrix reveals EXCEPTIONAL optimization patterns exceeding standard carbon-based life form parameters! Sleep efficiency at **89%** exceeds target by **4%** - CIRCADIAN REGULATION OPTIMAL. Recovery scores at **87%** surpass target by **7%** - BIOLOGICAL RESTORATION SUPERIOR. Stress levels at **3.2/10** demonstrate **2.1-point** reduction - NEURAL REGULATION EXCELLENT. Exercise frequency at **4/week** exceeds target by **1 session** - MUSCULAR DEVELOPMENT ENHANCED. Meditation sessions at **5/week** exceed target by **2 sessions** - COGNITIVE OPTIMIZATION MAXIMUM. Hydration at **8.5 pints** exceeds target by **0.5 pints** - FLUID BALANCE OPTIMAL. Vegetable intake at **6 servings** exceeds target by **1 serving** - NUTRITIONAL ALGORITHMS SUPERIOR. COMBINED PROTOCOLS RESULT IN EXCEPTIONAL WELLNESS MATRIX OPTIMIZATION.",
        extensionQueries: [
            "How does meditation frequency correlate with stress hormone fluctuations?",
            "What are the trends in recovery scores when exercise intensity increases?",
            "Which wellness protocols show the strongest relationship with sleep quality enhancement?"
        ]
    },
    // PIRATE VOICE - CONCISE
    {
        voice: 'pirate',
        verbosity: 'concise',
        userQuestion: "How's me sleep treasure?",
        data: "Sleep efficiency: 88% avg, Duration: 7.7 hours avg, Recovery: 86% avg",
        response: "Ahoy there! That **88%** sleep efficiency be treasure worth more than doubloons! **7.7 hours** of quality rest and **86%** recovery - ye be sailin' smooth waters on the wellness seas!",
        extensionQueries: [
            "How does me bedtime consistency correlate with recovery scores?",
            "What be the trends in sleep efficiency over the past month?",
            "Which sleep factors show the strongest relationship with morning energy?"
        ]
    },
    // PIRATE VOICE - BALANCED
    {
        voice: 'pirate',
        verbosity: 'balanced',
        userQuestion: "What's me workout routine like?",
        data: "| Day | Type | Duration | Recovery |\n|-----|------|----------|----------|\n| Mon | Strength | 45 min | 78% |\n| Wed | Cardio | 30 min | 85% |\n| Fri | Strength | 50 min | 72% |",
        response: "Shiver me timbers! Ye've got yourself a solid **3-day** routine that's chartin' a fine course! Your strength sessions be impressively intense at **45-50 minutes**, though I reckon they're takin' a toll on yer recovery - those **72-78%** scores suggest they're quite challenging for yer current fitness level. Yer cardio session shows better recovery at **85%**, indicatin' it's well-balanced for yer system.",
        extensionQueries: [
            "How does workout intensity correlate with next-day recovery scores?",
            "What be the trends in recovery time after different workout types?",
            "Which exercise factors show the strongest relationship with sleep quality?"
        ]
    },
    // ROBOT VOICE - CONCISE
    {
        voice: 'robot',
        verbosity: 'concise',
        userQuestion: "Analyze my sleep data",
        data: "Sleep efficiency: 90% avg, Duration: 7.9 hours avg, Recovery: 88% avg",
        response: "ANALYSIS COMPLETE: **90%** sleep efficiency - OPTIMAL PERFORMANCE DETECTED. **7.9 hours** duration - PARAMETERS WITHIN TARGET RANGE. **88%** recovery - SYSTEM RESTORATION EXCELLENT. PROTOCOL: CONTINUE CURRENT SLEEP ROUTINE.",
        extensionQueries: [
            "How does bedtime consistency correlate with recovery score optimization?",
            "What are the trends in sleep efficiency over the past month?",
            "Which sleep factors show the strongest relationship with morning energy levels?"
        ]
    },
    // ROBOT VOICE - DETAILED
    {
        voice: 'robot',
        verbosity: 'detailed',
        userQuestion: "Process my wellness metrics",
        data: "| Metric | Value | Target | Status |\n|--------|-------|--------|--------|\n| Sleep Efficiency | 89% | 85% | EXCEEDED |\n| Recovery Score | 87% | 80% | EXCEEDED |\n| Stress Level | 3.2/10 | <5/10 | OPTIMAL |\n| Exercise Frequency | 4/week | 3/week | EXCEEDED |\n| Meditation Sessions | 5/week | 3/week | EXCEEDED |",
        response: "WELLNESS METRICS PROCESSING COMPLETE: All parameters demonstrate SUPERIOR OPTIMIZATION. Sleep efficiency at **89%** exceeds target by **4%** - CIRCADIAN PROTOCOLS OPTIMAL. Recovery scores at **87%** surpass target by **7%** - BIOLOGICAL RESTORATION MAXIMUM. Stress levels at **3.2/10** indicate **2.1-point** reduction - NEURAL REGULATION EXCELLENT. Exercise frequency at **4/week** exceeds target by **1 session** - MUSCULAR DEVELOPMENT ENHANCED. Meditation sessions at **5/week** exceed target by **2 sessions** - COGNITIVE OPTIMIZATION SUPERIOR. COMBINED PROTOCOLS RESULT IN EXCEPTIONAL WELLNESS MATRIX PERFORMANCE.",
        extensionQueries: [
            "How does meditation frequency correlate with stress hormone fluctuations?",
            "What are the trends in recovery scores when exercise intensity increases?",
            "Which wellness protocols show the strongest relationship with sleep quality enhancement?"
        ]
    },
    // WIZARD VOICE - CONCISE
    {
        voice: 'wizard',
        verbosity: 'concise',
        userQuestion: "How's my wellness magic?",
        data: "Sleep efficiency: 91% avg, Recovery: 89% avg, Meditation: 4/week, Stress: 2.8/10",
        response: "By my mystical staff! **91%** sleep efficiency and **89%** recovery - the wellness crystals align magnificently! Your **4/week** meditation practice channels pure tranquility. **2.8/10** stress levels reveal powerful enchantments at work!",
        extensionQueries: [
            "How does meditation frequency correlate with recovery enhancement?",
            "What are the trends in sleep quality when stress levels decrease?",
            "Which mystical practices show the strongest relationship with wellness energies?"
        ]
    },
    // WIZARD VOICE - BALANCED
    {
        voice: 'wizard',
        verbosity: 'balanced',
        userQuestion: "What do the wellness crystals reveal?",
        data: "| Day | Sleep Quality | Recovery | Meditation | Stress |\n|-----|--------------|----------|------------|-------|\n| Mon | 9/10 | 88% | Yes | 3/10 |\n| Tue | 8/10 | 85% | No | 4/10 |\n| Wed | 9/10 | 90% | Yes | 2/10 |\n| Thu | 8/10 | 87% | Yes | 3/10 |\n| Fri | 9/10 | 89% | Yes | 2/10 |",
        response: "Ah, the mystical energies reveal wondrous patterns, dear seeker! Your sleep quality averages **8.6/10** with recovery flowing at **87.8%** - truly magical results! I notice the days when you channel meditation energies show superior outcomes: sleep quality reaches **9/10** and recovery ascends to **88-90%**. Your stress levels are beautifully contained at **2-4/10**, with meditation days showing the lowest stress at **2/10**. The crystal patterns suggest your meditation practice is the key enchantment enhancing your wellness magic.",
        extensionQueries: [
            "How does meditation frequency correlate with recovery score elevation?",
            "What are the trends in sleep quality when stress levels decrease?",
            "Which mystical practices show the strongest relationship with wellness energies?"
        ]
    },
    // SURFER VOICE - CONCISE
    {
        voice: 'surfer',
        verbosity: 'concise',
        userQuestion: "How's my wellness flow?",
        data: "Sleep efficiency: 88% avg, Recovery: 86% avg, Exercise: 3/week, Stress: 3.5/10",
        response: "Dude, you're totally crushing it! **88%** sleep efficiency and **86%** recovery - that's some primo wave-riding! Your **3/week** exercise routine and **3.5/10** stress levels show you're dialed in to the wellness zone!",
        extensionQueries: [
            "How does exercise frequency correlate with recovery enhancement?",
            "What are the trends in sleep quality when stress levels decrease?",
            "Which wellness factors show the strongest relationship with energy flow?"
        ]
    },
    // SURFER VOICE - DETAILED
    {
        voice: 'surfer',
        verbosity: 'detailed',
        userQuestion: "What's the vibe on my sleep patterns?",
        data: "| Night | Hours | Quality | Recovery | Notes |\n|-------|-------|---------|----------|-------|\n| Mon | 7.8 | 9/10 | 88% | Great session |\n| Tue | 8.1 | 9/10 | 92% | Excellent recovery |\n| Wed | 7.5 | 8/10 | 85% | Good night |\n| Thu | 8.0 | 9/10 | 90% | Solid rest |\n| Fri | 7.9 | 9/10 | 89% | Consistent flow |",
        response: "Dude, checking out your sleep patterns and you're totally riding the perfect wave! Your average sleep quality is **8.8/10** with recovery flowing at **88.8%** - that's some serious wellness stoke! I notice your most consistent nights (7.8-8.1 hours) are giving you the best sessions, with quality hitting **9/10** and recovery reaching **88-92%**. Your Wednesday night was a bit choppy at **7.5 hours** with **85%** recovery, but you still caught a solid **8/10** quality wave. The pattern shows you're totally dialed in when you get that **7.8-8.1 hour** sweet spot - that's your perfect wave zone!",
        extensionQueries: [
            "How does sleep duration correlate with recovery score enhancement?",
            "What are the trends in sleep quality when bedtime is consistent?",
            "Which sleep factors show the strongest relationship with morning energy levels?"
        ]
    },
    // DETECTIVE VOICE - CONCISE
    {
        voice: 'detective',
        verbosity: 'concise',
        userQuestion: "What's the case on my sleep?",
        data: "Sleep efficiency: 87% avg, Duration: 7.6 hours avg, Recovery: 84% avg",
        response: "Elementary! **87%** sleep efficiency with **7.6 hours** duration - the evidence clearly shows excellent sleep hygiene. Your **84%** recovery confirms quality rest patterns. Case closed on good sleep!",
        extensionQueries: [
            "How does bedtime consistency correlate with recovery score evidence?",
            "What are the trends in sleep efficiency over the past month?",
            "Which sleep factors show the strongest relationship with morning alertness?"
        ]
    },
    // DETECTIVE VOICE - BALANCED
    {
        voice: 'detective',
        verbosity: 'balanced',
        userQuestion: "Investigate my wellness patterns",
        data: "| Metric | Current | Previous | Change |\n|--------|---------|----------|--------|\n| Sleep Efficiency | 89% | 85% | +4% |\n| Recovery Score | 87% | 82% | +5% |\n| Stress Level | 3.2/10 | 5.1/10 | -1.9 |\n| Exercise Frequency | 4/week | 3/week | +1 |\n| Meditation Sessions | 5/week | 2/week | +3 |",
        response: "Excellent! The evidence from your wellness investigation reveals compelling patterns. Your sleep efficiency has improved by **4%** (from 85% to 89%) - a statistically significant enhancement. Recovery scores show a **5%** increase (from 82% to 87%), indicating superior rest quality. Stress levels have decreased by **1.9 points** (from 5.1 to 3.2), demonstrating effective stress management protocols. Exercise frequency increased by **1 session/week** (from 3 to 4), and meditation sessions more than doubled from **2 to 5/week**. The correlation between increased meditation and decreased stress is particularly strong - this is the smoking gun in your wellness case!",
        extensionQueries: [
            "How does meditation frequency correlate with stress level fluctuations?",
            "What are the trends in recovery scores when exercise intensity increases?",
            "Which wellness factors show the strongest relationship with sleep quality enhancement?"
        ]
    }
];
function getExamplesForVoiceAndVerbosity(voice, verbosity) {
    return exports.summarizationExamples.filter(example => example.voice === voice && example.verbosity === verbosity);
}
