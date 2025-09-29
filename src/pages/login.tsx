"use client"; // <-- remove if you use Pages Router

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hooks/redux';
import { login, loginGoogle, loginFacebook, loginTwitter } from '@/services/firebase'; // thin Promise wrappers
import AOS from 'aos';
import 'aos/dist/aos.css';
import feather from 'feather-icons';

export default function LoginPage() {
  const router = useRouter();
  const user = useAppSelector(s => s.auth.user); // already logged-in?

  /* ---------- local state ---------- */
  const [email, setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  /* ---------- redirect if already authenticated ---------- */
  useEffect(() => { if (user) router.replace('/dashboard'); }, [user, router]);

  /* ---------- animations ---------- */
  useEffect(() => { AOS.init({ once: true }); feather.replace(); }, []);

  /* ---------- email/password login ---------- */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- social providers ---------- */
  const social = async (provider: 'google' | 'facebook' | 'twitter') => {
    setError('');
    setLoading(true);
    try {
      const fn = { google: loginGoogle, facebook: loginFacebook, twitter: loginTwitter }[provider];
      await fn();
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Social login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ------- HERO ------- */}
      <div className="login-hero text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl" data-aos="fade-down">
              Welcome Back
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl" data-aos="fade-up" data-aos-delay="100">
              Sign in to access your personalized university sports dashboard
            </p>
          </div>
        </div>
      </div>

      {/* ------- LOGIN CARD ------- */}
      <div className="py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white login-card rounded-lg shadow-xl overflow-hidden" data-aos="zoom-in">
            <div className="py-8 px-6 sm:p-10">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Or <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">create a new account</a>
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                <input type="hidden" name="remember" value="true" />
                <div className="rounded-md shadow-sm space-y-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i data-feather="mail" className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="py-3 px-4 block w-full pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                        placeholder="Email address"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i data-feather="lock" className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="py-3 px-4 block w-full pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                        placeholder="Password"
                      />
                    </div>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>

                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
                  >
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </div>
              </form>

              {/* ------- SOCIAL LOGIN ------- */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <button
                    onClick={() => social('google')}
                    disabled={loading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-70"
                  >
                    <i data-feather="facebook" className="h-5 w-5 text-blue-600" />
                  </button>

                  <button
                    onClick={() => social('twitter')}
                    disabled={loading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-70"
                  >
                    <i data-feather="twitter" className="h-5 w-5 text-blue-400" />
                  </button>

                  <button
                    onClick={() => social('google')}
                    disabled={loading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-70"
                  >
                    <i data-feather="google" className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>

              {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ------- CUSTOM CSS ------- */}
      <style jsx global>{`
        .login-hero {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
        }
        .login-card {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </>
  );
}