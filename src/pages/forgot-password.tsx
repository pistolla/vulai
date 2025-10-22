"use client";

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { resetPassword } from '@/services/firebase';
import { useClientSideLibs } from '@/utils/clientLibs';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const mounted = useClientSideLibs();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        {/* ------- HERO ------- */}
        <div className="login-hero bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 text-white relative">
          <div className="absolute top-4 left-4">
            <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img src="/images/logo.png" alt="Unill Sports" className="h-8 w-20" />
              <span className="text-lg font-semibold">Unill Sports</span>
            </a>
          </div>
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl" data-aos="fade-down" style={{ fontFamily: 'Redwing', fontWeight: 'bold' }}>
                Check Your Email
              </h1>
              <p className="mt-6 max-w-lg mx-auto text-xl" data-aos="fade-up" data-aos-delay="100">
                We've sent a password reset link to {email}
              </p>
              <div className="mt-8">
                <button
                  onClick={() => router.push('/login')}
                  className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ------- HERO ------- */}
      <div className="login-hero bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 text-white relative">
        <div className="absolute top-4 left-4">
          <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/images/logo.png" alt="Unill Sports" className="h-8 w-20" />
            <span className="text-lg font-semibold">Unill Sports</span>
          </a>
        </div>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl" data-aos="fade-down" style={{ fontFamily: 'Redwing', fontWeight: 'bold' }}>
              Forgot Password
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl" data-aos="fade-up" data-aos-delay="100">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
        </div>
      </div>

      {/* ------- FORM ------- */}
      <div className="py-8 bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 text-white">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white login-card rounded-lg shadow-xl overflow-hidden" data-aos="zoom-in">
            <div className="py-8 px-6 sm:p-10">
              <form className="space-y-6" onSubmit={onSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md text-gray-700 dark:text-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Remember your password?{' '}
                  <a href="/login" className="text-blue-600 hover:text-blue-500">
                    Sign in here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------- CUSTOM CSS ------- */}
      <style jsx global>{`

        .login-card {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </>
  );
}