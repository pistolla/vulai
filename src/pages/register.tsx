"use client"; // <-- remove if you use Pages Router

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch } from '@/hooks/redux';
import { register } from '@/services/firebase'; // thin Promise-based helper we built earlier
import AOS from 'aos';
import 'aos/dist/aos.css';
import feather from 'feather-icons';

type Role = 'fan' | 'correspondent';

export default function RegisterPage() {
  const dispatch = useAppDispatch(); // kept for future slices
  const router = useRouter();

  /* ---------- form state ---------- */
  const [role, setRole] = useState<Role>('fan');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [university,setUniversity]= useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [agree,     setAgree]     = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  /* ---------- init animations ---------- */
  useEffect(() => { AOS.init({ once: true }); feather.replace(); }, []);

  /* ---------- submit ---------- */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (!agree) return setError('You must accept the terms');
    setLoading(true);

    try {
      const newUser = await register(
        email,
        password,
        role,
        {
          displayName: `${firstName} ${lastName}`,
          universityId: university, // we store this in Firestore
        }
      );
      router.replace('/admin'); // role-guard will route to correct dashboard
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ------- HERO ------- */}
      <section className="bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Register</h1>
          <p className="text-xl">Join the University Sports Network community</p>
        </div>
      </section>

      {/* ------- FORM ------- */}
      <section className="py-8 bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg shadow-md p-8" data-aos="fade-up">
            <h2 className="text-2xl font-bold text-center mb-8">Create Your Account</h2>

            {/* Role Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">Account Type</label>
              <div className="grid md:grid-cols-2 gap-4">
                <RoleCard
                  icon="user"
                  title="Public Member"
                  desc="Access live games and updates"
                  selected={role === 'fan'}
                  onClick={() => setRole('fan')}
                />
                <RoleCard
                  icon="video"
                  title="Correspondent"
                  desc="Upload content and provide coverage"
                  selected={role === 'correspondent'}
                  onClick={() => setRole('correspondent')}
                />
              </div>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your university"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Create password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                </label>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
              >
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-500">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      
    </>
  );
}

/* -----------------------------------
   Role selection card component
----------------------------------- */
function RoleCard({
  icon,
  title,
  desc,
  selected,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
      }`}
    >
      <i data-feather={icon} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}