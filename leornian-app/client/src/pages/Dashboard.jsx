import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getLogs } from '../api/log';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Dashboard() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (!token) return;
        getLogs(token).then(res => setLogs(res.data));
    }, [token]);

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
        return logs.find(log => formatDate(new Date(log.createdAt)) === formatDate(date));
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const log = getLogForDate(date);
            const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date);

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`h-24 border border-gray-100 p-2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                >
                    <div className="text-sm text-gray-600">{day}</div>
                    {log && (
                        <div className="mt-1">
                            <div className="text-xs text-blue-600">Focus: {log.focusScore}/10</div>
                            <div className="text-xs text-green-600">Sleep: {log.sleepHours}h</div>
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

    if (!token) return <p className="text-center mt-10">Please log in.</p>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-light text-gray-900">Your Wellness Calendar</h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <span className="text-gray-700">
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={() => changeMonth(1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {logs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 mb-2">Your wellness journey begins here</p>
                            <p className="text-gray-500">Start tracking your daily progress to see your growth</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden mb-6">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
                                        {day}
                                    </div>
                                ))}
                                {renderCalendar()}
                            </div>

                            {selectedDate && getLogForDate(selectedDate) && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Focus Score</p>
                                            <p className="text-lg font-medium">{getLogForDate(selectedDate).focusScore}/10</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Sleep</p>
                                            <p className="text-lg font-medium">{getLogForDate(selectedDate).sleepHours}h</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">HRV</p>
                                            <p className="text-lg font-medium">{getLogForDate(selectedDate).hrv}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Strain</p>
                                            <p className="text-lg font-medium">{getLogForDate(selectedDate).strain}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Screen Time</p>
                                            <p className="text-lg font-medium">{getLogForDate(selectedDate).screenTime}min</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Diet</p>
                                            <p className="text-lg font-medium">{getLogForDate(selectedDate).dietSummary}</p>
                                        </div>
                                    </div>
                                    {getLogForDate(selectedDate).notes && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600">Notes</p>
                                            <p className="text-gray-900">{getLogForDate(selectedDate).notes}</p>
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
                className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all flex items-center justify-center"
            >
                <Plus className="h-6 w-6" />
            </button>
        </div>
    );
}