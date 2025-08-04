import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getLogs } from '../api/log';
import { checkWhoopStatus } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Activity, Moon, Heart, Clock, Apple, BookOpen, Brain, Coffee, Check, Pencil, Lock } from 'lucide-react';
import { formatDateAsCentral, toCentralTime, getCurrentCentralDate, isSameDayInCentral } from '../utils/dateUtils';

export default function Dashboard() {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    // Show login prompt if not authenticated
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-900 rounded-2xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full animate-fadein">
                    <Lock size={48} className="text-white mb-4" />
                    <div className="text-3xl font-bold mb-2 text-white">Sign in required</div>
                    <div className="text-lg text-white/80 mb-6 text-center">You need to be logged in to access this page. Please log in to continue.</div>
                    <Link to="/login" className="px-8 py-3 bg-black/80 rounded-lg text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform border border-white/10">Go to Login</Link>
                </div>
            </div>
        );
    }
    const [logs, setLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(getCurrentCentralDate());
    const [currentMonth, setCurrentMonth] = useState(getCurrentCentralDate());
    const [isLoading, setIsLoading] = useState(true);
    const [whoopStatus, setWhoopStatus] = useState({ hasCredentials: false, isConnected: false });

    useEffect(() => {
        if (!token) return;
        setIsLoading(true);
        getLogs(token)
            .then(res => setLogs(res))
            .finally(() => setIsLoading(false));
        
        // Check WHOOP connection status
        checkWhoopStatus()
            .then(status => setWhoopStatus(status))
            .catch(error => console.error('Failed to check WHOOP status:', error));
    }, [token]);

    const extractLogData = (log) => {
        const values = log.healthData.values;
        const extracted = {
            notes: log.healthData.notes,
            format: 'comprehensive'
        };
        return extracted;
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getLogForDate = (date) => {
        const dateString = formatDateAsCentral(date);
        const log = logs.find(log => log.date === dateString);
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
                days.push(<div key={`empty-${i}`} className="h-28 border border-gray-600 bg-gray-700/30"></div>);
            }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const logData = getLogForDate(date);
            const isSelected = selectedDate && isSameDayInCentral(selectedDate, date);
            const isToday = isSameDayInCentral(today, date);

            // Determine background color based on log status
            let bgColor = 'hover:bg-white/10 bg-gray-800/30'; // default
            
            if (logData) {
                // Day has a log - green
                bgColor = 'bg-green-800/30 hover:bg-green-700/50';
            } else if (firstLogDate && date >= firstLogDate && date < today) {
                // Day is between first log date and today (exclusive) but has no log - red
                bgColor = 'bg-red-800/30 hover:bg-red-700/50';
            }

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`h-28 border border-gray-600 p-2 cursor-pointer transition-all ${bgColor}`}
                >
                    <div className={`text-sm ${isToday ? 'font-medium text-blue-400' : 'text-gray-300'}`}>
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

    if (!token) return <p className="text-center mt-10 text-white">Please log in.</p>;

    return (
        <div className="min-h-screen bg-black text-white pt-16">
            <div className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-light text-white mb-2">
                    Welcome back!
                </h2>
                <p className="text-gray-300 mb-6 text-sm opacity-75">Click the + button to add today's data.</p>
                <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-light text-white">Your Wellness Calendar</h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5 text-white" />
                            </button>
                            <span className="text-white">
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={() => changeMonth(1)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ChevronRight className="h-5 w-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                            <p className="mt-4 text-gray-300">Loading your wellness data...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-300 mb-2">Your wellness journey begins here</p>
                            <p className="text-gray-400">Start tracking your daily progress to see your growth</p>
                            <button
                                onClick={() => navigate('/log')}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Entry
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-7 gap-px bg-gray-800/50 rounded-lg overflow-hidden mb-6">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="bg-gray-700/50 p-2 text-center text-sm font-medium text-gray-300">
                                        {day}
                                    </div>
                                ))}
                                {renderCalendar()}
                            </div>
                        </>
                    )}
                </div>
                
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate(`/log${selectedDate ? `?date=${formatDateAsCentral(selectedDate)}` : ''}`)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all flex items-center justify-center"
            >
                {selectedDate && getLogForDate(selectedDate) ? (<Pencil className="h-6 w-6" />) : (<Plus className="h-6 w-6" />)}
            </button>
        </div>
    );
}