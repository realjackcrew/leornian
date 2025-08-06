import { updateChatSettings } from '../../api/chat';

export default function ChatSection({ chatSettings, setChatSettings, chatOptions }) {
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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Chat Settings
                </h2>
                <p className="text-gray-300">
                    Customize your chat experience and AI behavior
                </p>
            </div>
            <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                        AI Configuration
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="voice" className="block text-sm font-medium text-gray-300 mb-2">
                                Voice Style
                            </label>
                            <select
                                id="voice"
                                value={chatSettings.voice}
                                onChange={(e) => handleChatSettingChange('voice', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                            >
                                {chatOptions.voices.map((voice) => (
                                    <option key={voice.value} value={voice.value}>
                                        {voice.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="verbosity" className="block text-sm font-medium text-gray-300 mb-2">
                                Response Detail
                            </label>
                            <select
                                id="verbosity"
                                value={chatSettings.verbosity}
                                onChange={(e) => handleChatSettingChange('verbosity', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                            >
                                {chatOptions.verbosities.map((verbosity) => (
                                    <option key={verbosity.value} value={verbosity.value}>
                                        {verbosity.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-2">
                                AI Model
                            </label>
                            <select
                                id="model"
                                value={chatSettings.model}
                                onChange={(e) => handleChatSettingChange('model', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                            >
                                {chatOptions.models.map((model) => (
                                    <option key={model.value} value={model.value}>
                                        {model.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="useDirectSQL"
                                checked={chatSettings.useDirectSQL}
                                onChange={(e) => handleChatSettingChange('useDirectSQL', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="useDirectSQL" className="text-sm font-medium text-gray-300">
                                Use Direct SQL Queries (Advanced)
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSaveChatSettings}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                            Save Chat Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 