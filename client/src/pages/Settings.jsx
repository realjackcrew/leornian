import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Settings as SettingsIcon, ChevronRight, Lock, User, MessageCircle, Zap, Database } from "lucide-react";
import { checkWhoopStatus, getUserProfile } from '../api/auth';
import { getAllDatapoints } from '../api/datapoints';
import { getChatSettings, getChatOptions } from '../api/chat';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import ProfileSection from '../components/settings/ProfileSection';
import ChatSection from '../components/settings/ChatSection';
import IntegrationsSection from '../components/settings/IntegrationsSection';
import DatapointsSection from '../components/settings/DatapointsSection';

export default function Settings() {

    const navigate = useNavigate();
    const { refreshUser, token } = useContext(AuthContext);

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

    const [whoopStatus, setWhoopStatus] = useState({ hasCredentials: false, isConnected: false });
    const [activeCategory, setActiveCategory] = useState('profile');
    const [userProfile, setUserProfile] = useState({ firstName: '', lastName: '', email: '' });
    const [dataPointDefinitions, setDataPointDefinitions] = useState({});
    const [enabledDatapoints, setEnabledDatapoints] = useState({});
    const [selectedFont, setSelectedFont] = useState('open-sans');
    const [chatSettings, setChatSettings] = useState({
        voice: 'default',
        verbosity: 'balanced',
        model: 'gpt-4o-mini'
    });
    const [chatOptions, setChatOptions] = useState({
        voices: [],
        verbosities: [],
        models: []
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        const checkAuthCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const authStatus = urlParams.get('whoopAuth');
            if (authStatus) {
                if (authStatus === 'success') {
                    setToast({ show: true, message: 'WHOOP connected successfully!', type: 'success' });
                    const status = await checkWhoopStatus();
                    setWhoopStatus(status);
                } else {
                    setToast({ show: true, message: 'Failed to connect WHOOP. Please try again.', type: 'error' });
                }
                navigate('/settings', { replace: true });
            }
        };

        checkAuthCallback();

        const loadData = async () => {
            try {
                const [profile, whoop, datapointData, chatSettingsData, chatOptionsData] = await Promise.all([
                    getUserProfile(),
                    checkWhoopStatus(),
                    getAllDatapoints(),
                    getChatSettings(),
                    getChatOptions(),
                ]);
                setUserProfile(profile);
                setWhoopStatus(whoop);
                setDataPointDefinitions(datapointData.definitions);
                setEnabledDatapoints(datapointData.preferences);

                setChatSettings({
                    ...chatSettingsData
                });
                setChatOptions(chatOptionsData);

            } catch (err) {
                console.error('Failed to load data:', err);
            }
        };

        loadData();

    }, []);

    useEffect(() => {

        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 5000);
            return () => clearTimeout(timer);
        }

    }, [toast]);

    useEffect(() => {

        const savedFont = localStorage.getItem('selectedFont');

        if (savedFont) {
            setSelectedFont(savedFont);
            const fontMap = {
                'inter': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                'roboto': "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                'open-sans': "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                'lato': "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                'poppins': "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                'montserrat': "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                'source-sans-pro': "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                'nunito': "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                'raleway': "'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                'ubuntu': "'Ubuntu', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                'comic-sans': "'Comic Sans MS', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            };
            document.documentElement.style.fontFamily = fontMap[savedFont] || fontMap['open-sans'];
        }

    }, []);

    const menuItems = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'integrations', label: 'Integrations', icon: Zap },
        { id: 'datapoints', label: 'Datapoints', icon: Database }
    ];

    const renderContent = () => {
        switch (activeCategory) {
            case 'profile':
                return <ProfileSection userProfile={userProfile} setUserProfile={setUserProfile} refreshUser={refreshUser} />;
            case 'chat':
                return <ChatSection 
                    chatSettings={chatSettings} 
                    setChatSettings={setChatSettings} 
                    chatOptions={chatOptions} 
                />;
            case 'integrations':
                return <IntegrationsSection 
                    whoopStatus={whoopStatus} 
                    setWhoopStatus={setWhoopStatus} 
                />;
            case 'datapoints':
                return <DatapointsSection 
                    dataPointDefinitions={dataPointDefinitions} 
                    setDataPointDefinitions={setDataPointDefinitions} 
                    enabledDatapoints={enabledDatapoints} 
                    setEnabledDatapoints={setEnabledDatapoints} 
                />;
            default:
                return <ProfileSection userProfile={userProfile} setUserProfile={setUserProfile} refreshUser={refreshUser} />;
        }
    };
    return (
        <div className="min-h-screen bg-black text-white pt-16">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
                    toast.type === 'success' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                }`}>
                    {toast.message}
                </div>
            )}
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <SettingsIcon className="h-8 w-8" />
                        Settings
                    </h1>
                    <p className="text-gray-300 mt-2">
                        Manage your account settings and preferences
                    </p>
                </div>
                <div className="flex gap-8">
                    <div className="w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeCategory === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveCategory(item.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                                            isActive
                                                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        {isActive && <ChevronRight className="h-4 w-4" />}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                    <div className="flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
