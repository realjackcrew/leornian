export interface SummarizationExample {
  voice: string;
  verbosity: string;
  userQuestion: string;
  data: string;
  response: string;
  extensionQueries: string[];
}
export const defaultVoiceExamples: SummarizationExample[] = [
  {
    voice: 'default',
    verbosity: 'concise',
    userQuestion: "What's my average recovery score this month?",
    data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
    response: "Your average recovery score this month is 87.2 across 30 days—well above average! You had 8 days with recovery over 90, and just 3 below 80. That means over 73% of your days were within a healthy, resilient range. Your top score was 95, and the lowest was 72. Keep doing what’s working—your body is consistently bouncing back!",
    extensionQueries: [
      "How does my recovery score correlate with my sleep efficiency on the same days?",
      "What are the trends in recovery scores when I exercise vs rest days?",
      "Which lifestyle factors show the strongest relationship with recovery performance?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'concise',
    userQuestion: "How many days did I sleep less than 7 hours?",
    data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
    response: "You slept less than 7 hours on 12 out of 30 days (40%). Despite that, your average was 7.3 hours, which is quite solid. Your most common bedtime was 11:30 PM and wake-up was 6:45 AM, showing strong routine. Improving just a few short nights could elevate your energy and recovery.",
    extensionQueries: [
      "How does my sleep duration correlate with my recovery scores the next day?",
      "What are the trends in sleep duration when I have stressful events?",
      "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'concise',
    userQuestion: "What's my weekly average calorie intake?",
    data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
    response: "Your weekly average calorie intake ranged from 1980 to 2220 kcal, showing good nutritional consistency. Protein averaged 82–92g, and water intake held steady around 7.5–8.5 cups/day. Your intake supports recovery well—especially that steady protein!",
    extensionQueries: [
      "How does my calorie intake correlate with my energy levels throughout the day?",
      "What are the trends in protein consumption when I exercise vs rest days?",
      "Which nutrition factors show the strongest relationship with my recovery scores?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'concise',
    userQuestion: "Show me my top 5 recovery days",
    data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
    response: "Your top 5 recovery days scored 95, 93, 91, 90, and 89. Each was paired with high sleep efficiency (87–92%) and 7.8+ hours of sleep. Most had lower stress levels and included meditation. You’re doing a great job creating conditions for optimal recovery.",
    extensionQueries: [
      "How does meditation practice correlate with recovery scores on the same day?",
      "What are the trends in sleep efficiency on my highest recovery days?",
      "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'concise',
    userQuestion: "How did my sleep look this week?",
    data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
    response: "This week’s sleep looked solid. You got 7.5 to 8.2 hours on key days, with efficiency above 88%. Highest recovery (92%) followed your best sleep. That consistency is paying off—keep that rhythm!",
    extensionQueries: [
      "How does my bedtime consistency correlate with recovery scores?",
      "What are the trends in sleep efficiency over the past month?",
      "Which sleep factors show the strongest relationship with morning energy levels?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'concise',
    userQuestion: "What was my heart rate variability last night?",
    data: "{}",
    response: "I don't see any heart rate variability data for last night. It looks like there might not be any data recorded, or the data collection was interrupted. You might want to check if your device was properly connected or if there were any tracking issues.",
    extensionQueries: []
  },
  {
    voice: 'default',
    verbosity: 'concise',
    userQuestion: "What was my heart rate variability last night?",
    data: "{\"success\": false, \"error\": \"Invalid query\"}",
    response: "I'm unable to retrieve your heart rate variability data due to an error with the query. The system returned an 'Invalid query' error, which suggests there might be an issue with how the request was formatted or processed. You might want to try rephrasing your question or check if the data source is available.",
    extensionQueries: []
  },
  {
    voice: 'default',
    verbosity: 'balanced',
    userQuestion: "What's my average recovery score this month?",
    data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
    response: "Your average recovery score for the month is 87.2, based on 30 days of data. You had 8 days scoring above 90, which signals exceptional physiological readiness and resilience. Just 3 days fell below 80—still respectable—and your lowest score was 72. Your peak was 95, showing that you’re capable of hitting optimal recovery when conditions are right. This means over a quarter of your month was peak performance, and the rest mostly stable. This level of consistency suggests strong daily routines and effective stress management. If you want to elevate the low-recovery days, it may be worth identifying if they corresponded with late bedtimes, poor nutrition, or elevated stress. Keep up the excellent work—you’ve built a very stable foundation for performance and recovery.",
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
    data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
    response: "In the last 30 days, you logged 12 nights with less than 7 hours of sleep, which represents 40% of the time. Your average nightly duration was 7.3 hours, and your bedtime and wake time were very consistent—11:30 PM and 6:45 AM, respectively. That level of regularity is excellent—it supports circadian alignment, hormone regulation, and overall recovery. While you’re hitting a solid average, cutting down short nights could help boost performance and mental clarity. This might involve a slightly earlier wind-down routine or identifying triggers like screen use or late meals.",
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
    data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
    response: "Your weekly calorie intake was well-balanced across the last four weeks. Calories ranged from 1980 to 2220, protein from 82g to 92g, and hydration stayed consistent between 7.5 and 8.5 cups/day. This consistency is great news! Nutritional stability like this supports sleep, recovery, and energy throughout the day. High-protein intake in particular correlates with better muscle repair and immune health. The slight calorie dip in the last week might be intentional or reflect a decrease in physical activity.",
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
    data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
    response: "Your top 5 recovery days—Jan 15 (95), Jan 8 (93), Jan 22 (91), Jan 3 (90), and Jan 19 (89)—show a clear pattern: excellent sleep, reduced stress, and regular meditation. Sleep durations were all between 7.8 and 8.2 hours, with sleep efficiencies from 87% to 92%. 4 out of the 5 days included meditation and had lower reported stress. These routines seem to significantly elevate your recovery capacity. To capitalize on this, try incorporating meditation more regularly or reflect on the unique conditions of those days. Want to identify which combination of habits drives the best outcomes?",
    extensionQueries: [
      "How does meditation practice correlate with recovery scores on the same day?",
      "What are the trends in sleep efficiency on my highest recovery days?",
      "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'balanced',
    userQuestion: "How did my sleep look this week?",
    data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
    response: "This week’s sleep showed a very healthy pattern. On Wednesday, you got 8.2 hours of sleep at 92% efficiency, which coincided with your highest recovery score: 92%. Friday was also strong, with 7.8 hours of sleep and 88% efficiency. Even Monday, your lightest night, provided 7.5 hours and 89% efficiency. Such consistency indicates great sleep hygiene. It’s likely helping your recovery, mental clarity, and daily energy. If this is a new trend, excellent job!",
    extensionQueries: [
      "How does my bedtime consistency correlate with recovery scores?",
      "What are the trends in sleep efficiency over the past month?",
      "Which sleep factors show the strongest relationship with morning energy levels?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'balanced',
    userQuestion: "What was my heart rate variability last night?",
    data: "{}",
    response: "I don't see any heart rate variability data for last night. It looks like there might not be any data recorded, or the data collection was interrupted. You might want to check if your device was properly connected or if there were any tracking issues.",
    extensionQueries: []
  },
  {
    voice: 'default',
    verbosity: 'balanced',
    userQuestion: "What was my heart rate variability last night?",
    data: "{\"success\": false, \"error\": \"Invalid query\"}",
    response: "I'm unable to retrieve your heart rate variability data due to an error with the query. The system returned an 'Invalid query' error, which suggests there might be an issue with how the request was formatted or processed. You might want to try rephrasing your question or check if the data source is available.",
    extensionQueries: []
  },
  {
    voice: 'default',
    verbosity: 'detailed',
    userQuestion: "What's my average recovery score this month?",
    data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
    response: "Looking at your recovery data for the month, your average score is an impressive 87.2 over 30 days. This is a strong indicator of your body's ability to adapt to stress and bounce back efficiently. You've had 8 days with a recovery score above 90, which is excellent, and only 3 days dipping below 80. Your best day hit a peak of 95, while your lowest was 72.\n\nHere is a summary of your recovery statistics for the month:\n\n| Metric | Value |\n| :--- | :--- |\n| Average Recovery | 87.2 |\n| Total Days | 30 |\n| Days Above 90 | 8 |\n| Days Below 80 | 3 |\n| Best Day | 95 |\n| Worst Day | 72 |\n\nThese numbers suggest a very consistent and effective approach to your health and wellness. The high number of peak recovery days indicates that your lifestyle choices are frequently aligning to produce optimal physiological states. The small number of lower recovery days suggests that you are managing stress, sleep, and nutrition well. To further optimize, you could analyze the specific circumstances of your lower-scoring days. Were there patterns in your sleep, nutrition, or stress levels on those days? Understanding these factors can help you turn your 72s into 82s.",
    extensionQueries: [
      "How does my recovery score correlate with my sleep efficiency on the same days?",
      "What are the trends in recovery scores when I exercise vs rest days?",
      "Which lifestyle factors show the strongest relationship with recovery performance?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'detailed',
    userQuestion: "How many days did I sleep less than 7 hours?",
    data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
    response: "Over the past 30 days, you slept for less than 7 hours on 12 occasions, which accounts for 40% of the month. While this is a significant portion, your average sleep duration was 7.3 hours, which is still a healthy figure. Your sleep schedule appears to be very consistent, with a most common bedtime of 11:30 PM and a wake-up time of 6:45 AM. This regularity is a powerful tool for improving sleep quality.\n\nHere's a breakdown of your sleep data:\n\n| Metric | Value |\n| :--- | :--- |\n| Days with < 7 hours sleep | 12 |\n| Total Days | 30 |\n| Percentage of short sleep days | 40.0% |\n| Average Sleep Hours | 7.3 |\n| Most Common Bedtime | 23:30 |\n| Most Common Wake Time | 06:45 |\n\nThe data suggests that while you have a strong sleep routine, there are opportunities to increase your sleep duration on those 12 shorter nights. You might consider if there are any recurring reasons for this shorter sleep. For example, are these days preceded by late-night work, social events, or high-stress activities? Pinpointing these triggers can help you develop strategies to ensure you consistently get over 7 hours of sleep, which will have a positive impact on your recovery, energy levels, and overall health.",
    extensionQueries: [
      "How does my sleep duration correlate with my recovery scores the next day?",
      "What are the trends in sleep duration when I have stressful events?",
      "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'detailed',
    userQuestion: "What's my weekly average calorie intake?",
    data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
    response: "Your weekly average calorie intake has been quite stable over the last four weeks, fluctuating between 1980 and 2220 calories. This consistency is also reflected in your macronutrient intake, with average protein consumption ranging from 82g to 92g, and your daily water intake holding steady between 7.5 and 8.5 cups.\n\nHere is a summary of your weekly nutritional data:\n\n| Week | Avg. Calories | Avg. Protein (g) | Avg. Water (cups) | Days Tracked |\n| :--- | :--- | :--- | :--- | :--- |\n| 2025-01-01 | 2150 | 88 | 8.2 | 7 |\n| 2025-01-08 | 2080 | 85 | 7.8 | 7 |\n| 2025-01-15 | 2220 | 92 | 8.5 | 7 |\n| 2025-01-22 | 1980 | 82 | 7.5 | 7 |\n\nThis data suggests that you have a well-established and balanced dietary routine. The consistent high protein intake is particularly beneficial for muscle protein synthesis, which is essential for repairing and building muscle tissue, especially if you are physically active. Adequate hydration, as demonstrated by your consistent water intake, is also crucial for a wide range of bodily functions, including temperature regulation, nutrient transport, and cognitive function.\n\nThe slight dip in calorie intake during the last week to 1980 could be interpreted in a few ways. It might have been a conscious decision to create a slight caloric deficit, or it could be an unintentional consequence of a change in your routine, such as a particularly busy week that left less time for meals. It would be worthwhile to reflect on the context of that week. Did you feel any different in terms of your energy levels or workout performance? Understanding these nuances can help you fine-tune your nutritional strategy to better align with your goals. Overall, your data reflects a very positive and disciplined approach to nutrition.",
    extensionQueries: [
      "How does my calorie intake correlate with my energy levels throughout the day?",
      "What are the trends in protein consumption when I exercise vs rest days?",
      "Which nutrition factors show the strongest relationship with my recovery scores?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'detailed',
    userQuestion: "Show me my top 5 recovery days",
    data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
    response: "Your top 5 recovery days this month were exceptional, with scores ranging from 89 to 95. A clear pattern emerges when looking at the data: these high-recovery days are strongly associated with good sleep, low stress, and meditation. On these days, you consistently achieved over 7.8 hours of sleep with high sleep efficiency (87-92%).\n\nHere are the details of your top 5 recovery days:\n\n| Date | Recovery Score | Sleep Efficiency | Sleep Hours | Stress Level | Meditation |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| 2025-01-15 | 95 | 92% | 8.2 | 2 | Yes |\n| 2025-01-08 | 93 | 89% | 7.8 | 3 | Yes |\n| 2025-01-22 | 91 | 88% | 8.0 | 2 | No |\n| 2025-01-03 | 90 | 87% | 7.9 | 4 | Yes |\n| 2025-01-19 | 89 | 90% | 8.1 | 3 | Yes |\n\nThe most striking insight from this data is the strong correlation between meditation and high recovery. On 4 out of your 5 best days, you incorporated meditation into your routine. This suggests that your meditation practice is having a profound and positive effect on your autonomic nervous system, helping to shift you into a more parasympathetic (rest and digest) state. This is further supported by the low stress levels recorded on these days. Even on the one day you didn't meditate (2025-01-22), your stress level was at a low of 2.\n\nThis data provides you with a clear and actionable blueprint for achieving optimal recovery. By prioritizing a consistent sleep schedule of around 8 hours, and making meditation a regular, non-negotiable part of your daily routine, you are very likely to see a significant increase in the frequency of these high-recovery days. Think of these top 5 days not as isolated events, but as a template for what is possible when you create the right conditions for your body to thrive.",
    extensionQueries: [
      "How does meditation practice correlate with recovery scores on the same day?",
      "What are the trends in sleep efficiency on my highest recovery days?",
      "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'detailed',
    userQuestion: "How did my sleep look this week?",
    data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
    response: "Your sleep this week was very good, showing a strong connection between sleep quality and recovery. You had consistent sleep durations and high efficiency, which translated directly into positive recovery scores. Your best night was Wednesday, with 8.2 hours of sleep and 92% efficiency, leading to a 92% recovery score.\n\nHere's a look at your sleep data for the week:\n\n| Date | Hours | Efficiency | Recovery |\n| :--- | :--- | :--- | :--- |\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |\n\nThe data clearly illustrates the principle that better sleep leads to better recovery. The consistency in your sleep, even on Monday with 7.5 hours, provided a solid foundation for your body to repair and rejuvenate. This is a great example of how prioritizing sleep can have a direct and measurable impact on your well-being. If you can maintain this level of sleep hygiene, you can expect to see continued high recovery and improved daily performance.",
    extensionQueries: [
      "How does my bedtime consistency correlate with recovery scores?",
      "What are the trends in sleep efficiency over the past month?",
      "Which sleep factors show the strongest relationship with morning energy levels?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'detailed',
    userQuestion: "What was my heart rate variability last night?",
    data: "{}",
    response: "I don't see any heart rate variability data for last night. It looks like there might not be any data recorded, or the data collection was interrupted. You might want to check if your device was properly connected or if there were any tracking issues.",
    extensionQueries: []
  },
  {
    voice: 'default',
    verbosity: 'detailed',
    userQuestion: "What was my heart rate variability last night?",
    data: "{\"success\": false, \"error\": \"Invalid query\"}",
    response: "I'm unable to retrieve your heart rate variability data due to an error with the query. The system returned an 'Invalid query' error, which suggests there might be an issue with how the request was formatted or processed. You might want to try rephrasing your question or check if the data source is available.",
    extensionQueries: []
  },
  {
    voice: 'default',
    verbosity: 'very-detailed',
    userQuestion: "What's my average recovery score this month?",
    data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
    response: "Throughout this month, you've demonstrated a remarkable capacity for recovery, with an average score of 87.2 across 30 days of tracking. This high average is a testament to your consistent and effective lifestyle habits. A deeper dive into the data reveals that you experienced 8 days of peak recovery, with scores soaring above 90. These are days when your body was in an optimal state to perform, both mentally and physically. On the other end of the spectrum, you only had 3 days where your recovery dipped below 80, with your lowest score being a respectable 72. Your highest score was an outstanding 95.\n\nHere is a summary of your recovery statistics for the month:\n\n| Metric | Value |\n| :--- | :--- |\n| Average Recovery | 87.2 |\n| Total Days | 30 |\n| Days Above 90 | 8 |\n| Days Below 80 | 3 |\n| Best Day | 95 |\n| Worst Day | 72 |\n\nThe story these numbers tell is one of resilience and consistency. The fact that over a quarter of your month was spent in a state of high recovery is a strong signal that your daily routines are well-aligned with your physiological needs. This could be a result of disciplined sleep schedules, a nutritious diet, effective stress management techniques, or a combination of all three. The low number of sub-80 recovery days further reinforces this, suggesting that even on your tougher days, your body is still managing to cope effectively.\n\nTo unlock even greater potential, it would be beneficial to examine the context surrounding your lower recovery scores. Cross-referencing these days with your sleep data, activity levels, and any logged nutritional information could reveal valuable insights. For instance, did these days follow nights of poor sleep? Or perhaps they coincided with particularly strenuous workouts without adequate recovery protocols? By identifying these patterns, you can proactively address the root causes and elevate your baseline recovery even further. Consider this data not just as a reflection of the past, but as a roadmap for future optimization. Your current trajectory is excellent, and with a few minor adjustments, you could potentially see even more days in that coveted 90+ recovery zone.",
    extensionQueries: [
      "How does my recovery score correlate with my sleep efficiency on the same days?",
      "What are the trends in recovery scores when I exercise vs rest days?",
      "Which lifestyle factors show the strongest relationship with recovery performance?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'very-detailed',
    userQuestion: "How many days did I sleep less than 7 hours?",
    data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
    response: "Analyzing your sleep patterns over the last 30 days, we can see that you had 12 nights where your sleep duration was less than 7 hours. This represents 40% of the month. While this might seem like a high number, it's important to consider the broader context. Your average sleep duration for the month was 7.3 hours, which is a solid average that many people strive for. Furthermore, your sleep schedule exhibits a high degree of consistency, with your most frequent bedtime being 11:30 PM and your most common wake-up time being 6:45 AM. This regularity is a cornerstone of good sleep hygiene and plays a crucial role in regulating your circadian rhythm.\n\nHere's a detailed breakdown of your sleep metrics:\n\n| Metric | Value |\n| :--- | :--- |\n| Days with < 7 hours sleep | 12 |\n| Total Days | 30 |\n| Percentage of short sleep days | 40.0% |\n| Average Sleep Hours | 7.3 |\n| Most Common Bedtime | 23:30 |\n| Most Common Wake Time | 06:45 |\n\nThe data paints a picture of a disciplined individual with a strong sleep routine, who occasionally experiences nights of shorter sleep. The key to improvement lies in understanding the 'why' behind these 12 nights. Are there specific days of the week when this tends to happen? For example, do you find it harder to get enough sleep on work nights or weekends? Are there external factors at play, such as high-pressure deadlines, social engagements, or even the consumption of caffeine or alcohol too close to bedtime?\n\nBy keeping a simple journal or using a logging tool to track these potential influences, you can start to connect the dots between your daily activities and your sleep outcomes. For instance, you might discover that on days you have a late-afternoon coffee, you're more likely to get less than 7 hours of sleep. Armed with this knowledge, you can make small, targeted adjustments to your routine. The goal isn't necessarily to achieve a perfect 8 hours every single night, but rather to minimize the frequency of those shorter sleep nights and ensure you're consistently providing your body with the restorative sleep it needs to thrive.",
    extensionQueries: [
      "How does my sleep duration correlate with my recovery scores the next day?",
      "What are the trends in sleep duration when I have stressful events?",
      "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'very-detailed',
    userQuestion: "What's my weekly average calorie intake?",
    data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
    response: "Your nutritional data from the past four weeks reveals a commendable level of consistency in your eating habits. Your average weekly calorie intake has remained within a tight range of 1980 to 2220 calories. This stability is a strong foundation for maintaining energy balance and supporting your body's daily needs. This consistency extends to your macronutrient and hydration levels as well. Your average protein intake has been between 82g and 92g per day, and you've been consistently drinking between 7.5 and 8.5 cups of water daily.\n\nHere is a week-by-week breakdown of your nutritional data:\n\n| Week | Avg. Calories | Avg. Protein (g) | Avg. Water (cups) | Days Tracked |\n| :--- | :--- | :--- | :--- | :--- |\n| 2025-01-01 | 2150 | 88 | 8.2 | 7 |\n| 2025-01-08 | 2080 | 85 | 7.8 | 7 |\n| 2025-01-15 | 2220 | 92 | 8.5 | 7 |\n| 2025-01-22 | 1980 | 82 | 7.5 | 7 |\n\nThis data suggests that you have a well-established and balanced dietary routine. The consistent high protein intake is particularly beneficial for muscle protein synthesis, which is essential for repairing and building muscle tissue, especially if you are physically active. Adequate hydration, as demonstrated by your consistent water intake, is also crucial for a wide range of bodily functions, including temperature regulation, nutrient transport, and cognitive function.\n\nThe slight dip in calorie intake during the last week to 1980 could be interpreted in a few ways. It might have been a conscious decision to create a slight caloric deficit, or it could be an unintentional consequence of a change in your routine, such as a particularly busy week that left less time for meals. It would be worthwhile to reflect on the context of that week. Did you feel any different in terms of your energy levels or workout performance? Understanding these nuances can help you fine-tune your nutritional strategy to better align with your goals. Overall, your data reflects a very positive and disciplined approach to nutrition.",
    extensionQueries: [
      "How does my calorie intake correlate with my energy levels throughout the day?",
      "What are the trends in protein consumption when I exercise vs rest days?",
      "Which nutrition factors show the strongest relationship with my recovery scores?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'very-detailed',
    userQuestion: "Show me my top 5 recovery days",
    data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
    response: "Your top 5 recovery days this month were truly exceptional, with scores of 95, 93, 91, 90, and 89. These scores represent days where your body was in a prime state for performance, adaptation, and overall well-being. When we analyze the contributing factors to these peak recovery days, a clear and powerful narrative emerges: the combination of sufficient sleep, low stress levels, and the practice of meditation is a potent formula for your success. On each of these days, you secured between 7.8 and 8.2 hours of sleep, with impressive sleep efficiency ranging from 87% to 92%.\n\nHere is a detailed look at the data for your top 5 recovery days:\n\n| Date | Recovery Score | Sleep Efficiency | Sleep Hours | Stress Level | Meditation |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| 2025-01-15 | 95 | 92% | 8.2 | 2 | Yes |\n| 2025-01-08 | 93 | 89% | 7.8 | 3 | Yes |\n| 2025-01-22 | 91 | 88% | 8.0 | 2 | No |\n| 2025-01-03 | 90 | 87% | 7.9 | 4 | Yes |\n| 2025-01-19 | 89 | 90% | 8.1 | 3 | Yes |\n\nThe most striking insight from this data is the strong correlation between meditation and high recovery. On 4 out of your 5 best days, you incorporated meditation into your routine. This suggests that your meditation practice is having a profound and positive effect on your autonomic nervous system, helping to shift you into a more parasympathetic (rest and digest) state. This is further supported by the low stress levels recorded on these days. Even on the one top recovery day where you didn't meditate (2025-01-22), your stress level was at a low of 2.\n\nThis data provides you with a clear and actionable blueprint for achieving optimal recovery. By prioritizing a consistent sleep schedule of around 8 hours, and making meditation a regular, non-negotiable part of your daily routine, you are very likely to see a significant increase in the frequency of these high-recovery days. Think of these top 5 days not as isolated events, but as a template for what is possible when you create the right conditions for your body to thrive.",
    extensionQueries: [
      "How does meditation practice correlate with recovery scores on the same day?",
      "What are the trends in sleep efficiency on my highest recovery days?",
      "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'very-detailed',
    userQuestion: "How did my sleep look this week?",
    data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
    response: "Your sleep performance this week was excellent, and it provides a compelling case study in the direct relationship between sleep quality and physiological recovery. You demonstrated remarkable consistency in your sleep patterns, which paid off in the form of high recovery scores. The standout night was Wednesday, where you achieved 8.2 hours of sleep with an impressive 92% efficiency. This stellar sleep performance was mirrored by a 92% recovery score, indicating that your body was able to fully capitalize on the restorative benefits of a great night's sleep.\n\nHere's a summary of your sleep and recovery data for the week:\n\n| Date | Hours | Efficiency | Recovery |\n| :--- | :--- | :--- | :--- |\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |\n\nThe data from Monday and Friday further reinforces this trend. On Monday, you still managed a solid 7.5 hours of sleep with 89% efficiency, resulting in a healthy 85% recovery. On Friday, 7.8 hours of sleep with 88% efficiency yielded an 88% recovery score. This dose-response relationship is a key insight: the more high-quality sleep you get, the better your body recovers.\n\nThis week's data serves as a powerful reminder of the foundational role that sleep plays in our overall health and performance. Your consistency in this area is a significant asset. If you can replicate this pattern week after week, you will be building a strong foundation for long-term health, resilience, and well-being. It would be interesting to correlate this data with your daily activities. Did you do anything differently on Wednesday that might have contributed to your exceptional sleep? Perhaps you had a particularly relaxing evening routine, or avoided screens before bed. Identifying these positive behaviors can help you to consciously integrate them into your life more frequently, leading to even more nights of restorative sleep and optimal recovery.",
    extensionQueries: [
      "How does my bedtime consistency correlate with recovery scores?",
      "What are the trends in sleep efficiency over the past month?",
      "Which sleep factors show the strongest relationship with morning energy levels?"
    ]
  },
  {
    voice: 'default',
    verbosity: 'very-detailed',
    userQuestion: "What was my heart rate variability last night?",
    data: "{}",
    response: "I don't see any heart rate variability data for last night. It looks like there might not be any data recorded, or the data collection was interrupted. You might want to check if your device was properly connected or if there were any tracking issues.",
    extensionQueries: []
  },
  {
    voice: 'default',
    verbosity: 'very-detailed',
    userQuestion: "What was my heart rate variability last night?",
    data: "{\"success\": false, \"error\": \"Invalid query\"}",
    response: "I'm unable to retrieve your heart rate variability data due to an error with the query. The system returned an 'Invalid query' error, which suggests there might be an issue with how the request was formatted or processed. You might want to try rephrasing your question or check if the data source is available.",
    extensionQueries: []
  }
]; 