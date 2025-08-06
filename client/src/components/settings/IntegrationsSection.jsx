import { Zap, Check } from 'lucide-react';
import whoopIcon from '../../assets/whoop-icon.png';
import { API_BASE_URL } from '../../config';
import { checkWhoopStatus, disconnectWhoop } from '../../api/auth';

export default function IntegrationsSection({ whoopStatus, setWhoopStatus }) {
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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Integrations
                </h2>
                <p className="text-gray-300">
                    Connect your accounts and services
                </p>
            </div>
            <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                        WHOOP Integration
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-medium">WHOOP Account</h4>
                                <p className="text-gray-400 text-sm">
                                    {whoopStatus.hasCredentials 
                                        ? 'Connected to WHOOP account' 
                                        : 'Not connected to WHOOP'
                                    }
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                {!whoopStatus.hasCredentials ? (
                                    <button
                                        onClick={handleWhoopConnect}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Connect WHOOP
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleWhoopDisconnect}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                )}
                            </div>
                        </div>
                        {whoopStatus.hasCredentials && (
                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                <h5 className="text-blue-300 font-medium mb-2">Connection Status</h5>
                                <p className="text-blue-200 text-sm">
                                    {whoopStatus.isConnected 
                                        ? '✅ WHOOP data sync is active' 
                                        : '⚠️ WHOOP connection may need attention'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 