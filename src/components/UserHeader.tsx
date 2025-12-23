import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { signOut } from '@/services/firebase';
import { useTheme } from './ThemeProvider';
import { FiSun, FiMoon } from 'react-icons/fi';

type TeamTheme = 'crimson' | 'blue' | 'cardinal' | 'gold';

const themes: Record<TeamTheme, Record<string, string>> = {
  crimson: { primary: '#990000', secondary: '#ffffff', accent: '#13294b' },
  blue: { primary: '#003366', secondary: '#ffffff', accent: '#990000' },
  cardinal: { primary: '#8C1515', secondary: '#ffffff', accent: '#4D4D4D' },
  gold: { primary: '#FFB81C', secondary: '#000000', accent: '#00539B' },
};

interface UserHeaderProps {
  theme?: TeamTheme;
}

export default function UserHeader({ theme = 'crimson' }: UserHeaderProps) {
  const user = useAppSelector(s => s.auth.user);
  const { theme: appTheme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut().then(() => {
      console.log("User signed out successfully");
      window.location.href = '/';
    })
      .catch((error) => {
        console.error("Sign-out error:", error);
        window.location.href = '/';
      });
  };

  const currentTheme = themes[theme];

  return (
    <header
      style={{
        background: appTheme === 'dark'
          ? 'linear-gradient(to right, #1a202c, #2d3748)'
          : `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.accent})`
      }}
      className="text-white shadow-lg border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3 group">
              <img src="/images/logo.png" alt="Unill Sports" className="h-10 w-20 transition-transform group-hover:scale-110" />
              <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-unill-purple-400 to-unill-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
                Uni Limelight Sports
              </span>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:rotate-12"
              title={`Switch to ${appTheme === 'light' ? 'dark' : 'light'} mode`}
            >
              {appTheme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold">{user.displayName || user.email}</p>
                  <p className="text-xs opacity-80 capitalize tracking-wider">{user.role}</p>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 border border-white/20 transition-all shadow-inner"
                  >
                    <img
                      src={user.photoURL || "/images/avatar-placeholder.png"}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + (user.displayName || user.email);
                      }}
                    />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 py-2 border border-gray-100 dark:border-gray-700 transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 sm:hidden">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.displayName || user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                      </div>
                      <a
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span>Profile Settings</span>
                      </a>
                      {user.role === 'admin' && (
                        <a href="/admin/page" className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <span>Admin Dashboard</span>
                        </a>
                      )}
                      <hr className="my-1 border-gray-100 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a
                  href="/login"
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-white/10"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-5 py-2 rounded-lg text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  Register
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
