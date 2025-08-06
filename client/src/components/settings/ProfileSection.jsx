import { useState } from 'react';
import { User } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function ProfileSection({ userProfile, setUserProfile, refreshUser }) {
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

    return (
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
} 