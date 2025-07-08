import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Settings as SettingsIcon, Database, User, MessageCircle, ChevronRight, Zap, Palette } from "lucide-react";
import { checkWhoopStatus, getUserProfile } from '../api/auth';
import { getDatapointDefinitions, getDatapointPreferences, saveDatapointPreferences } from '../api/datapoints';
import { getChatSettings, updateChatSettings, getChatOptions } from '../api/chat';
import { API_BASE_URL } from '../config';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

export default function Settings() {
    const navigate = useNavigate();
    const { isDarkMode, theme, setThemeMode } = useTheme();
    const { refreshUser } = useContext(AuthContext);
    const [whoopStatus, setWhoopStatus] = useState({ hasCredentials: false, isConnected: false });
    const [activeCategory, setActiveCategory] = useState('profile');
    const [userProfile, setUserProfile] = useState({ firstName: '', lastName: '', email: '' });
    const [dataPointDefinitions, setDataPointDefinitions] = useState({});
    const [enabledDatapoints, setEnabledDatapoints] = useState({});
    const [selectedTheme, setSelectedTheme] = useState(theme);
    const [selectedFont, setSelectedFont] = useState('open-sans');
    
    // Chat settings state
    const [chatSettings, setChatSettings] = useState({
        voice: 'default',
        verbosity: 'balanced',
        model: 'gpt-4o'
    });
    const [chatOptions, setChatOptions] = useState({
        voices: [],
        verbosities: [],
        models: []
    });

    useEffect(() => {
        // Load user profile, WHOOP status, datapoint data, and chat settings
        const loadData = async () => {
            try {
                const [profile, whoop, definitions, preferences, chatSettingsData, chatOptionsData] = await Promise.all([
                    getUserProfile(),
                    checkWhoopStatus(),
                    getDatapointDefinitions(),
                    getDatapointPreferences(),
                    getChatSettings(),
                    getChatOptions()
                ]);
                setUserProfile(profile);
                setWhoopStatus(whoop);
                setDataPointDefinitions(definitions);
                setChatSettings(chatSettingsData);
                setChatOptions(chatOptionsData);
                
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

    // Update selected theme when theme changes
    useEffect(() => {
        setSelectedTheme(theme);
    }, [theme]);

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
        // Check if user is logged in (has token)
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in first before connecting your WHOOP account.');
            return;
        }

        // Generate and store state parameter for CSRF protection
        const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('whoop_oauth_state', state);
        
        console.log('WHOOP OAuth: Stored state:', state);
        
        const whoopClientId = import.meta.env.VITE_WHOOP_CLIENT_ID;
        const redirectUri = `${window.location.origin}/whoop-callback`;
        const whoopAuthUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?client_id=${whoopClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=offline%20read:profile%20read:recovery%20read:cycles%20read:workout&state=${state}`;
        window.location.href = whoopAuthUrl;
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Profile Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your account information and personal details
                </p>
            </div>

            <div className="space-y-6">
                {/* Name Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Personal Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                value={userProfile.firstName || ''}
                                onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                value={userProfile.lastName || ''}
                                onChange={(e) => setUserProfile(prev => ({ ...prev, lastName: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter your last name"
                            />
                        </div>
                        <div>
                            <label htmlFor="preferredName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Preferred Name <span className="text-gray-500 dark:text-gray-400 text-xs">(optional)</span>
                            </label>
                            <input
                                type="text"
                                id="preferredName"
                                value={userProfile.preferredName || ''}
                                onChange={(e) => setUserProfile(prev => ({ ...prev, preferredName: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="What would you like to be called? Batman? Napoleon? The Dread Pirate Roberts?"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                This name will be used throughout the app instead of your first name
                            </p>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={userProfile.email || ''}
                                onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Chat Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Customize your chat experience and AI assistant preferences
                </p>
            </div>

            <div className="space-y-6">
                {/* Model Selection */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        AI Model
                    </h3>
                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Model
                        </label>
                        <select
                            id="model"
                            value={chatSettings.model}
                            onChange={(e) => handleChatSettingChange('model', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Response Style
                    </h3>
                    <div>
                        <label htmlFor="verbosity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Response Verbosity
                        </label>
                        <select
                            id="verbosity"
                            value={chatSettings.verbosity}
                            onChange={(e) => handleChatSettingChange('verbosity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {chatOptions.verbosities.map(verbosity => (
                                <option key={verbosity} value={verbosity}>
                                    {verbosity.charAt(0).toUpperCase() + verbosity.slice(1).replace('-', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Voice Selection */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Chat Voice
                    </h3>
                    <div>
                        <label htmlFor="voice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Voice
                        </label>
                        <select
                            id="voice"
                            value={chatSettings.voice}
                            onChange={(e) => handleChatSettingChange('voice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {chatOptions.voices.map(voice => {
                                const voiceLabels = {
                                    'default': 'Default',
                                    'cowboy': '🤠 Cowboy',
                                    'vampire': '🧛 Vampire',
                                    'alien': '👽 Alien',
                                    'pirate': '🏴‍☠️ Pirate',
                                    'robot': '🤖 Robot',
                                    'wizard': '🧙 Wizard',
                                    'surfer': '🏄 Surfer',
                                    'detective': '🕵️ Detective'
                                };
                                return (
                                    <option key={voice} value={voice}>
                                        {voiceLabels[voice] || voice}
                                    </option>
                                );
                            })}
                        </select>
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Integrations
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Connect your fitness and health apps to automatically import data
                </p>
            </div>

            <div className="space-y-6">
                {/* WHOOP Integration */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                <span className="text-red-600 dark:text-red-400 font-bold text-lg">W</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    WHOOP
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Import recovery, strain, and sleep data
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {whoopStatus.isConnected ? (
                                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                    <Check className="h-4 w-4" />
                                    <span className="text-sm font-medium">Connected</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleWhoopConnect}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Future Integrations Placeholder */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 dark:text-gray-500 text-lg">+</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    More Integrations Coming Soon
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    We're working on adding support for the other inferior fitness platforms
                                </p>
                            </div>
                        </div>
                        <button
                            disabled
                            className="px-4 py-2 text-sm bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-md cursor-not-allowed"
                        >
                            Coming Soon
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDatapointsSection = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Datapoints Configuration
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Choose which datapoints to include in your daily logs
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-transparent">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Available Datapoints
                        </h3>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-6">
                        {categoryNames.map(({ key, name }) => (
                            <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {name}
                                        </h4>
                                        <button
                                            onClick={() => handleToggleCategory(key)}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                        >
                                            {getCategoryButtonText(key)}
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(dataPointDefinitions[key] || {}).map(([datapointKey, definition]) => (
                                            <div key={datapointKey} className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    id={`${key}-${datapointKey}`}
                                                    checked={enabledDatapoints[key]?.[datapointKey] || false}
                                                    onChange={() => handleToggleDatapoint(key, datapointKey)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label
                                                    htmlFor={`${key}-${datapointKey}`}
                                                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                                >
                                                    {definition.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6">
                <button
                    onClick={handleSaveDatapoints}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    Save Configuration
                </button>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">i</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Configuration Summary
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            You have selected{' '}
                                                    {Object.values(enabledDatapoints).reduce((total, category) => 
                            total + Object.values(category || {}).filter(Boolean).length, 0
                        )} datapoints across {categoryNames.length} categories.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAppearanceSection = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Appearance
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Customize the look and feel of your application
                </p>
            </div>

            <div className="space-y-6">
                {/* Theme Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Theme
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                            Color Theme
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* System Default */}
                            <button
                                onClick={() => {
                                    setSelectedTheme('system');
                                    setThemeMode('system');
                                }}
                                className={`relative p-4 border-2 rounded-lg transition-colors group ${
                                    selectedTheme === 'system'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                                }`}
                            >
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-12 h-8 bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-md flex items-center justify-center">
                                        <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-medium text-gray-900 dark:text-white">System Default</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Follows your OS</div>
                                    </div>
                                </div>
                            </button>

                            {/* Light Mode */}
                            <button
                                onClick={() => {
                                    setSelectedTheme('light');
                                    setThemeMode('light');
                                }}
                                className={`relative p-4 border-2 rounded-lg transition-colors group ${
                                    selectedTheme === 'light'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                                }`}
                            >
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-12 h-8 bg-gradient-to-r from-yellow-100 to-yellow-300 rounded-md flex items-center justify-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-medium text-gray-900 dark:text-white">Light Mode</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Clean & bright</div>
                                    </div>
                                </div>
                            </button>

                            {/* Dark Mode */}
                            <button
                                onClick={() => {
                                    setSelectedTheme('dark');
                                    setThemeMode('dark');
                                }}
                                className={`relative p-4 border-2 rounded-lg transition-colors group ${
                                    selectedTheme === 'dark'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                                }`}
                            >
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-12 h-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-md flex items-center justify-center">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Easy on the eyes</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Font Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Typography
                    </h3>
                    <div>
                        <label htmlFor="font" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Changes will apply to the entire application
                        </p>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Preview
                    </h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Sample Heading
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-16">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <SettingsIcon className="h-8 w-8" />
                        Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
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
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
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