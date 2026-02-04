import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { updateUserProfile } from '@/store/authThunk';
import { useToast } from '@/components/common/ToastProvider';
import { FiUser, FiCheckCircle, FiAlertCircle, FiUpload } from 'react-icons/fi';

export const ProfileTab: React.FC = () => {
  const user = useAppSelector(s => s.auth.user);
  const dispatch = useAppDispatch();
  const { success, error: showError } = useToast();

  const [profile, setProfile] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    email: user?.email || '',
    university: user?.universityId || '',
    phoneNumber: user?.phoneNumber || '',
    twoFactorEnabled: user?.twoFactorEnabled || false
  });
  const [avatar, setAvatar] = useState<string | null>(user?.photoURL || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const onProfileChange = (field: keyof typeof profile, value: any) => {
    setProfile(p => ({ ...p, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 200, 200);
            const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            setAvatar(resizedBase64);
            await updateDoc(doc(db, 'users', user.uid), { photoURL: resizedBase64 });
            dispatch(updateUserProfile({ photoURL: resizedBase64 }));
            success('Avatar updated', 'Your profile picture has been updated', 'Continue editing profile or close');
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      showError('Failed to upload avatar', 'Please try again with a smaller image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const displayName = `${profile.firstName} ${profile.lastName}`.trim();

      await dispatch(updateUserProfile({
        displayName,
        email: profile.email,
        universityId: profile.university,
        phoneNumber: profile.phoneNumber,
        twoFactorEnabled: profile.twoFactorEnabled
      })).unwrap();

      success('Profile updated', 'Your profile changes have been saved', 'View profile or continue editing');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showError('Failed to update profile', error.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-8">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">Profile Management</h2>

      {/* Avatar Upload Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Profile Picture</h3>
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Upload a 200x200 image (JPG, PNG). Will be resized automatically.
            </p>
            {uploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
          </div>
        </div>
      </div>

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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="twoFactor"
            checked={profile.twoFactorEnabled}
            onChange={e => onProfileChange('twoFactorEnabled', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <label htmlFor="twoFactor" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Enable Two-Factor Authentication
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};