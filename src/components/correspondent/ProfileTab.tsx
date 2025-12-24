import { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';

export const ProfileTab: React.FC = () => {
  const user = useAppSelector(s => s.auth.user);
  
  // Initialize profile with user data or defaults
  const [profile, setProfile] = useState({
    firstName: user?.displayName?.split(' ')[0] || 'John',
    lastName: user?.displayName?.split(' ')[1] || 'Doe',
    email: user?.email || 'john.doe@example.com',
    university: user?.universityId || 'Harvard University',
    phoneNumber: user?.phoneNumber || '',
    twoFactorEnabled: user?.twoFactorEnabled || false
  });

  const onProfileChange = (field: keyof typeof profile, value: string) => {
    setProfile(p => ({ ...p, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update thunk
    alert('Profile update functionality to be implemented');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">Profile Management</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={profile.firstName}
              onChange={e => onProfileChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={profile.lastName}
              onChange={e => onProfileChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={e => onProfileChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            University ID
          </label>
          <input
            type="text"
            value={profile.university}
            onChange={e => onProfileChange('university', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={profile.phoneNumber}
            onChange={e => onProfileChange('phoneNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="twoFactor"
            checked={profile.twoFactorEnabled}
            onChange={e => onProfileChange('twoFactorEnabled', e.target.checked.toString())}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="twoFactor" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Enable Two-Factor Authentication
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};