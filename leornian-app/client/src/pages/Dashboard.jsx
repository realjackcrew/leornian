import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getLogs } from '../api/log';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Activity, Moon, Heart, Clock, Apple, BookOpen, Brain, Coffee, Check } from 'lucide-react';
import { formatDateToCentral, toCentralTime, getCurrentCentralDate, isSameDayInCentral } from '../utils/dateUtils';

export default function Dashboard() {
    const { token, firstName } = useContext(AuthContext);
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(getCurrentCentralDate());
    const [currentMonth, setCurrentMonth] = useState(getCurrentCentralDate());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setIsLoading(true);
        getLogs(token)
            .then(res => setLogs(res.data))
            .finally(() => setIsLoading(false));
    }, [token]);

    const extractLogData = (log) => {
        const values = log.healthData.values;
        const extracted = {
            notes: log.healthData.notes || log.notes,
            format: 'comprehensive'
        };
        
        // Extract key metrics from values
        if (values.sleep) {
            extracted.sleepHours = values.sleep.sleepHours;
            extracted.sleepQuality = values.sleep.sleepQuality;
        }
        if (values.mentalHealth) {
            extracted.focusScore = values.mentalHealth.focusScore;
            extracted.moodRating = values.mentalHealth.moodRating;
            extracted.anxietyLevel = values.mentalHealth.anxietyLevel;
            extracted.energyLevel = values.mentalHealth.energyLevel;
        }
        if (values.physicalHealth) {
            extracted.hrv = values.physicalHealth.hrv;
            extracted.exerciseMinutes = values.physicalHealth.exerciseMinutes;
            extracted.steps = values.physicalHealth.steps;
        }
        if (values.lifestyle) {
            extracted.screenTime = values.lifestyle.screenTime;
            extracted.stressLevel = values.lifestyle.stressLevel;
            extracted.productivityScore = values.lifestyle.productivityScore;
        }
        if (values.nutrition) {
            extracted.waterIntake = values.nutrition.waterIntake;
            extracted.vegetables = values.nutrition.vegetables;
        }
        
        return extracted;
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getLogForDate = (date) => {
        const log = logs.find(log => isSameDayInCentral(new Date(log.createdAt), date));
        return log ? extractLogData(log) : null;
    };

    const getFirstLogDate = () => {
        if (logs.length === 0) return null;
        const sortedLogs = [...logs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return toCentralTime(new Date(sortedLogs[0].createdAt));
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];
        const firstLogDate = getFirstLogDate();
        const today = getCurrentCentralDate();

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-28 border border-gray-100 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const logData = getLogForDate(date);
            const isSelected = selectedDate && isSameDayInCentral(selectedDate, date);
            const isToday = isSameDayInCentral(today, date);

            // Determine background color based on log status
            let bgColor = 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800/50'; // default
            
            if (logData) {
                // Day has a log - green
                bgColor = 'bg-green-100 dark:bg-green-800/30 hover:bg-green-200 dark:hover:bg-green-700';
            } else if (firstLogDate && date >= firstLogDate && date <= today) {
                // Day is between first log date and today (inclusive) but has no log - red
                bgColor = 'bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-700';
            }

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`h-28 border border-gray-100 dark:border-gray-600 p-2 cursor-pointer transition-all ${bgColor}`}
                >
                    <div className={`text-sm ${isToday ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {day}
                    </div>
                </div>
            );
        }

        return days;
    };

    const changeMonth = (delta) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
    };

    if (!token) return <p className="text-center mt-10 text-gray-900 dark:text-white">Please log in.</p>;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-16">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border-transparent p-5 mb-6">
                    <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                        Welcome back!
                    </h2>
                </div>

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
                                
                            {/* {selectedDate && getLogForDate(selectedDate) && (
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
                            )} */}
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