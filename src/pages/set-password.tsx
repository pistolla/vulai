import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { updatePassword, db, getAuthErrorMessage } from '@/services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { setUser } from '@/store/slices/authSlice';
import { FiLock, FiCheckCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import Layout from '@/components/Layout';
import { useToast } from '@/components/common/ToastProvider';

export default function SetPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const { success, error: showError } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If not logged in or doesn't need reset, redirect
  React.useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (!user.needsPasswordReset) {
      // Redirect to their dashboard based on role
      switch (user.role) {
        case 'admin': router.replace('/admin/page'); break;
        case 'correspondent': router.replace('/correspondent'); break;
        case 'marketer': router.replace('/marketer/dashboard'); break;
        default: router.replace('/teams');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match', 'Please ensure both password fields are identical');
      return;
    }

    setLoading(true);
    try {
      // 1. Update Firebase Auth password
      await updatePassword(currentPassword, newPassword);

      // 2. Update Firestore profile to clear the flag
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          needsPasswordReset: false
        });

        // 3. Update Redux state
        const updatedUser = { ...user, needsPasswordReset: false };
        dispatch(setUser(updatedUser));

        success('Password updated successfully', 'Your new password has been set', 'Redirecting to your dashboard...');

        // 4. Redirect
        setTimeout(() => {
          switch (user.role) {
            case 'admin': router.replace('/admin/page'); break;
            case 'correspondent': router.replace('/correspondent'); break;
            case 'marketer': router.replace('/marketer/dashboard'); break;
            default: router.replace('/teams');
          }
        }, 2000);
      }
    } catch (err: any) {
      showError('Failed to update password', getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout title="Set Your Password">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FiLock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Secure Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            An administrator created your account. Please set a new private password to continue.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow-2xl shadow-black/5 rounded-[2rem] border border-gray-100 dark:border-gray-800 sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                  Temporary Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
                    placeholder="Enter the password provided to you"
                  />
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
                    placeholder="Create a strong password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
                    placeholder="Repeat your new password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Set Password & Continue</span>
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
