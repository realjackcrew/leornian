import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, Settings as SettingsIcon, Database, User, MessageCircle, ChevronRight, Zap, Plus, Trash2, Lock, Edit, Minus } from "lucide-react";
import { checkWhoopStatus, getUserProfile, disconnectWhoop } from '../api/auth';
import { getAllDatapoints, saveEnabledDatapoints, createDatapoint, deleteDatapoints, updateDatapoint } from '../api/datapoints';
import { getChatSettings, updateChatSettings, getChatOptions } from '../api/chat';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import whoopIcon from '../assets/whoop-icon.png';
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
        model: 'gpt-4o-mini',
        useDirectSQL: false
    });
    const [chatOptions, setChatOptions] = useState({
        voices: [],
        verbosities: [],
        models: []
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showAddDatapointForm, setShowAddDatapointForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newDatapoint, setNewDatapoint] = useState({
        name: '',
        label: '',
        type: 'boolean',
        min: 0,
        max: 100,
        step: 1
    });
    const [deleteMode, setDeleteMode] = useState({});
    const [stagedForDeletion, setStagedForDeletion] = useState({});
    const [editMode, setEditMode] = useState({});
    const [editingDatapoint, setEditingDatapoint] = useState(null);
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
    const handleToggleCategory = (category) => {
        setEnabledDatapoints(prev => {
            const newState = { ...prev };
            const currentValues = prev[category];
            const isAllEnabled = Object.values(currentValues).every(Boolean);
            const newValue = !isAllEnabled;
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
            await refreshUser();
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Failed to save profile:', err);
            alert('Failed to save profile. Please try again.');
        }
    };
    const handleSaveDatapoints = async () => {
        try {
            await saveEnabledDatapoints(enabledDatapoints);
            alert('Datapoint configuration saved successfully!');
        } catch (err) {
            console.error('Failed to save datapoint configuration:', err);
            alert('Failed to save datapoint configuration. Please try again.');
        }
    };
    const handleSaveChatSettings = async () => {
        try {
            await updateChatSettings(chatSettings);
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
    const handleCreateDatapoint = async () => {
        try {
            if (!newDatapoint.name.trim()) {
                alert('Please enter a name for the datapoint');
                return;
            }
            if (!newDatapoint.label.trim()) {
                alert('Please enter a label for the datapoint');
                return;
            }
            if (!newDatapoint.type) {
                alert('Please select a type for the datapoint');
                return;
            }
            if (!selectedCategory) {
                alert('Please select a category');
                return;
            }
            const result = await createDatapoint({
                ...newDatapoint,
                category: selectedCategory
            });
            const datapointData = await getAllDatapoints();
            setDataPointDefinitions(datapointData.definitions);
            setEnabledDatapoints(datapointData.preferences);
            setNewDatapoint({
                name: '',
                label: '',
                type: 'boolean',
                min: 0,
                max: 100,
                step: 1
            });
            setShowAddDatapointForm(false);
            setSelectedCategory('');
            alert('Datapoint created successfully!');
        } catch (err) {
            console.error('Failed to create datapoint:', err);
            alert(err.message || 'Failed to create datapoint. Please try again.');
        }
    };
    const handleDatapointChange = (field, value) => {
        setNewDatapoint(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleAddDatapoint = (category) => {
        setSelectedCategory(category);
        setShowAddDatapointForm(true);
    };

    const toggleDeleteMode = (category) => {
        setDeleteMode(prev => ({ ...prev, [category]: !prev[category] }));
        setStagedForDeletion(prev => ({ ...prev, [category]: [] }));
    };

    const handleDeleteDatapoint = (category, datapointKey) => {
        setStagedForDeletion(prev => {
            const staged = prev[category] || [];
            if (staged.includes(datapointKey)) {
                return { ...prev, [category]: staged.filter(dp => dp !== datapointKey) };
            } else {
                return { ...prev, [category]: [...staged, datapointKey] };
            }
        });
    };

    const handleSaveDeletions = async (category) => {
        const toDelete = stagedForDeletion[category] || [];
        if (toDelete.length === 0) {
            toggleDeleteMode(category);
            return;
        }

        const datapointLabels = toDelete.map(dpKey => dataPointDefinitions[category][dpKey].label).join(', ');
        if (confirm(`Are you sure you want to delete the following datapoint(s)?: \n\n${datapointLabels} \n\nThis action is permanent and cannot be undone.`)) {
            try {
                const datapointsToDelete = toDelete.map(name => ({ category, name }));
                await deleteDatapoints(datapointsToDelete);
                const datapointData = await getAllDatapoints();
                setDataPointDefinitions(datapointData.definitions);
                setEnabledDatapoints(datapointData.preferences);
                toggleDeleteMode(category);
                alert('Datapoints deleted successfully!');
            } catch (err) {
                console.error('Failed to delete datapoints:', err);
                alert(err.message || 'Failed to delete datapoints. Please try again.');
            }
        }
    };

    const toggleEditMode = (category) => {
        setEditMode(prev => ({ ...prev, [category]: !prev[category] }));
        setEditingDatapoint(null);
    };

    const handleEditDatapoint = (category, datapointKey) => {
        const datapoint = dataPointDefinitions[category][datapointKey];
        setEditingDatapoint({
            category,
            name: datapointKey,
            ...datapoint
        });
    };

    const handleUpdateDatapoint = async () => {
        if (!editingDatapoint) return;
        
        if (!editingDatapoint.name.trim()) {
            alert('Please enter a name for the datapoint');
            return;
        }
        if (!editingDatapoint.label.trim()) {
            alert('Please enter a label for the datapoint');
            return;
        }
        if (!editingDatapoint.type) {
            alert('Please select a type for the datapoint');
            return;
        }
        
        try {
            await updateDatapoint(editingDatapoint);
            const datapointData = await getAllDatapoints();
            setDataPointDefinitions(datapointData.definitions);
            setEnabledDatapoints(datapointData.preferences);
            setEditingDatapoint(null);
            alert('Datapoint updated successfully!');
        } catch (err) {
            console.error('Failed to update datapoint:', err);
            alert(err.message || 'Failed to update datapoint. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setEditingDatapoint(null);
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
        { id: 'datapoints', label: 'Datapoints', icon: Database }
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
                {}
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
                    {}
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
                {}
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
                {}
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
                            {}
                        </select>
                    </div>
                </div>
                {}
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
                {}
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
                {}
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
            {}
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
            <div className="space-y-6">
                {categoryNames.map(({ key, name }) => (
                    <div key={key} className="border border-gray-700 rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-700 border-b border-gray-600">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-medium text-white">
                                    {name}
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="p-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                                        onClick={() => handleAddDatapoint(key)}
                                        disabled={deleteMode[key] || editMode[key]}
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        className={`p-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 ${deleteMode[key] ? 'bg-red-500/50' : ''}`}
                                        onClick={() => toggleDeleteMode(key)}
                                        disabled={showAddDatapointForm || editMode[key]}
                                    >
                                        {deleteMode[key] ? <span className="text-xs">Back</span> : <Minus size={16} />}
                                    </button>
                                    <button
                                        className={`p-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 ${editMode[key] ? 'bg-blue-500/50' : ''}`}
                                        onClick={() => toggleEditMode(key)}
                                        disabled={deleteMode[key] || showAddDatapointForm}
                                    >
                                        {editMode[key] ? <span className="text-xs">Back</span> : <Edit size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {editMode[key] && editingDatapoint && editingDatapoint.category === key && (
                            <div className="p-4 border-b border-gray-600 bg-gray-800">
                                <h5 className="text-md font-medium text-white mb-3">
                                    Editing {editingDatapoint.label}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editingDatapoint.name}
                                            onChange={(e) => setEditingDatapoint(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            No spaces. This is the internal variable name.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Label
                                        </label>
                                        <input
                                            type="text"
                                            value={editingDatapoint.label}
                                            onChange={(e) => setEditingDatapoint(prev => ({ ...prev, label: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            This is what users will see in the interface.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Type
                                        </label>
                                        <select
                                            value={editingDatapoint.type}
                                            onChange={(e) => setEditingDatapoint(prev => ({ ...prev, type: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                        >
                                            <option value="boolean">Yes/No</option>
                                            <option value="number">Number</option>
                                            <option value="time">Time</option>
                                            <option value="text">Text</option>
                                        </select>
                                    </div>
                                        {editingDatapoint.type === 'number' && (
                                         <>
                                             <div>
                                                 <label className="block text-sm font-medium text-gray-300 mb-2">
                                                     Minimum Value
                                                 </label>
                                                 <input
                                                     type="number"
                                                     value={editingDatapoint.min || 0}
                                                     onChange={(e) => setEditingDatapoint(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                                                     className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                 />
                                             </div>
                                             <div>
                                                 <label className="block text-sm font-medium text-gray-300 mb-2">
                                                     Maximum Value
                                                 </label>
                                                 <input
                                                     type="number"
                                                     value={editingDatapoint.max || 100}
                                                     onChange={(e) => setEditingDatapoint(prev => ({ ...prev, max: parseFloat(e.target.value) || 100 }))}
                                                     className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                 />
                                             </div>
                                             <div>
                                                 <label className="block text-sm font-medium text-gray-300 mb-2">
                                                     Step Size
                                                 </label>
                                                 <input
                                                     type="number"
                                                     value={editingDatapoint.step || 1}
                                                     onChange={(e) => setEditingDatapoint(prev => ({ ...prev, step: parseFloat(e.target.value) || 1 }))}
                                                     className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                 />
                                             </div>
                                         </>
                                     )}
                                </div>
                                <div className="flex justify-end space-x-3 mt-4">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateDatapoint}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                        {}
                        {showAddDatapointForm && selectedCategory === key && (
                            <div className="p-4 border-b border-gray-600 bg-gray-800">
                                <h5 className="text-md font-medium text-white mb-3">
                                    Add Datapoint to {name}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newDatapoint.name}
                                            onChange={(e) => handleDatapointChange('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                            placeholder=" e.g. meditationMinutes"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            No spaces. This will be the internal variable name.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Label
                                        </label>
                                        <input
                                            type="text"
                                            value={newDatapoint.label}
                                            onChange={(e) => handleDatapointChange('label', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                            placeholder="e.g., Meditation Minutes"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            This is what you will see in the interface.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Type
                                        </label>
                                        <select
                                            value={newDatapoint.type}
                                            onChange={(e) => handleDatapointChange('type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                        >
                                            <option value="boolean">Yes/No</option>
                                            <option value="number">Number</option>
                                            <option value="time">Time</option>
                                            <option value="text">Text</option>
                                        </select>
                                    </div>
                                    {newDatapoint.type === 'number' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Minimum Value
                                                </label>
                                                <input
                                                    type="number"
                                                    value={newDatapoint.min}
                                                    onChange={(e) => handleDatapointChange('min', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Maximum Value
                                                </label>
                                                <input
                                                    type="number"
                                                    value={newDatapoint.max}
                                                    onChange={(e) => handleDatapointChange('max', parseFloat(e.target.value) || 100)}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Step Size
                                                </label>
                                                <input
                                                    type="number"
                                                    value={newDatapoint.step}
                                                    onChange={(e) => handleDatapointChange('step', parseFloat(e.target.value) || 1)}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3 mt-4">
                                    <button
                                        onClick={() => {
                                            setShowAddDatapointForm(false);
                                            setSelectedCategory('');
                                        }}
                                        className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateDatapoint}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Create Datapoint
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="p-4 bg-gray-800/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(dataPointDefinitions[key] || {}).map(([datapointKey, definition]) => {
                                    const isEnabled = enabledDatapoints[key]?.[datapointKey] || false;
                                    const isStagedForDeletion = stagedForDeletion[key]?.includes(datapointKey);
                                    const isInDeleteMode = deleteMode[key];
                                    const isInEditMode = editMode[key];

                                    return (
                                        <div 
                                            key={datapointKey} 
                                            onClick={() => {
                                                if (isInDeleteMode) {
                                                    handleDeleteDatapoint(key, datapointKey);
                                                } else if (isInEditMode) {
                                                    handleEditDatapoint(key, datapointKey);
                                                } else {
                                                    handleToggleDatapoint(key, datapointKey);
                                                }
                                            }}
                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                                                isInDeleteMode
                                                    ? isStagedForDeletion
                                                        ? 'bg-red-500/40 hover:bg-red-500/60 text-white'
                                                        : 'bg-gray-900/50 hover:bg-gray-900/70 text-gray-500'
                                                    : isInEditMode
                                                        ? 'bg-blue-500/40 hover:bg-blue-500/60 text-white'
                                                        : isEnabled 
                                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                                            : 'bg-gray-800 hover:bg-gray-700 text-gray-500'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3 flex-1">
                                                <span className={`text-sm font-medium ${
                                                    isEnabled || isStagedForDeletion ? 'text-gray-300' : 'text-gray-500'
                                                }`}>
                                                    {definition.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {deleteMode[key] && (
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => handleSaveDeletions(key)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Save Deletions
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {}
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
                            )} datapoints across {categoryNames.length} categories.
                        </p>
                    </div>
                </div>
            </div>
            {}
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
                    {}
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
                    {}
                    <div className="flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
