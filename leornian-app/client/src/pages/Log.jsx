import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createLog } from '../api/log';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Log() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [focus, setFocus] = useState('');
    const [sleep, setSleep] = useState('');
    const [hrv, setHrv] = useState('');
    const [strain, setStrain] = useState('');
    const [screen, setScreen] = useState('');
    const [diet, setDiet] = useState('');
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createLog(token, {
                focusScore: focus,
                sleepHours: sleep,
                hrv,
                strain,
                screenTime: screen,
                dietSummary: diet,
                notes: note
            });
            navigate('/dashboard');
        } catch (error) {
            console.error('Error submitting log:', error);
            alert('Error submitting log');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return <p className="text-center mt-10">Please log in.</p>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-2xl mx-auto p-6">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-2xl font-light text-gray-900 mb-6">Log Your Day</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Focus Score</label>
                                <input 
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    type="number" 
                                    min="1" 
                                    max="10"
                                    placeholder="1-10"
                                    value={focus} 
                                    onChange={e => setFocus(+e.target.value)} 
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Sleep Hours</label>
                                <input 
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    type="number" 
                                    step="0.5"
                                    min="0"
                                    max="24"
                                    placeholder="Hours"
                                    value={sleep} 
                                    onChange={e => setSleep(+e.target.value)} 
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">HRV</label>
                                <input 
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    type="number" 
                                    placeholder="Heart Rate Variability"
                                    value={hrv} 
                                    onChange={e => setHrv(+e.target.value)} 
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Strain</label>
                                <input 
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    type="number" 
                                    placeholder="Strain Score"
                                    value={strain} 
                                    onChange={e => setStrain(+e.target.value)} 
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Screen Time</label>
                                <input 
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    type="number" 
                                    placeholder="Minutes"
                                    value={screen} 
                                    onChange={e => setScreen(+e.target.value)} 
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Diet Summary</label>
                                <input 
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    type="text" 
                                    placeholder="What did you eat today?"
                                    value={diet} 
                                    onChange={e => setDiet(e.target.value)} 
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                rows="4"
                                placeholder="How was your day?"
                                value={note} 
                                onChange={e => setNote(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                                isLoading ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                            <span>{isLoading ? 'Saving...' : 'Save Entry'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
} 