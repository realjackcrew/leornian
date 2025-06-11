import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getLogs } from '../api/log';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Activity, Moon, Heart, Clock, Apple, BookOpen, Brain, Coffee } from 'lucide-react';

export default function Dashboard() {
    const { token, firstName } = useContext(AuthContext);
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setIsLoading(true);
        getLogs(token)
            .then(res => setLogs(res.data))
            .finally(() => setIsLoading(false));
    }, [token]);

    // Helper function to extract data from both legacy and new format
    const extractLogData = (log) => {
        if (log.healthData) {
            // New comprehensive format
            const categories = log.healthData.categories;
            const extracted = {
                notes: log.healthData.notes || log.notes,
                format: 'comprehensive'
            };
            
            // Extract key metrics from categories
            if (categories.sleep) {
                extracted.sleepHours = categories.sleep.dataPoints.sleepHours?.value;
                extracted.sleepQuality = categories.sleep.dataPoints.sleepQuality?.value;
            }
            if (categories.mentalHealth) {
                extracted.focusScore = categories.mentalHealth.dataPoints.focusScore?.value;
                extracted.moodRating = categories.mentalHealth.dataPoints.moodRating?.value;
                extracted.anxietyLevel = categories.mentalHealth.dataPoints.anxietyLevel?.value;
                extracted.energyLevel = categories.mentalHealth.dataPoints.energyLevel?.value;
            }
            if (categories.physicalHealth) {
                extracted.hrv = categories.physicalHealth.dataPoints.hrv?.value;
                extracted.exerciseMinutes = categories.physicalHealth.dataPoints.exerciseMinutes?.value;
                extracted.steps = categories.physicalHealth.dataPoints.steps?.value;
            }
            if (categories.lifestyle) {
                extracted.screenTime = categories.lifestyle.dataPoints.screenTime?.value;
                extracted.stressLevel = categories.lifestyle.dataPoints.stressLevel?.value;
                extracted.productivityScore = categories.lifestyle.dataPoints.productivityScore?.value;
            }
            if (categories.nutrition) {
                extracted.waterIntake = categories.nutrition.dataPoints.waterIntake?.value;
                extracted.vegetables = categories.nutrition.dataPoints.vegetables?.value;
            }
            
            return extracted;
        } else {
            // Legacy format
            return {
                ...log,
                format: 'legacy'
            };
        }
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const getLogForDate = (date) => {
        const log = logs.find(log => formatDate(new Date(log.createdAt)) === formatDate(date));
        return log ? extractLogData(log) : null;
    };

    const getMonthlyStats = () => {
        const currentMonthLogs = logs.filter(log => {
            const logDate = new Date(log.createdAt);
            return logDate.getMonth() === currentMonth.getMonth() && 
                   logDate.getFullYear() === currentMonth.getFullYear();
        });

        if (currentMonthLogs.length === 0) return null;

        const avgFocus = currentMonthLogs.reduce((acc, log) => acc + log.focusScore, 0) / currentMonthLogs.length;
        const avgSleep = currentMonthLogs.reduce((acc, log) => acc + log.sleepHours, 0) / currentMonthLogs.length;
        const avgHRV = currentMonthLogs.reduce((acc, log) => acc + log.hrv, 0) / currentMonthLogs.length;

        return {
            avgFocus: avgFocus.toFixed(1),
            avgSleep: avgSleep.toFixed(1),
            avgHRV: Math.round(avgHRV),
            entries: currentMonthLogs.length
        };
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-28 border border-gray-100 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const logData = getLogForDate(date);
            const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date);
            const isToday = formatDate(new Date()) === formatDate(date);

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`h-28 border border-gray-100 dark:border-gray-600 p-2 cursor-pointer transition-all ${
                        isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 shadow-sm' 
                            : isToday 
                                ? 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800/50'
                    }`}
                >
                    <div className={`text-sm ${isToday ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {day}
                    </div>
                    {logData && (
                        <div className="mt-1 space-y-1">
                            {logData.focusScore && (
                                <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                                    <Activity className="h-3 w-3 mr-1" />
                                    {logData.focusScore}/10
                                </div>
                            )}
                            {logData.sleepHours && (
                                <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                                    <Moon className="h-3 w-3 mr-1" />
                                    {logData.sleepHours}h
                                </div>
                            )}
                            {logData.format === 'comprehensive' && (
                                <div className="text-xs text-purple-600 dark:text-purple-400">
                                    ●
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const changeMonth = (delta) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
    };

    if (!token) return <p className="text-center mt-10 text-gray-900 dark:text-white">Please log in.</p>;

    const monthlyStats = getMonthlyStats();

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 pt-16">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                        Welcome back{firstName ? `, ${firstName}` : ''}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">Track your wellness journey and see your progress</p>
                </div>

                {monthlyStats && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">Avg Focus</span>
                            </div>
                            <p className="text-2xl font-light text-gray-900 dark:text-white">{monthlyStats.avgFocus}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Moon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">Avg Sleep</span>
                            </div>
                            <p className="text-2xl font-light text-gray-900 dark:text-white">{monthlyStats.avgSleep}h</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">Avg HRV</span>
                            </div>
                            <p className="text-2xl font-light text-gray-900 dark:text-white">{monthlyStats.avgHRV}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">Entries</span>
                            </div>
                            <p className="text-2xl font-light text-gray-900 dark:text-white">{monthlyStats.entries}</p>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-light text-gray-900 dark:text-white">Your Wellness Calendar</h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <span className="text-gray-700 dark:text-gray-200">
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={() => changeMonth(1)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your wellness data...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Your wellness journey begins here</p>
                            <p className="text-gray-500 dark:text-gray-400">Start tracking your daily progress to see your growth</p>
                            <button
                                onClick={() => navigate('/log')}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Entry
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden mb-6">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="bg-gray-50 dark:bg-gray-700 p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {day}
                                    </div>
                                ))}
                                {renderCalendar()}
                            </div>

                            {selectedDate && getLogForDate(selectedDate) && (
                                <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex items-center space-x-3">
                                            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Focus Score</p>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">{getLogForDate(selectedDate).focusScore}/10</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Moon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Sleep</p>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">{getLogForDate(selectedDate).sleepHours}h</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">HRV</p>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">{getLogForDate(selectedDate).hrv}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Strain</p>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">{getLogForDate(selectedDate).strain}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Screen Time</p>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">{getLogForDate(selectedDate).screenTime}min</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Apple className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Diet</p>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">{getLogForDate(selectedDate).dietSummary}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {getLogForDate(selectedDate).notes && (
                                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Notes</p>
                                            </div>
                                            <p className="text-gray-900 dark:text-white">{getLogForDate(selectedDate).notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate('/log')}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all flex items-center justify-center"
            >
                <Plus className="h-6 w-6" />
            </button>
        </div>
    );
}