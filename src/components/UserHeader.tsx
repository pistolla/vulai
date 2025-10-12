import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { signOut } from '@/services/firebase';

type TeamTheme = 'crimson' | 'blue' | 'cardinal' | 'gold';

const themes: Record<TeamTheme, Record<string, string>> = {
  crimson: { primary: '#990000', secondary: '#ffffff', accent: '#13294b' },
  blue:    { primary: '#003366', secondary: '#ffffff', accent: '#990000' },
  cardinal:{ primary: '#8C1515', secondary: '#ffffff', accent: '#4D4D4D' },
  gold:    { primary: '#FFB81C', secondary: '#000000', accent: '#00539B' },
};

interface UserHeaderProps {
  theme?: TeamTheme;
}

export default function UserHeader({ theme = 'crimson' }: UserHeaderProps) {
  const user = useAppSelector(s => s.auth.user);
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

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const currentTheme = themes[theme];

  return (
    <header style={{ background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.accent})` }} className="text-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3">
              <img src="/images/logo.png" alt="Unill Sports" className="h-10 w-20" />
              <span className="text-xl font-bold">Unill Sports</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.displayName || user.email}</p>
              <p className="text-xs opacity-75 capitalize">{user.role}</p>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}