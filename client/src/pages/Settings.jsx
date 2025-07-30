import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, Settings as SettingsIcon, Database, User, MessageCircle, ChevronRight, Zap, Palette, Plus, Trash2, Lock } from "lucide-react";
import { checkWhoopStatus, getUserProfile, disconnectWhoop, testWhoopConnection } from '../api/auth';
import { getDatapointDefinitions, getDatapointPreferences, saveDatapointPreferences, createCustomDatapoint, deleteCustomDatapoint, getCustomDatapoints } from '../api/datapoints';
import { getChatSettings, updateChatSettings, getChatOptions } from '../api/chat';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import whoopIcon from '../assets/whoop-icon.png';

export default function Settings() {
    const navigate = useNavigate();
    const { refreshUser, token } = useContext(AuthContext);
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
    const [whoopStatus, setWhoopStatus] = useState({ hasCredentials: false, isConnected: false });
    const [activeCategory, setActiveCategory] = useState('profile');
    const [userProfile, setUserProfile] = useState({ firstName: '', lastName: '', email: '' });
    const [dataPointDefinitions, setDataPointDefinitions] = useState({});
    const [enabledDatapoints, setEnabledDatapoints] = useState({});

    const [selectedFont, setSelectedFont] = useState('open-sans');
    
    // Chat settings state
    const [chatSettings, setChatSettings] = useState({
        voice: 'default',
        verbosity: 'balanced',
        model: 'gpt-4o-mini',
        useDirectSQL: false
    });
    const [chatOptions, setChatOptions] = useState({
        voices: [],
        verbosities: [],
        models: []
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [testResult, setTestResult] = useState(null);
    const [isTesting, setIsTesting] = useState(false);

    // Custom datapoints state
    const [customDatapoints, setCustomDatapoints] = useState([]);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newCustomDatapoint, setNewCustomDatapoint] = useState({
        label: '',
        type: 'boolean',
        description: '',
        min: 0,
        max: 100,
        step: 1
    });

    useEffect(() => {
        const checkAuthCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const authStatus = urlParams.get('whoopAuth');
            if (authStatus) {
                if (authStatus === 'success') {
                    setToast({ show: true, message: 'WHOOP connected successfully!', type: 'success' });
                    // Refresh whoop status to show connected state
                    const status = await checkWhoopStatus();
                    setWhoopStatus(status);
                } else {
                    setToast({ show: true, message: 'Failed to connect WHOOP. Please try again.', type: 'error' });
                }
                // Clean the URL
                navigate('/settings', { replace: true });
            }
        };

        checkAuthCallback();

        // Load user profile, WHOOP status, datapoint data, and chat settings
        const loadData = async () => {
            try {
                const [profile, whoop, definitions, preferences, chatSettingsData, chatOptionsData, customData] = await Promise.all([
                    getUserProfile(),
                    checkWhoopStatus(),
                    getDatapointDefinitions(),
                    getDatapointPreferences(),
                    getChatSettings(),
                    getChatOptions(),
                    getCustomDatapoints()
                ]);
                setUserProfile(profile);
                setWhoopStatus(whoop);
                setDataPointDefinitions(definitions);
                // Load useDirectSQL from localStorage if available
                const savedChatSettings = localStorage.getItem('chatSettings');
                let useDirectSQL = false;
                if (savedChatSettings) {
                    try {
                        const settings = JSON.parse(savedChatSettings);
                        useDirectSQL = settings.useDirectSQL || false;
                    } catch (e) {
                        useDirectSQL = false;
                    }
                }
                
                setChatSettings({
                    ...chatSettingsData,
                    useDirectSQL
                });
                setChatOptions(chatOptionsData);
                setCustomDatapoints(customData);
                
                // If user has no preferences, initialize with all datapoints enabled
                if (Object.keys(preferences).length === 0) {
                    const allEnabled = {};
                    Object.entries(definitions).forEach(([category, dataPoints]) => {
                        allEnabled[category] = {};
                        Object.keys(dataPoints).forEach(key => {
                            allEnabled[category][key] = true;
                        });
                    });
                    setEnabledDatapoints(allEnabled);
                } else {
                    setEnabledDatapoints(preferences);
                }
            } catch (err) {
                console.error('Failed to load data:', err);
            }
        };
        
        loadData();
    }, []);

    // Effect to hide toast after a few seconds
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);



    // Load saved font on mount
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

    const handleWhoopConnect = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication token not found. Please log in again.');
            return;
        }
        window.location.href = `${API_BASE_URL}/api/auth/whoop?token=${token}`;
    };

    const handleWhoopDisconnect = async () => {
        try {
            await disconnectWhoop();
            setWhoopStatus({ hasCredentials: false, isConnected: false });
            alert('WHOOP account disconnected successfully!');
        } catch (error) {
            console.error('Failed to disconnect WHOOP:', error);
            alert('Failed to disconnect WHOOP account. Please try again.');
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const result = await testWhoopConnection();
            setTestResult(result);
        } catch (error) {
            setTestResult({ success: false, message: error.message || 'An unknown error occurred.' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleToggleCategory = (category) => {
        setEnabledDatapoints(prev => {
            const newState = { ...prev };
            const currentValues = prev[category];
            const isAllEnabled = Object.values(currentValues).every(Boolean);
            
            // If all are enabled, disable all. If any are disabled, enable all.
            const newValue = !isAllEnabled;
            
            // Create a new category object with all values set to the new value
            newState[category] = {};
            Object.keys(dataPointDefinitions[category]).forEach(key => {
                newState[category][key] = newValue;
            });
            
            return newState;
        });
    };

    const handleToggleDatapoint = (category, datapoint) => {
        setEnabledDatapoints(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [datapoint]: !prev[category][datapoint]
            }
        }));
    };

    const handleSaveProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName,
                    email: userProfile.email,
                    preferredName: userProfile.preferredName
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Refresh the user context to update the navbar
            await refreshUser();
            
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Failed to save profile:', err);
            alert('Failed to save profile. Please try again.');
        }
    };

    const handleSaveDatapoints = async () => {
        try {
            await saveDatapointPreferences(enabledDatapoints);
            alert('Datapoint configuration saved successfully!');
        } catch (err) {
            console.error('Failed to save datapoint configuration:', err);
            alert('Failed to save datapoint configuration. Please try again.');
        }
    };

    const handleSaveChatSettings = async () => {
        try {
            await updateChatSettings(chatSettings);
            // Save useDirectSQL to localStorage for the chat page
            localStorage.setItem('chatSettings', JSON.stringify({
                useDirectSQL: chatSettings.useDirectSQL
            }));
            alert('Chat settings saved successfully!');
        } catch (err) {
            console.error('Failed to save chat settings:', err);
            alert('Failed to save chat settings. Please try again.');
        }
    };

    const handleChatSettingChange = (setting, value) => {
        setChatSettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    // Custom datapoint functions
    const handleCreateCustomDatapoint = async () => {
        try {
            if (!newCustomDatapoint.label.trim()) {
                alert('Please enter a label for the datapoint');
                return;
            }

            if (!selectedCategory) {
                alert('Please select a category');
                return;
            }

            const result = await createCustomDatapoint({
                ...newCustomDatapoint,
                category: selectedCategory
            });
            
            // Refresh data to get updated definitions and custom datapoints
            const [definitions, customData] = await Promise.all([
                getDatapointDefinitions(),
                getCustomDatapoints()
            ]);
            setDataPointDefinitions(definitions);
            setCustomDatapoints(customData);
            
            // Reset form
            setNewCustomDatapoint({
                label: '',
                type: 'boolean',
                description: '',
                min: 0,
                max: 100,
                step: 1
            });
            setShowCustomForm(false);
            setSelectedCategory('');
            
            alert('Custom datapoint created successfully!');
        } catch (err) {
            console.error('Failed to create custom datapoint:', err);
            alert(err.message || 'Failed to create custom datapoint. Please try again.');
        }
    };

    const handleDeleteCustomDatapoint = async (category, name) => {
        if (!confirm('Are you sure you want to delete this custom datapoint? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteCustomDatapoint(category, name);

            // Instantly remove from local state for instant UI update
            setDataPointDefinitions(prev => {
                const updated = { ...prev };
                if (updated[category]) {
                    delete updated[category][name];
                }
                return updated;
            });
            setCustomDatapoints(prev => prev.filter(d => !(d.category === category && d.name === name)));
            setEnabledDatapoints(prev => {
                const updated = { ...prev };
                if (updated[category]) {
                    delete updated[category][name];
                }
                return updated;
            });

            // Optionally, refresh all data to ensure consistency
            const [definitions, customData, preferences] = await Promise.all([
                getDatapointDefinitions(),
                getCustomDatapoints(),
                getDatapointPreferences()
            ]);
            setDataPointDefinitions(definitions);
            setCustomDatapoints(customData);
            // Remove the deleted datapoint from preferences before setting
            const cleanedPreferences = { ...preferences };
            if (cleanedPreferences[category] && cleanedPreferences[category][name]) {
                delete cleanedPreferences[category][name];
            }
            setEnabledDatapoints(cleanedPreferences);

            alert('Custom datapoint deleted successfully!');
        } catch (err) {
            console.error('Failed to delete custom datapoint:', err);
            alert(err.message || 'Failed to delete custom datapoint. Please try again.');
        }
    };

    const handleCustomDatapointChange = (field, value) => {
        setNewCustomDatapoint(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddCustomDatapoint = (category) => {
        setSelectedCategory(category);
        setShowCustomForm(true);
    };

    const getCategoryButtonText = (categoryKey) => {
        const categoryValues = enabledDatapoints[categoryKey];
        if (!categoryValues) return 'Enable All';
        return Object.values(categoryValues).every(Boolean) ? 'Disable All' : 'Enable All';
    };

    const categoryNames = Object.keys(dataPointDefinitions).map(key => ({
        key,
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));

    const menuItems = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'integrations', label: 'Integrations', icon: Zap },
        { id: 'datapoints', label: 'Datapoints', icon: Database },
        { id: 'appearance', label: 'Appearance', icon: Palette }
    ];

    const renderProfileSection = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Profile Settings
                </h2>
                <p className="text-gray-300">
                    Manage your account information and personal details
                </p>
            </div>

            <div className="space-y-6">
                {/* Name Section */}
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                        Personal Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                value={userProfile.firstName || ''}
                                onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                value={userProfile.lastName || ''}
                                onChange={(e) => setUserProfile(prev => ({ ...prev, lastName: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                placeholder="Enter your last name"
                            />
                        </div>
                        <div>
                            <label htmlFor="preferredName" className="block text-sm font-medium text-gray-300 mb-2">
                                Preferred Name <span className="text-gray-500 text-xs">(optional)</span>
                            </label>
                            <input
                                type="text"
                                id="preferredName"
                                value={userProfile.preferredName || ''}
                                onChange={(e) => setUserProfile(prev => ({ ...prev, preferredName: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                placeholder="What would you like to be called? Neo? Batman? The Dread Pirate Roberts?"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This name will be used throughout the app instead of your first name
                            </p>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={userProfile.email || ''}
                                onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                placeholder="Enter your email address"
                            />
                        </div>
                    </div>
                    {/* Save Profile Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSaveProfile}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                            Save Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderChatSection = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Chat Settings
                </h2>
                <p className="text-gray-300">
                    Customize your chat experience and AI assistant preferences
                </p>
            </div>

            <div className="space-y-6">
                {/* Model Selection */}
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                        AI Model
                    </h3>
                    <div>
                        <select
                            id="model"
                            value={chatSettings.model}
                            onChange={(e) => handleChatSettingChange('model', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                        >
                            {chatOptions.models.map(model => (
                                <option key={model} value={model}>
                                    {model === 'gpt-4o' ? 'GPT-4o (Recommended)' : 
                                     model === 'gpt-4o-mini' ? 'GPT-4o Mini (Fastest)' : 
                                     model === 'gpt-4.1-mini' ? 'GPT-4.1 Mini (Cheapest)' : model}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Response Verbosity */}
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                        Response Style
                    </h3>
                    <div>
                        <select
                            id="verbosity"
                            value={chatSettings.verbosity}
                            onChange={(e) => handleChatSettingChange('verbosity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                        >
                            {chatOptions.verbosities.map(verbosity => (
                                <option key={verbosity} value={verbosity}>
                                    {verbosity.charAt(0).toUpperCase() + verbosity.slice(1).replace('-', ' ')}
                                </option>
                            ))}
                            {/* <option value="dinosaur">I actually don't want to learn about my health. Give me random dinosaur facts.</option> */}
                        </select>
                    </div>
                </div>

                {/* Voice Selection */}
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                        Chat Voice
                    </h3>
                    <div>
                        <select
                            id="voice"
                            value={chatSettings.voice}
                            onChange={(e) => handleChatSettingChange('voice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                        >
                            {chatOptions.voices.map(voice => (
                                <option key={voice} value={voice}>
                                    {voice}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Direct SQL Mode Toggle */}
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                        Query System
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-white">Direct SQL Mode</div>
                                <div className="text-xs text-gray-400">
                                    Use direct SQL generation instead of JSON intent parsing
                                </div>
                            </div>
                            <button
                                onClick={() => handleChatSettingChange('useDirectSQL', !chatSettings.useDirectSQL)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    chatSettings.useDirectSQL ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gray-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        chatSettings.useDirectSQL ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                        <div className="text-xs text-gray-500">
                            <strong>JSON Intent Mode (Off):</strong> Structured queries with detailed result formatting<br/>
                            <strong>Direct SQL Mode (On):</strong> Flexible SQL generation with function calling
                        </div>
                    </div>
                </div>

                {/* Save Chat Settings Button */}
                <div className="flex justify-end pt-6">
                    <button
                        onClick={handleSaveChatSettings}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                        Save Chat Settings
                    </button>
                </div>
            </div>
        </div>
    );

    const renderIntegrationsSection = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Integrations
                </h2>
                <p className="text-gray-300">
                    Connect your accounts from other services.
                </p>
            </div>
            <div className="border-t border-gray-700"></div>

            {/* WHOOP Integration */}
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img src={whoopIcon} alt="WHOOP" className="h-8 w-8 rounded-md" />
                        <div>
                            <h3 className="font-semibold text-white">WHOOP</h3>
                            <p className="text-xs text-gray-400">
                                Sync your health and activity data.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {whoopStatus.isConnected ? (
                             <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 text-green-400">
                                    <Check className="h-4 w-4" />
                                    <span className="text-sm font-medium">Connected</span>
                                </div>
                                <button
                                    onClick={handleWhoopDisconnect}
                                    className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleWhoopConnect}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Connect
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-lg">+</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">More Integrations Coming Soon</h3>
                            <p className="text-gray-400">We're working on adding support for the other inferior fitness platforms</p>
                        </div>
                    </div>
                    <button disabled className="px-4 py-2 text-sm bg-gray-600 text-gray-400 rounded-md cursor-not-allowed">Coming Soon</button>
                </div>
            </div>
        </div>
    );

    const renderDatapointsSection = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Datapoints Configuration
                </h2>
                <p className="text-gray-300">
                    Choose which datapoints to include in your daily logs
                </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                <div className="p-6 border-transparent">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">
                            Available Datapoints
                        </h3>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-6">
                        {categoryNames.map(({ key, name }) => (
                            <div key={key} className="border border-gray-700 rounded-lg">
                                <div className="p-4 bg-gray-700 border-b border-gray-600">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-medium text-white">
                                            {name}
                                        </h4>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleToggleCategory(key)}
                                                className="text-sm text-blue-400 hover:text-blue-300"
                                            >
                                                {getCategoryButtonText(key)}
                                            </button>
                                            <button
                                                onClick={() => handleAddCustomDatapoint(key)}
                                                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                                <span>Add Custom</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Datapoint Form for this category */}
                                {showCustomForm && selectedCategory === key && (
                                    <div className="p-4 border-b border-gray-600 bg-blue-50 dark:bg-blue-900/20">
                                        <h5 className="text-md font-medium text-white mb-3">
                                            Add Custom Datapoint to {name}
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Label *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newCustomDatapoint.label}
                                                    onChange={(e) => handleCustomDatapointChange('label', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                    placeholder="e.g., Meditation Minutes"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Type *
                                                </label>
                                                <select
                                                    value={newCustomDatapoint.type}
                                                    onChange={(e) => handleCustomDatapointChange('type', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                >
                                                    <option value="boolean">Yes/No</option>
                                                    <option value="number">Number</option>
                                                    <option value="time">Time</option>
                                                    <option value="text">Text</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Description (optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newCustomDatapoint.description}
                                                    onChange={(e) => handleCustomDatapointChange('description', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                    placeholder="Brief description of what this datapoint tracks"
                                                />
                                            </div>
                                            {newCustomDatapoint.type === 'number' && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Minimum Value
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={newCustomDatapoint.min}
                                                            onChange={(e) => handleCustomDatapointChange('min', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Maximum Value
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={newCustomDatapoint.max}
                                                            onChange={(e) => handleCustomDatapointChange('max', parseFloat(e.target.value) || 100)}
                                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Step Size
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={newCustomDatapoint.step}
                                                            onChange={(e) => handleCustomDatapointChange('step', parseFloat(e.target.value) || 1)}
                                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex justify-end space-x-3 mt-4">
                                            <button
                                                onClick={() => {
                                                    setShowCustomForm(false);
                                                    setSelectedCategory('');
                                                }}
                                                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCreateCustomDatapoint}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                Create Datapoint
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(dataPointDefinitions[key] || {}).map(([datapointKey, definition]) => {
                                            // Check if this is a custom datapoint
                                            const isCustom = customDatapoints.some(custom => 
                                                custom.name === datapointKey && custom.category === key
                                            );
                                            const customDatapoint = isCustom ? 
                                                customDatapoints.find(custom => custom.name === datapointKey && custom.category === key) : 
                                                null;

                                            // Debug logging
                                            if (datapointKey.startsWith('custom')) {
                                                console.log('Rendering datapoint:', datapointKey, 'isCustom:', isCustom, 'customDatapoints:', customDatapoints);
                                            }

                                            return (
                                                <div key={datapointKey} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                                                    <div className="flex items-center space-x-3 flex-1">
                                                        <input
                                                            type="checkbox"
                                                            id={`${key}-${datapointKey}`}
                                                            checked={enabledDatapoints[key]?.[datapointKey] || false}
                                                            onChange={() => handleToggleDatapoint(key, datapointKey)}
                                                            className="h-4 w-4 text-blue-400 focus:ring-blue-500 border-gray-600 rounded"
                                                        />
                                                        <label
                                                            htmlFor={`${key}-${datapointKey}`}
                                                            className="text-sm text-gray-300 cursor-pointer flex-1"
                                                        >
                                                            {definition.label}
                                                            {isCustom && (
                                                                <span className="text-xs text-blue-400 ml-1">
                                                                    (custom)
                                                                </span>
                                                            )}
                                                        </label>
                                                    </div>
                                                    {isCustom && (
                                                        <button
                                                            onClick={() => handleDeleteCustomDatapoint(key, datapointKey)}
                                                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                            title="Delete custom datapoint"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Summary */}
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                            <span className="text-blue-400 text-xs font-medium">i</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-blue-300">
                            Configuration Summary
                        </h3>
                        <p className="text-sm text-blue-400 mt-1">
                            You have selected{' '}
                            {Object.values(enabledDatapoints).reduce((total, category) => 
                                total + Object.values(category || {}).filter(Boolean).length, 0
                            )} datapoints across {categoryNames.length} categories
                            {customDatapoints.length > 0 && `, including ${customDatapoints.length} custom datapoint${customDatapoints.length === 1 ? '' : 's'}`}.
                        </p>
                    </div>
                </div>
            </div>
            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSaveDatapoints}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    Save Configuration
                </button>
            </div>

        </div>
    );

    const renderAppearanceSection = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Appearance
                </h2>
                <p className="text-gray-300">
                    Customize the look and feel of your application
                </p>
            </div>

            <div className="space-y-6">


                {/* Font Settings */}
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                        Typography
                    </h3>
                    <div>
                        <label htmlFor="font" className="block text-sm font-medium text-gray-300 mb-2">
                            Font Family
                        </label>
                        <select
                            id="font"
                            value={selectedFont}
                            onChange={(e) => {
                                setSelectedFont(e.target.value);
                                // Apply font to document
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
                                document.documentElement.style.fontFamily = fontMap[e.target.value] || fontMap['open-sans'];
                                // Save to localStorage
                                localStorage.setItem('selectedFont', e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                        >
                            <option value="open-sans">Open Sans (Default)</option>
                            <option value="inter">Inter</option>
                            <option value="roboto">Roboto</option>
                            <option value="lato">Lato</option>
                            <option value="poppins">Poppins</option>
                            <option value="montserrat">Montserrat</option>
                            <option value="source-sans-pro">Source Sans Pro</option>
                            <option value="nunito">Nunito</option>
                            <option value="raleway">Raleway</option>
                            <option value="ubuntu">Ubuntu</option>
                            <option value="comic-sans">Comic Sans MS</option>
                        </select>
                        <p className="text-sm text-gray-400 mt-2">
                            Changes will apply to the entire application
                        </p>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                        Preview
                    </h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                            <h4 className="text-lg font-semibold text-white mb-2">
                                Sample Heading
                            </h4>
                            <p className="text-gray-300">
                                This is how your text will appear with the selected font and theme settings.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeCategory) {
            case 'profile':
                return renderProfileSection();
            case 'chat':
                return renderChatSection();
            case 'integrations':
                return renderIntegrationsSection();
            case 'datapoints':
                return renderDatapointsSection();
            case 'appearance':
                return renderAppearanceSection();
            default:
                return renderProfileSection();
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-16">
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
                    {/* Left Sidebar Menu */}
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

                    {/* Right Content Area */}
                    <div className="flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}