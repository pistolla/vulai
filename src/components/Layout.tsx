import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTheme } from './ThemeProvider';
import { useAppSelector } from '@/hooks/redux';
import { signOut } from '@/services/firebase';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, description = "University sports excellence at Unill" }) => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useAppSelector(s => s.auth.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: 'Home', href: '/', current: router.pathname === '/' },
    { name: 'Sports', href: '/sports', current: router.pathname === '/sports' },
    { name: 'Schedule', href: '/schedule', current: router.pathname === '/schedule' },
    { name: 'Teams', href: '/teams', current: router.pathname === '/teams' },
    { name: 'About', href: '/about', current: router.pathname === '/about' },
    { name: 'Contact', href: '/contact', current: router.pathname === '/contact' },
  ];

  const showComingSoon = () => {
    alert('Coming soon! This feature is under development.');
  };

  const handleSocialLink = (platform: string) => {
    const urls = {
      twitter: 'https://twitter.com/unisports',
      facebook: 'https://facebook.com/unisports',
      instagram: 'https://instagram.com/unisports',
      youtube: 'https://youtube.com/unisports'
    };
    const url = urls[platform as keyof typeof urls];
    if (url) {
      window.open(url, '_blank');
    } else {
      alert(`${platform} page coming soon!`);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  useEffect(() => {
    // Initialize particle background
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js';
      script.onload = () => {
        initParticleBackground();
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initParticleBackground = () => {
    if (typeof window === 'undefined' || !(window as any).p5) return;

    const sketch = (p: any) => {
      let particles: any[] = [];
      const numParticles = 50;

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent('particle-bg');
        canvas.style('position', 'fixed');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('z-index', '-1');
        canvas.style('pointer-events', 'none');

        for (let i = 0; i < numParticles; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-1, 1),
            vy: p.random(-1, 1),
            size: p.random(2, 6),
            opacity: p.random(0.3, 0.8)
          });
        }
      };

      p.draw = () => {
        p.clear();
        
        particles.forEach((particle: any) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0) particle.x = p.width;
          if (particle.x > p.width) particle.x = 0;
          if (particle.y < 0) particle.y = p.height;
          if (particle.y > p.height) particle.y = 0;

          p.fill(168, 85, 247, particle.opacity * 255);
          p.noStroke();
          p.circle(particle.x, particle.y, particle.size);
        });
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    new (window as any).p5(sketch);
  };

  return (
    <>
      <Head>
        <title>{title} - Uni Limelight Sports</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      {/* Particle Background */}
      <div id="particle-bg" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/10 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/images/logo.png" alt="Uni Limelight Sports" className="h-10 w-20" />
              <a href="/"><span className="pb-0 text-3xl font-bold bg-gradient-to-r from-unill-purple-400 to-unill-yellow-500 bg-clip-text text-transparent">
              Uni Limelight Sports
              </span></a>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`relative overflow-hidden px-3 py-2 text-white hover:text-unill-yellow-400 transition-colors ${
                    item.current ? 'text-unill-yellow-400' : ''
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-unill-yellow-400 transition-transform duration-300 ${
                    item.current ? 'translate-x-0' : '-translate-x-full'
                  }`} />
                </a>
              ))}
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-white hover:text-unill-yellow-400 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              {user ? (
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
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                        <div className="py-1">
                          <a
                            href="/profile"
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Profile Settings
                          </a>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <a
                  href="/login"
                  className="bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 text-white px-4 py-2 rounded-lg hover:from-unill-purple-600 hover:to-unill-yellow-600 transition-all transform hover:scale-105"
                >
                  Login
                </a>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-unill-yellow-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white/30 dark:bg-black/30 backdrop-blur-md">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 text-white hover:text-unill-yellow-400 ${
                      item.current ? 'text-unill-yellow-400 font-semibold' : ''
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
                <button
                  onClick={toggleTheme}
                  className="w-full text-left px-3 py-2 text-white hover:text-unill-yellow-400 flex items-center space-x-2"
                >
                  {theme === 'light' ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
                {user ? (
                  <div className="px-3 py-2">
                    <div className="text-right mb-2">
                      <p className="text-sm font-medium">{user.displayName || user.email}</p>
                      <p className="text-xs opacity-75 capitalize">{user.role}</p>
                    </div>
                    <a
                      href="/profile"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Profile Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-white hover:text-unill-yellow-400"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <a
                    href="/login"
                    className="w-full text-left px-3 py-2 text-white hover:text-unill-yellow-400"
                  >
                    Login
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img src="/images/logo.png" alt="Unill Sports" className="h-12 w-20" />
              <span className="text-3xl font-bold bg-gradient-to-r from-unill-purple-400 to-unill-yellow-500 bg-clip-text text-transparent">
                Uni Limelight Sports
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Fostering athletic excellence and sportsmanship through diverse university sports programs.
              Building champions on and off the field since our founding.
            </p>
          </div>
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <FooterColumn title="Navigation" links={[{label:'Home',href:'/'}, {label:'About',href:'/about'}, {label:'Contact',href:'/contact'}]} />
            <FooterColumn title="Account" links={[{label:'Login',href:'/login'}, {label:'Register',href:'/register'}, {label:'Dashboard',href:'/admin'}]} />
            <FooterColumn title="Legal" links={[{label:'Privacy',href:'/privacy'}, {label:'Terms',href:'/terms'}, {label:'Cookie Policy',href:'/cookies'}]} />
            <FooterSocial onSocialClick={handleSocialLink} />
          </div>
          <div className="mt-12 border-t border-gray-300 dark:border-gray-700 pt-8">
            <p className="text-base text-gray-600 dark:text-gray-400 text-center">&copy; 2023 UniSports Live. All rights reserved.</p>
          </div>
        </div>
        </div>
      </footer>
    </>
  );
};


function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">{title}</h3>
      <ul className="mt-4 space-y-2">
        {links.map(l => (
          <li key={l.href}>
            <a href={l.href} className="text-base text-gray-700 dark:text-gray-700 hover:text-gray-900 dark:hover:text-white">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterSocial({ onSocialClick }: { onSocialClick?: (platform: string) => void }) {
  const handleClick = (platform: string) => {
    if (onSocialClick) {
      onSocialClick(platform);
    } else {
      alert('Social media pages coming soon!');
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">Connect</h3>
      <div className="mt-4 flex space-x-6">
        <button onClick={() => handleClick('twitter')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"><i data-feather="twitter" /></button>
        <button onClick={() => handleClick('facebook')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"><i data-feather="facebook" /></button>
        <button onClick={() => handleClick('instagram')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"><i data-feather="instagram" /></button>
        <button onClick={() => handleClick('youtube')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"><i data-feather="youtube" /></button>
      </div>
    </div>
  );
}


export default Layout;
