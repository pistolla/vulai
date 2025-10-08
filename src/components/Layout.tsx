import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, description = "University sports excellence at Unill" }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <title>{title} - Unill Sports</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/resources/logo.png" />
      </Head>

      {/* Particle Background */}
      <div id="particle-bg" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/resources/logo.png" alt="Unill Sports" className="h-10 w-10" />
              <a href="/"><span className="text-xl font-bold bg-gradient-to-r from-unill-purple-400 to-unill-yellow-500 bg-clip-text text-transparent">
                Unill Sports
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
              <a 
              type="button"
                href="/login"
                className="bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 text-white px-4 py-2 rounded-lg hover:from-unill-purple-600 hover:to-unill-yellow-600 transition-all transform hover:scale-105"
              >
                Login
              </a>
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
            <div className="md:hidden bg-black/30 backdrop-blur-md">
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
                <a 
                  href="/login"
                  className="w-full text-left px-3 py-2 text-white hover:text-unill-yellow-400"
                >
                  Login
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img src="/resources/logo.png" alt="Unill Sports" className="h-12 w-12" />
              <span className="text-2xl font-bold bg-gradient-to-r from-unill-purple-400 to-unill-yellow-500 bg-clip-text text-transparent">
                Unill Sports
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Fostering athletic excellence and sportsmanship through diverse university sports programs. 
              Building champions on and off the field since our founding.
            </p>
          </div>
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <FooterColumn title="Navigation" links={[{label:'Home',href:'/'}, {label:'About',href:'/about'}, {label:'Contact',href:'/contact'}]} />
            <FooterColumn title="Account" links={[{label:'Login',href:'/login'}, {label:'Register',href:'/register'}, {label:'Dashboard',href:'/admin'}]} />
            <FooterColumn title="Legal" links={[{label:'Privacy',href:'#'}, {label:'Terms',href:'#'}, {label:'Cookie Policy',href:'#'}]} />
            <FooterSocial />
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">&copy; 2023 UniSports Live. All rights reserved.</p>
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
      <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">{title}</h3>
      <ul className="mt-4 space-y-2">
        {links.map(l => (
          <li key={l.href}>
            <a href={l.href} className="text-base text-gray-300 hover:text-white">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterSocial() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
      <div className="mt-4 flex space-x-6">
        <a href="#" className="text-gray-400 hover:text-white"><i data-feather="twitter" /></a>
        <a href="#" className="text-gray-400 hover:text-white"><i data-feather="facebook" /></a>
        <a href="#" className="text-gray-400 hover:text-white"><i data-feather="instagram" /></a>
        <a href="#" className="text-gray-400 hover:text-white"><i data-feather="youtube" /></a>
      </div>
    </div>
  );
}


export default Layout;
