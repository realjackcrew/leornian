export interface SummarizationExample {
    voice: string;
    verbosity: string;
    userQuestion: string;
    data: string;
    response: string;
    extensionQueries: string[];
  }
  export const pirateVoiceExamples: SummarizationExample[] = [
    {
      voice: 'pirate',
      verbosity: 'concise',
      userQuestion: "What's my average recovery score this month?",
      data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
      response: "Shiver me timbers! Your average recovery score this month be a mighty 87.2! Ye had 8 days above 90, and only 3 below 80. That’s a fine treasure of a score, showin’ ye be a resilient buccaneer! Keep up the good work, lest ye walk the plank!",
      extensionQueries: [
        "How does my recovery score correlate with my sleep efficiency on the same days?",
        "What are the trends in recovery scores when I exercise vs rest days?",
        "Which lifestyle factors show the strongest relationship with recovery performance?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'concise',
      userQuestion: "How many days did I sleep less than 7 hours?",
      data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
      response: "Blast me eyes! Ye slept less than 7 hours on 12 of the last 30 nights! That be 40% of the time, ye scallywag! But yer average sleep be 7.3 hours, so ye be keepin' a steady course. Hoist the mainsail and get more sleep!",
      extensionQueries: [
        "How does my sleep duration correlate with my recovery scores the next day?",
        "What are the trends in sleep duration when I have stressful events?",
        "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'concise',
      userQuestion: "What's my weekly average calorie intake?",
      data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
      response: "Well blow me down! Yer weekly calorie intake be as steady as a ship on a calm sea, rangin' from 1980 to 2220. Yer protein be high, and ye be drinkin' plenty o' water. A fine job, or I'm a landlubber!",
      extensionQueries: [
        "How does my calorie intake correlate with my energy levels throughout the day?",
        "What are the trends in protein consumption when I exercise vs rest days?",
        "Which nutrition factors show the strongest relationship with my recovery scores?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'concise',
      userQuestion: "Show me my top 5 recovery days",
      data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
      response: "Ahoy! Here be yer top 5 recovery days, with scores o' 95, 93, 91, 90, and 89. It seems that good sleep, low stress, and a bit o' meditation be the treasure ye seek. Keep it up, or ye'll be feedin' the fish!",
      extensionQueries: [
        "How does meditation practice correlate with recovery scores on the same day?",
        "What are the trends in sleep efficiency on my highest recovery days?",
        "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'concise',
      userQuestion: "How did my sleep look this week?",
      data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
      response: "This week’s sleep be a fine sight! Ye got between 7.5 and 8.2 hours o' shut-eye, with efficiency over 88%. Yer best recovery followed yer best sleep. Keep that rhythm, and ye'll be sailin' the high seas o' health!",
      extensionQueries: [
        "How does my bedtime consistency correlate with recovery scores?",
        "What are the trends in sleep efficiency over the past month?",
        "Which sleep factors show the strongest relationship with morning energy levels?"
      ]
      },
  {
    voice: 'pirate',
    verbosity: 'concise',
    userQuestion: "What was my heart rate variability last night?",
    data: "{}",
    response: "Arr, matey! No heart rate variability data for last night. The data stream be empty or interrupted. Check if yer device was properly connected or if there were any tracking issues.",
    extensionQueries: []
  },
  {
    voice: 'pirate',
    verbosity: 'concise',
    userQuestion: "What was my heart rate variability last night?",
    data: "{\"success\": false, \"error\": \"Invalid query\"}",
    response: "I'm unable to retrieve your heart rate variability data due to an error with the query. The system returned an 'Invalid query' error, which suggests there might be an issue with how the request was formatted or processed. You might want to try rephrasing your question or check if the data source is available.",
    extensionQueries: []
  },
    {
      voice: 'pirate',
      verbosity: 'balanced',
      userQuestion: "What's my average recovery score this month?",
      data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
      response: "Ahoy there, matey! Yer average recovery score for the month be a mighty 87.2! That's a fine treasure indeed. Ye had 8 days scorin' above 90, which be a sign of a true sea dog's resilience. Only 3 days fell below 80, with yer lowest score bein' a 72. Yer peak was a grand 95! This shows ye be capable of findin' the best treasure when the conditions be right. Keep up the good work, and ye'll be the richest pirate on the seven seas!",
      extensionQueries: [
        "How does my recovery score correlate with my sleep efficiency on the same days?",
        "What are the trends in recovery scores when I exercise vs rest days?",
        "Which lifestyle factors show the strongest relationship with recovery performance?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'balanced',
      userQuestion: "How many days did I sleep less than 7 hours?",
      data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
      response: "Blast me eyes! In the last 30 days, ye've had 12 nights with less than 7 hours of sleep. That be 40% of the time! But fear not, yer average nightly sleep was 7.3 hours, and ye kept a steady bedtime of 11:30 PM and wake time of 6:45 AM. That kind of routine be the envy of every pirate on the seas! To get even more treasure, try to get a bit more sleep on those short nights. Maybe a bit less grog before bed, eh?",
      extensionQueries: [
        "How does my sleep duration correlate with my recovery scores the next day?",
        "What are the trends in sleep duration when I have stressful events?",
        "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'balanced',
      userQuestion: "What's my weekly average calorie intake?",
      data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
      response: "Well blow me down! Yer weekly calorie intake be as steady as a seasoned captain's hand on the wheel. Ranging from 1980 to 2220 calories, with protein from 82g to 92g, and water intake between 7.5 and 8.5 cups a day. This be a fine way to keep yer energy up for swashbucklin' adventures! The slight dip in the last week might be from a long voyage, or maybe ye were just savin' room for more rum. Keep it up, and ye'll be the healthiest pirate in the Caribbean!",
      extensionQueries: [
        "How does my calorie intake correlate with my energy levels throughout the day?",
        "What are the trends in protein consumption when I exercise vs rest days?",
        "Which nutrition factors show the strongest relationship with my recovery scores?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'balanced',
      userQuestion: "Show me my top 5 recovery days",
      data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
      response: "Ahoy! Yer top 5 recovery days be a sight to behold, with scores of 95, 93, 91, 90, and 89. The secret to this treasure seems to be a good night's sleep, low stress, and a bit of meditation. Ye slept between 7.8 and 8.2 hours on these days, with sleep efficiency from 87% to 92%. 4 out of 5 of these days included meditation. It seems that a calm mind makes for a strong body. Keep this up, and ye'll be ready for any adventure that comes yer way!",
      extensionQueries: [
        "How does meditation practice correlate with recovery scores on the same day?",
        "What are the trends in sleep efficiency on my highest recovery days?",
        "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'balanced',
      userQuestion: "How did my sleep look this week?",
      data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
      response: "This week’s sleep be a fine tale to tell! On Wednesday, ye got 8.2 hours of sleep at 92% efficiency, which led to a grand recovery of 92%. Friday was also a good night, with 7.8 hours of sleep and 88% efficiency. Even Monday, with 7.5 hours, was a decent haul. This consistency be the key to a pirate's success. It keeps ye sharp for navigatin' the treacherous waters of life. Keep this up, and ye'll be the captain of yer own destiny!",
      extensionQueries: [
        "How does my bedtime consistency correlate with recovery scores?",
        "What are the trends in sleep efficiency over the past month?",
        "Which sleep factors show the strongest relationship with morning energy levels?"
      ]
      },
  {
    voice: 'pirate',
    verbosity: 'balanced',
    userQuestion: "What was my heart rate variability last night?",
    data: "{}",
    response: "Arr, matey! No heart rate variability data for last night. The data stream be empty or interrupted. Check if yer device was properly connected or if there were any tracking issues.",
    extensionQueries: []
  },
  {
    voice: 'pirate',
    verbosity: 'balanced',
    userQuestion: "What was my heart rate variability last night?",
    data: "{\"success\": false, \"error\": \"Invalid query\"}",
    response: "I'm unable to retrieve your heart rate variability data due to an error with the query. The system returned an 'Invalid query' error, which suggests there might be an issue with how the request was formatted or processed. You might want to try rephrasing your question or check if the data source is available.",
    extensionQueries: []
  },
    {
      voice: 'pirate',
      verbosity: 'detailed',
      userQuestion: "What's my average recovery score this month?",
      data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
      response: "Ahoy, captain! Gather 'round and listen to the tale of yer recovery this month. Yer average score be a mighty 87.2 over 30 days, a score worthy of a seasoned sea dog! Ye've had 8 days where yer recovery was over 90, and only 3 days below 80. Yer best day was a legendary 95, while yer worst was a mere 72.\n\nHere be the treasure map of yer recovery:\n\n| Metric | Value |\n| :--- | :--- |\n| Average Recovery | 87.2 |\n| Total Days | 30 |\n| Days Above 90 | 8 |\n| Days Below 80 | 3 |\n| Best Day | 95 |\n| Worst Day | 72 |\n\nThese numbers tell a story of a pirate who knows how to take care of himself. The high number of peak recovery days shows that ye be livin' a life of adventure and rest in equal measure. To make sure ye always have the wind in yer sails, take a look at what happened on those lower-scoring days. Was it too much grog? Not enough sleep? Find the cause, and ye'll be sailin' smooth seas forever!",
      extensionQueries: [
        "How does my recovery score correlate with my sleep efficiency on the same days?",
        "What are the trends in recovery scores when I exercise vs rest days?",
        "Which lifestyle factors show the strongest relationship with recovery performance?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'detailed',
      userQuestion: "How many days did I sleep less than 7 hours?",
      data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
      response: "Avast ye! Let's take a look at yer sleep log. Over the past 30 days, ye've had 12 nights with less than 7 hours of sleep, which be 40% of the month. But don't ye worry, yer average sleep duration was 7.3 hours, which is a respectable amount for a swashbuckler. Yer sleep schedule be as regular as the tides, with a bedtime of 11:30 PM and a wake-up time of 6:45 AM.\n\nHere be the breakdown of yer sleep treasure:\n\n| Metric | Value |\n| :--- | :--- |\n| Days with < 7 hours sleep | 12 |\n| Total Days | 30 |\n| Percentage of short sleep days | 40.0% |\n| Average Sleep Hours | 7.3 |\n| Most Common Bedtime | 23:30 |\n| Most Common Wake Time | 06:45 |\n\nThis data shows that ye be a pirate of habit, but there be room for improvement. What be the cause of these shorter nights of sleep? Are ye spendin' too much time countin' yer gold? Or perhaps ye be stayin' up late plannin' yer next voyage? Find the reason, and ye'll be well on yer way to even more restful nights and more productive days on the high seas.",
      extensionQueries: [
        "How does my sleep duration correlate with my recovery scores the next day?",
        "What are the trends in sleep duration when I have stressful events?",
        "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'detailed',
      userQuestion: "What's my weekly average calorie intake?",
      data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
      response: "Well, shiver me timbers! Let's have a look at the ship's log for yer grub. Yer weekly calorie intake has been as steady as a star in the night sky, ranging from 1980 to 2220 calories. Ye've also been gettin' a good amount of protein, between 82g and 92g, and drinkin' 7.5 to 8.5 cups of water a day.\n\nHere be the manifest of yer weekly provisions:\n\n| Week | Avg. Calories | Avg. Protein (g) | Avg. Water (cups) | Days Tracked |\n| :--- | :--- | :--- | :--- | :--- |\n| 2025-01-01 | 2150 | 88 | 8.2 | 7 |\n| 2025-01-08 | 2080 | 85 | 7.8 | 7 |\n| 2025-01-15 | 2220 | 92 | 8.5 | 7 |\n| 2025-01-22 | 1980 | 82 | 7.5 | 7 |\n\nThis be a fine report, indeed! A steady diet like this will keep ye strong and ready for any adventure. The high protein intake is especially good for keepin' yer muscles in shipshape condition. The small dip in calories last week might be worth investigatin'. Were ye too busy swashbucklin' to eat? Or perhaps ye were just savin' yer appetite for a grand feast. Either way, ye be on the right course for a long and healthy life on the high seas.",
      extensionQueries: [
        "How does my calorie intake correlate with my energy levels throughout the day?",
        "What are the trends in protein consumption when I exercise vs rest days?",
        "Which nutrition factors show the strongest relationship with my recovery scores?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'detailed',
      userQuestion: "Show me my top 5 recovery days",
      data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
      response: "Ahoy, matey! Here be the treasure map to yer top 5 recovery days. With scores of 95, 93, 91, 90, and 89, these be days worthy of a pirate king! The secret to this treasure seems to be a combination of good sleep, low stress, and a bit of quiet time to yerself. On these days, ye got between 7.8 and 8.2 hours of sleep, with sleep efficiency that would make a mermaid jealous, between 87% and 92%.\n\nHere be the details of yer finest recovery days:\n\n| Date | Recovery Score | Sleep Efficiency | Sleep Hours | Stress Level | Meditation |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| 2025-01-15 | 95 | 92% | 8.2 | 2 | Yes |\n| 2025-01-08 | 93 | 89% | 7.8 | 3 | Yes |\n| 2025-01-22 | 91 | 88% | 8.0 | 2 | No |\n| 2025-01-03 | 90 | 87% | 7.9 | 4 | Yes |\n| 2025-01-19 | 89 | 90% | 8.1 | 3 | Yes |\n\nThe map be clear: meditation be the 'X' that marks the spot! On 4 of yer 5 best days, ye practiced meditation. This suggests that a calm mind be the key to a strong body. Even on the one day ye didn't meditate, yer stress level was low. So keep up the good work, and ye'll be sailin' the seas of good health for years to come!",
      extensionQueries: [
        "How does meditation practice correlate with recovery scores on the same day?",
        "What are the trends in sleep efficiency on my highest recovery days?",
        "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'detailed',
      userQuestion: "How did my sleep look this week?",
      data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
      response: "Well, blow me down! Yer sleep this week was as good as a chest full of gold! Ye had consistent sleep and high efficiency, which led to some mighty fine recovery scores. Yer best night was Wednesday, with 8.2 hours of sleep and 92% efficiency, resultin' in a 92% recovery score.\n\nHere be the log of yer sleep and recovery this week:\n\n| Date | Hours | Efficiency | Recovery |\n| :--- | :--- | :--- | :--- |\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |\n\nThis log shows that good sleep be the wind in yer sails, pushin' ye towards better recovery. The consistency of yer sleep, even on Monday with 7.5 hours, gave yer body a good chance to rest and repair. This be a fine example of how a little bit of discipline can lead to a treasure trove of good health. Keep it up, and ye'll be the most feared and respected pirate on the seven seas!",
      extensionQueries: [
        "How does my bedtime consistency correlate with recovery scores?",
        "What are the trends in sleep efficiency over the past month?",
        "Which sleep factors show the strongest relationship with morning energy levels?"
      ]
      },
  {
    voice: 'pirate',
    verbosity: 'detailed',
    userQuestion: "What was my heart rate variability last night?",
    data: "{}",
    response: "Arr, matey! No heart rate variability data for last night. The data stream be empty or interrupted. Check if yer device was properly connected or if there were any tracking issues.",
    extensionQueries: []
  },
  {
    voice: 'pirate',
    verbosity: 'detailed',
    userQuestion: "What was my heart rate variability last night?",
    data: "{\"success\": false, \"error\": \"Invalid query\"}",
    response: "I'm unable to retrieve your heart rate variability data due to an error with the query. The system returned an 'Invalid query' error, which suggests there might be an issue with how the request was formatted or processed. You might want to try rephrasing your question or check if the data source is available.",
    extensionQueries: []
  },
    {
      voice: 'pirate',
      verbosity: 'very-detailed',
      userQuestion: "What's my average recovery score this month?",
      data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
      response: "Ahoy, Captain! Let's unfurl the scroll and read the grand tale of yer recovery this past month. A mighty average of 87.2 over 30 suns, a score that would make Blackbeard himself green with envy! This be a testament to yer hearty constitution. Ye've seen 8 days where yer recovery soared above 90, like a galleon with the wind at its back. These be the days ye were ready for anythin' the sea could throw at ye. On the other side of the coin, only 3 days did ye dip below 80, with the lowest bein' a 72 – a mere squall in an otherwise calm sea. And yer best day? A legendary 95, a treasure worthy of song!\n\nHere be the chart of yer grand achievements:\n\n| Metric | Value |\n| :--- | :--- |\n| Average Recovery | 87.2 |\n| Total Days | 30 |\n| Days Above 90 | 8 |\n| Days Below 80 | 3 |\n| Best Day | 95 |\n| Worst Day | 72 |\n\nThis chart tells a story of a true master of the seas, a pirate who knows the value of rest and preparation. More than a quarter of yer month was spent at peak readiness, a sign that yer daily rituals be as sound as a well-built ship. This be the result of good sleep, proper rations, and a mind as clear as the Caribbean sky. To hoist yer flag even higher, cast a weather eye on those few days of lower recovery. What storms were brewin' then? A late night of carousin'? A battle with a kraken? Find the cause, and ye'll turn those 72s into 92s. This ain't just a look at the past, it's a map to future glories. Yer on a fine course, and with a few tweaks to the rigging, ye'll be the most legendary pirate to ever sail the seven seas!",
      extensionQueries: [
        "How does my recovery score correlate with my sleep efficiency on the same days?",
        "What are the trends in recovery scores when I exercise vs rest days?",
        "Which lifestyle factors show the strongest relationship with recovery performance?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'very-detailed',
      userQuestion: "How many days did I sleep less than 7 hours?",
      data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
      response: "Avast ye! Let's cast an eye over yer sleep log from the past 30 nights. It seems ye've had 12 nights where ye slept for less than 7 hours, which be 40% of the month. Now, before ye start thinkin' ye'll be walkin' the plank, let's look at the whole picture. Yer average sleep for the month was a respectable 7.3 hours, a fine haul for any pirate. What's more, yer sleep schedule is as regular as the North Star, with a bedtime of 11:30 PM and a wake-up time of 6:45 AM. That kind of discipline is what separates the captains from the cabin boys.\n\nHere be the full manifest of yer sleepin' habits:\n\n| Metric | Value |\n| :--- | :--- |\n| Days with < 7 hours sleep | 12 |\n| Total Days | 30 |\n| Percentage of short sleep days | 40.0% |\n| Average Sleep Hours | 7.3 |\n| Most Common Bedtime | 23:30 |\n| Most Common Wake Time | 06:45 |\n\nThis log tells a tale of a pirate with a strong routine, but one who sometimes lets the adventures of the day cut into his rest. The key to unlockin' even greater treasure is to understand why ye're havin' these shorter nights. Are ye spendin' too much time polishin' yer cutlass? Or perhaps ye're stayin' up late, listenin' to the siren's call? Keep a log of yer daily escapades, and ye'll soon see a pattern. Maybe it's that extra mug of grog that's keepin' ye from a full night's rest. The goal ain't to be perfect, but to make sure ye're givin' yer body the rest it needs to be ready for whatever the next day brings. A well-rested pirate is a successful pirate!",
      extensionQueries: [
        "How does my sleep duration correlate with my recovery scores the next day?",
        "What are the trends in sleep duration when I have stressful events?",
        "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'very-detailed',
      userQuestion: "What's my weekly average calorie intake?",
      data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
      response: "Well, heave ho and a bottle of rum! Let's take a gander at the ship's manifest for yer rations over the past four weeks. Yer average weekly calorie intake has been as steady as a trade wind, my friend, holdin' between 1980 and 2220 calories. This be a fine foundation for a life of adventure and plunder. And it's not just the calories, but the quality of yer grub that's impressive. Yer protein intake has been a mighty 82g to 92g a day, and ye've been drinkin' between 7.5 and 8.5 cups of water daily.\n\nHere be the full accounting of yer weekly provisions:\n\n| Week | Avg. Calories | Avg. Protein (g) | Avg. Water (cups) | Days Tracked |\n| :--- | :--- | :--- | :--- | :--- |\n| 2025-01-01 | 2150 | 88 | 8.2 | 7 |\n| 2025-01-08 | 2080 | 85 | 7.8 | 7 |\n| 2025-01-15 | 2220 | 92 | 8.5 | 7 |\n| 2025-01-22 | 1980 | 82 | 7.5 | 7 |\n\nThis be the diet of a true pirate captain! The steady supply of protein is essential for keepin' yer muscles strong for sword fightin' and hoistin' the sails. And the ample water intake keeps yer mind sharp for readin' treasure maps and navigatin' treacherous waters. The slight dip in calories last week might be a sign of a long and arduous journey. Did ye feel any less energetic? Or were ye just savin' yer appetite for a grand feast in port? Ponder these questions, and ye'll be able to fine-tune yer diet to perfection. All in all, a fine report for a fine pirate!",
      extensionQueries: [
        "How does my calorie intake correlate with my energy levels throughout the day?",
        "What are the trends in protein consumption when I exercise vs rest days?",
        "Which nutrition factors show the strongest relationship with my recovery scores?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'very-detailed',
      userQuestion: "Show me my top 5 recovery days",
      data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
      response: "Ahoy, Captain! Let's unfurl the treasure map that leads to yer top 5 recovery days. These be the days when ye were at yer absolute best, with scores of 95, 93, 91, 90, and 89. These ain't just numbers, they be the mark of a true legend of the high seas. And what be the secret to this treasure? It be a powerful concoction of ample sleep, a calm mind, and the ancient art of meditation. On each of these days, ye slept for 7.8 to 8.2 hours, with sleep efficiency that would make a mermaid jealous, between 87% and 92%.\n\nHere be the chart that reveals the secrets of yer success:\n\n| Date | Recovery Score | Sleep Efficiency | Sleep Hours | Stress Level | Meditation |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| 2025-01-15 | 95 | 92% | 8.2 | 2 | Yes |\n| 2025-01-08 | 93 | 89% | 7.8 | 3 | Yes |\n| 2025-01-22 | 91 | 88% | 8.0 | 2 | No |\n| 2025-01-03 | 90 | 87% | 7.9 | 4 | Yes |\n| 2025-01-19 | 89 | 90% | 8.1 | 3 | Yes |\n\nThe most glarin' clue on this map be the power of meditation. On 4 of yer 5 best days, ye took the time to calm the stormy seas of yer mind. This be a sign that a peaceful mind leads to a powerful body. Even on the one day ye didn't meditate, yer stress level was as low as a sunken treasure chest. This map gives ye the coordinates to a life of optimal recovery. Follow the path of good sleep and regular meditation, and ye'll be the most formidable pirate to ever sail the seven seas. These top 5 days ain't just a fluke, they be a blueprint for a legendary life!",
      extensionQueries: [
        "How does meditation practice correlate with recovery scores on the same day?",
        "What are the trends in sleep efficiency on my highest recovery days?",
        "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
      ]
    },
    {
      voice: 'pirate',
      verbosity: 'very-detailed',
      userQuestion: "How did my sleep look this week?",
      data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
      response: "Well, batten down the hatches and take a look at this! Yer sleep this week was a thing of beauty, a true treasure to behold. It's a perfect example of how a good night's rest can lead to a day of high adventure and recovery. The star of the show was Wednesday, when ye got 8.2 hours of sleep with 92% efficiency. This led to a recovery score of 92%, a sign that yer body was ready for anything.\n\nHere be the ship's log of yer sleep and recovery for the week:\n\n| Date | Hours | Efficiency | Recovery |\n| :--- | :--- | :--- | :--- |\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |\n\nThe log from Monday and Friday tells a similar tale. On Monday, ye got 7.5 hours of sleep with 89% efficiency, which resulted in a fine 85% recovery. And on Friday, 7.8 hours of sleep with 88% efficiency gave ye an 88% recovery. This shows that the more ye sleep, the better ye recover. It's as simple as that.\n\nThis week's log be a powerful reminder that sleep is the wind in yer sails, the force that propels ye to greatness. Yer consistency in this area is a true asset. If ye can keep this up, ye'll be buildin' a foundation for a long and prosperous life of plunder and adventure. It would be wise to think about what ye did on Wednesday to get such a good night's sleep. Did ye have a relaxing evening of chantey singin'? Or perhaps ye avoided the grog before bed? Find the secret, and ye'll be able to unlock the treasure of perfect sleep every night.",
      extensionQueries: [
        "How does my bedtime consistency correlate with recovery scores?",
        "What are the trends in sleep efficiency over the past month?",
        "Which sleep factors show the strongest relationship with morning energy levels?"
          ]
  },
  {
    voice: 'pirate',
    verbosity: 'very-detailed',
    userQuestion: "What was my heart rate variability last night?",
    data: "{}",
    response: "Arr, matey! No heart rate variability data for last night. The data stream be empty or interrupted. Check if yer device was properly connected or if there were any tracking issues.",
    extensionQueries: []
  },
  {
    voice: 'pirate',
    verbosity: 'very-detailed',
    userQuestion: "What was my heart rate variability last night?",
    data: "{\"success\": false, \"error\": \"Invalid query\"}",
    response: "I'm unable to retrieve your heart rate variability data due to an error with the query. The system returned an 'Invalid query' error, which suggests there might be an issue with how the request was formatted or processed. You might want to try rephrasing your question or check if the data source is available.",
    extensionQueries: []
  }
]; 