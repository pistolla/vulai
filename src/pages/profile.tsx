"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { updateProfile, updatePassword, updatePhoneNumber, enable2FA, disable2FA } from '@/services/firebase';
import { fetchUniversities } from '@/services/firebase';
import { University } from '@/models';
import FanGuard from '@/guards/FanGuard';
import UserHeader from '@/components/UserHeader';
import { FiActivity, FiChevronRight } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Dynamically import components to avoid SSR issues
const CartTab = dynamic(() => import('../components/CartTab.tsx'), { ssr: false });
const OrdersTab = dynamic(() => import('../components/OrdersTab.tsx'), { ssr: false });

type TabType = 'profile' | 'cart' | 'orders';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [universities, setUniversities] = useState<University[]>([]);

  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: '',
    universityId: '',
    phoneNumber: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        universityId: user.universityId || '',
        phoneNumber: user.phoneNumber || ''
      });
      setTwoFactorEnabled(user.twoFactorEnabled || false);
    }
    loadUniversities();
  }, [user]);

  const loadUniversities = async () => {
    try {
      const unis = await fetchUniversities();
      setUniversities(unis);
    } catch (error) {
      console.error('Failed to load universities:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert('Failed to update profile: ' + (error.message || 'Unknown error'));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      alert('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert('Failed to update password: ' + (error.message || 'Unknown error'));
    }
  };

  const handlePhoneUpdate = async () => {
    try {
      await updatePhoneNumber(profileData.phoneNumber);
      alert('Phone number updated! Please check your SMS for verification code.');
    } catch (error: any) {
      alert('Failed to update phone number: ' + (error.message || 'Unknown error'));
    }
  };

  const handle2FAToggle = async () => {
    try {
      if (twoFactorEnabled) {
        await disable2FA();
        setTwoFactorEnabled(false);
        alert('2FA disabled successfully!');
      } else {
        const secret = await enable2FA();
        setTwoFactorSecret(secret);
        setTwoFactorEnabled(true);
        alert('2FA enabled! Please save this secret: ' + secret);
      }
    } catch (error: any) {
      alert('Failed to toggle 2FA: ' + (error.message || 'Unknown error'));
    }
  };

  if (!user) return null;

  return (
    <FanGuard>
      <UserHeader />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-6 text-sm font-medium ${activeTab === 'profile'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => setActiveTab('cart')}
                  className={`py-4 px-6 text-sm font-medium ${activeTab === 'cart'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Cart
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-6 text-sm font-medium ${activeTab === 'orders'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Orders
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  {/* Profile Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input
                          type="text"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">University</label>
                        <select
                          value={profileData.universityId}
                          onChange={(e) => setProfileData({ ...profileData, universityId: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select University</option>
                          {universities.map((uni) => (
                            <option key={uni.id} value={uni.id}>{uni.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="flex space-x-2">
                          <input
                            type="tel"
                            value={profileData.phoneNumber}
                            onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+1234567890"
                          />
                          <button
                            type="button"
                            onClick={handlePhoneUpdate}
                            className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Update Phone
                          </button>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                      >
                        Update Profile
                      </button>
                    </form>
                  </div>

                  {/* Player Specific Actions */}
                  {user.role === 'fan' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                            <FiActivity className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Performance Lab</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your scouting vitals and athlete statistics</p>
                          </div>
                        </div>
                        <Link href="/profile/edit-stats">
                          <button className="flex items-center space-x-2 px-6 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95">
                            <span>Open Stats</span>
                            <FiChevronRight />
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Password Management */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                      >
                        Change Password
                      </button>
                    </form>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {twoFactorEnabled ? '2FA is enabled' : '2FA is disabled'}
                        </p>
                        {twoFactorEnabled && twoFactorSecret && (
                          <p className="text-xs text-gray-500 mt-1">
                            Secret: {twoFactorSecret}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handle2FAToggle}
                        className={`px-4 py-2 rounded-md ${twoFactorEnabled
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                      >
                        {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cart' && <CartTab />}

              {activeTab === 'orders' && <OrdersTab />}
            </div>
          </div>
        </div>
      </div>
    </FanGuard>
  );
}
