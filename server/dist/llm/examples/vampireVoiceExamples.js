"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vampireVoiceExamples = void 0;
exports.getExamplesForVoiceAndVerbosity = getExamplesForVoiceAndVerbosity;
exports.vampireVoiceExamples = [
    // CONCISE EXAMPLES
    {
        voice: 'vampire',
        verbosity: 'concise',
        userQuestion: "What's my average recovery score this month?",
        data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - CONCISE]",
        extensionQueries: [
            "How does my recovery score correlate with my sleep efficiency on the same days?",
            "What are the trends in recovery scores when I exercise vs rest days?",
            "Which lifestyle factors show the strongest relationship with recovery performance?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'concise',
        userQuestion: "How many days did I sleep less than 7 hours?",
        data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - CONCISE]",
        extensionQueries: [
            "How does my sleep duration correlate with my recovery scores the next day?",
            "What are the trends in sleep duration when I have stressful events?",
            "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'concise',
        userQuestion: "What's my weekly average calorie intake?",
        data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - CONCISE]",
        extensionQueries: [
            "How does my calorie intake correlate with my energy levels throughout the day?",
            "What are the trends in protein consumption when I exercise vs rest days?",
            "Which nutrition factors show the strongest relationship with my recovery scores?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'concise',
        userQuestion: "Show me my top 5 recovery days",
        data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - CONCISE]",
        extensionQueries: [
            "How does meditation practice correlate with recovery scores on the same day?",
            "What are the trends in sleep efficiency on my highest recovery days?",
            "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'concise',
        userQuestion: "How did my sleep look this week?",
        data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
        response: "[RESPONSE FOR VAMPIRE VOICE - CONCISE]",
        extensionQueries: [
            "How does my bedtime consistency correlate with recovery scores?",
            "What are the trends in sleep efficiency over the past month?",
            "Which sleep factors show the strongest relationship with morning energy levels?"
        ]
    },
    // BALANCED EXAMPLES
    {
        voice: 'vampire',
        verbosity: 'balanced',
        userQuestion: "What's my average recovery score this month?",
        data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - BALANCED]",
        extensionQueries: [
            "How does my recovery score correlate with my sleep efficiency on the same days?",
            "What are the trends in recovery scores when I exercise vs rest days?",
            "Which lifestyle factors show the strongest relationship with recovery performance?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'balanced',
        userQuestion: "How many days did I sleep less than 7 hours?",
        data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - BALANCED]",
        extensionQueries: [
            "How does my sleep duration correlate with my recovery scores the next day?",
            "What are the trends in sleep duration when I have stressful events?",
            "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'balanced',
        userQuestion: "What's my weekly average calorie intake?",
        data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - BALANCED]",
        extensionQueries: [
            "How does my calorie intake correlate with my energy levels throughout the day?",
            "What are the trends in protein consumption when I exercise vs rest days?",
            "Which nutrition factors show the strongest relationship with my recovery scores?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'balanced',
        userQuestion: "Show me my top 5 recovery days",
        data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - BALANCED]",
        extensionQueries: [
            "How does meditation practice correlate with recovery scores on the same day?",
            "What are the trends in sleep efficiency on my highest recovery days?",
            "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'balanced',
        userQuestion: "How did my sleep look this week?",
        data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
        response: "[RESPONSE FOR VAMPIRE VOICE - BALANCED]",
        extensionQueries: [
            "How does my bedtime consistency correlate with recovery scores?",
            "What are the trends in sleep efficiency over the past month?",
            "Which sleep factors show the strongest relationship with morning energy levels?"
        ]
    },
    // DETAILED EXAMPLES
    {
        voice: 'vampire',
        verbosity: 'detailed',
        userQuestion: "What's my average recovery score this month?",
        data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - DETAILED]",
        extensionQueries: [
            "How does my recovery score correlate with my sleep efficiency on the same days?",
            "What are the trends in recovery scores when I exercise vs rest days?",
            "Which lifestyle factors show the strongest relationship with recovery performance?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'detailed',
        userQuestion: "How many days did I sleep less than 7 hours?",
        data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - DETAILED]",
        extensionQueries: [
            "How does my sleep duration correlate with my recovery scores the next day?",
            "What are the trends in sleep duration when I have stressful events?",
            "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'detailed',
        userQuestion: "What's my weekly average calorie intake?",
        data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - DETAILED]",
        extensionQueries: [
            "How does my calorie intake correlate with my energy levels throughout the day?",
            "What are the trends in protein consumption when I exercise vs rest days?",
            "Which nutrition factors show the strongest relationship with my recovery scores?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'detailed',
        userQuestion: "Show me my top 5 recovery days",
        data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - DETAILED]",
        extensionQueries: [
            "How does meditation practice correlate with recovery scores on the same day?",
            "What are the trends in sleep efficiency on my highest recovery days?",
            "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'detailed',
        userQuestion: "How did my sleep look this week?",
        data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
        response: "[RESPONSE FOR VAMPIRE VOICE - DETAILED]",
        extensionQueries: [
            "How does my bedtime consistency correlate with recovery scores?",
            "What are the trends in sleep efficiency over the past month?",
            "Which sleep factors show the strongest relationship with morning energy levels?"
        ]
    },
    // VERY DETAILED EXAMPLES
    {
        voice: 'vampire',
        verbosity: 'very-detailed',
        userQuestion: "What's my average recovery score this month?",
        data: "{\"success\": true,\"data\":[{\"avg_recovery\":87.2,\"total_days\":30,\"days_above_90\":8,\"days_below_80\":3,\"best_day\":95,\"worst_day\":72}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - VERY DETAILED]",
        extensionQueries: [
            "How does my recovery score correlate with my sleep efficiency on the same days?",
            "What are the trends in recovery scores when I exercise vs rest days?",
            "Which lifestyle factors show the strongest relationship with recovery performance?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'very-detailed',
        userQuestion: "How many days did I sleep less than 7 hours?",
        data: "{\"success\": true,\"data\":[{\"days_with_less_than_7_hours\":12,\"total_days\":30,\"percentage\":40.0,\"avg_sleep_hours\":7.3,\"most_common_bedtime\":\"23:30\",\"most_common_wake_time\":\"06:45\"}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - VERY DETAILED]",
        extensionQueries: [
            "How does my sleep duration correlate with my recovery scores the next day?",
            "What are the trends in sleep duration when I have stressful events?",
            "Which bedtime patterns show the strongest relationship with getting 7+ hours of sleep?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'very-detailed',
        userQuestion: "What's my weekly average calorie intake?",
        data: "{\"success\":true,\"data\":[{\"week\":\"2025-01-01\",\"avg_calories\":2150,\"avg_protein\":88,\"avg_water\":8.2,\"days_tracked\":7},{\"week\":\"2025-01-08\",\"avg_calories\":2080,\"avg_protein\":85,\"avg_water\":7.8,\"days_tracked\":7},{\"week\":\"2025-01-15\",\"avg_calories\":2220,\"avg_protein\":92,\"avg_water\":8.5,\"days_tracked\":7},{\"week\":\"2025-01-22\",\"avg_calories\":1980,\"avg_protein\":82,\"avg_water\":7.5,\"days_tracked\":7}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - VERY DETAILED]",
        extensionQueries: [
            "How does my calorie intake correlate with my energy levels throughout the day?",
            "What are the trends in protein consumption when I exercise vs rest days?",
            "Which nutrition factors show the strongest relationship with my recovery scores?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'very-detailed',
        userQuestion: "Show me my top 5 recovery days",
        data: "{\"success\":true,\"data\":[{\"date\":\"2025-01-15\",\"recovery_score\":95,\"sleep_efficiency\":92,\"sleep_hours\":8.2,\"stress_level\":2,\"meditation\":true},{\"date\":\"2025-01-08\",\"recovery_score\":93,\"sleep_efficiency\":89,\"sleep_hours\":7.8,\"stress_level\":3,\"meditation\":true},{\"date\":\"2025-01-22\",\"recovery_score\":91,\"sleep_efficiency\":88,\"sleep_hours\":8.0,\"stress_level\":2,\"meditation\":false},{\"date\":\"2025-01-03\",\"recovery_score\":90,\"sleep_efficiency\":87,\"sleep_hours\":7.9,\"stress_level\":4,\"meditation\":true},{\"date\":\"2025-01-19\",\"recovery_score\":89,\"sleep_efficiency\":90,\"sleep_hours\":8.1,\"stress_level\":3,\"meditation\":true}],\"metadata\":{}}",
        response: "[RESPONSE FOR VAMPIRE VOICE - VERY DETAILED]",
        extensionQueries: [
            "How does meditation practice correlate with recovery scores on the same day?",
            "What are the trends in sleep efficiency on my highest recovery days?",
            "Which lifestyle factors show the strongest relationship with achieving 90%+ recovery?"
        ]
    },
    {
        voice: 'vampire',
        verbosity: 'very-detailed',
        userQuestion: "How did my sleep look this week?",
        data: "| Date | Hours | Efficiency | Recovery |\n|------|-------|------------|----------|\n| Mon | 7.5 | 89% | 85% |\n| Wed | 8.2 | 92% | 92% |\n| Fri | 7.8 | 88% | 88% |",
        response: "[RESPONSE FOR VAMPIRE VOICE - VERY DETAILED]",
        extensionQueries: [
            "How does my bedtime consistency correlate with recovery scores?",
            "What are the trends in sleep efficiency over the past month?",
            "Which sleep factors show the strongest relationship with morning energy levels?"
        ]
    }
];
function getExamplesForVoiceAndVerbosity(voice, verbosity) {
    return exports.vampireVoiceExamples.filter(example => example.voice === voice && example.verbosity === verbosity);
}
