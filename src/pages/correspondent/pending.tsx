"use client";

import { useState, FormEvent } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/router';
import UserHeader from '@/components/UserHeader';
import { auth, db } from '@/services/firebase';
import { reauthenticateWithCredential, EmailAuthProvider, updateEmail, updatePhoneNumber, PhoneAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { FiMail, FiPhone, FiLock, FiCheckCircle } from 'react-icons/fi';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function PendingApprovalPage() {
  const user = useAppSelector(s => s.auth.user);
  const router = useRouter();

  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!auth.currentUser) throw new Error('Not authenticated');

      // Reauthenticate
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, password);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update email if changed
      if (email !== user?.email) {
        await updateEmail(auth.currentUser, email);
      }

      // If phone changed, start phone verification
      if (phone !== user?.phoneNumber) {
        // Setup recaptcha
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
        }

        const provider = new PhoneAuthProvider(auth);
        const verificationId = await provider.verifyPhoneNumber(phone, window.recaptchaVerifier);
        setVerificationId(verificationId);
        setShowVerification(true);
        setSuccess('Verification code sent to your phone. Please enter the code below.');
      } else {
        // No phone change, update Firestore
        await updateDoc(doc(db, 'users', user!.uid), {
          email,
          phoneNumber: phone,
        });
        setSuccess('Profile updated successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!verificationId || !verificationCode) return;

    try {
      setLoading(true);
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await updatePhoneNumber(auth.currentUser!, credential);

      // Update Firestore
      await updateDoc(doc(db, 'users', user!.uid), {
        email,
        phoneNumber: phone,
      });

      setSuccess('Profile updated successfully!');
      setShowVerification(false);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <UserHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-3xl rounded-[3rem] border border-gray-100/50 dark:border-gray-800/50 p-8 shadow-2xl shadow-black/5">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Approval Pending</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your correspondent account is currently under review. You can update your contact information below while waiting for approval.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your mobile number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password to confirm changes"
                  required
                />
              </div>
            </div>

            {showVerification && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleVerifyPhone}
                  disabled={loading}
                  className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Phone Number'}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || showVerification}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 rounded-lg">
              {success}
            </div>
          )}

          <div id="recaptcha-container"></div>
        </div>
      </main>
    </div>
  );
}