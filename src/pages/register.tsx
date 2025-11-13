"use client"; // <-- remove if you use Pages Router

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch } from '@/hooks/redux';
import { register, fetchUniversities } from '@/services/firebase'; // thin Promise-based helper we built earlier
import { useClientSideLibs } from '@/utils/clientLibs';
import Select from 'react-select';

type Role = 'fan' | 'correspondent';

export default function RegisterPage() {
  const dispatch = useAppDispatch(); // kept for future slices
  const router = useRouter();

  /* ---------- form state ---------- */
  const [role, setRole] = useState<Role>('fan');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [university,setUniversity]= useState<{value: string, label: string} | null>(null);
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [agree,     setAgree]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [universities, setUniversities] = useState<{value: string, label: string}[]>([]);

  /* ---------- init animations ---------- */
  const mounted = useClientSideLibs();

  /* ---------- fetch universities ---------- */
  useEffect(() => {
    fetchUniversities().then(unis => {
      setUniversities(unis.map(u => ({ value: u.id, label: u.name })));
    });
  }, []);

  /* ---------- submit ---------- */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!university) return setError('Please select a university');
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
          universityId: university?.value, // we store this in Firestore
        }
      );
      setSuccess('Registration successful! Please check your email and click the verification link to complete your account setup. You can then log in.');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ------- HERO ------- */}
      <section className="bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 text-white py-10 relative">
        <div className="absolute top-4 left-4">
          <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/images/logo.png" alt="Unill Sports" className="h-8 w-20" />
            <span className="text-lg font-semibold">Unill Sports</span>
          </a>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'Redwing', fontWeight: 'bold' }}>Register</h1>
          <p className="text-xl">Join the University Sports Network community</p>
        </div>
      </section>

      {/* ------- FORM ------- */}
      <section className="py-8 bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg shadow-md p-8" data-aos="fade-up">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Create Your Account</h2>

            {/* Role Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-4">Account Type</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-white"
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-white"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-white"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">University</label>
                <Select
                  value={university}
                  onChange={setUniversity}
                  options={universities}
                  className="w-full"
                  placeholder="Select your university"
                  isSearchable
                  required
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor: '#d1d5db',
                      '&:hover': {
                        borderColor: '#3b82f6',
                      },
                      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                      color: '#374151',
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: '#374151',
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: '#9ca3af',
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      color: '#374151',
                      backgroundColor: state.isSelected ? '#dbeafe' : state.isFocused ? '#f3f4f6' : 'white',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                      },
                    }),
                    menu: (provided) => ({
                      ...provided,
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }),
                    input: (provided) => ({
                      ...provided,
                      color: '#374151',
                    }),
                  }}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-white"
                      placeholder="Create password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-white"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
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
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-700">
                  I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                </label>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
              >
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
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
      <h3 className="font-semibold text-gray-600">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}