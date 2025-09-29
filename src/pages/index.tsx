import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { sportsData } from '../data/sports';
import { Sport } from '../types';

const HomePage: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');

  useEffect(() => {
    // Initialize Typed.js for hero text
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/typed.js/2.0.12/typed.min.js';
      script.onload = () => {
        const Typed = (window as any).Typed;
        new Typed('#hero-text', {
          strings: [
            'Welcome to Unill Sports',
            'Discover Your Athletic Potential',
            'Join the University\'s Finest Teams',
            'Compete at the Highest Level'
          ],
          typeSpeed: 50,
          backSpeed: 30,
          backDelay: 2000,
          loop: true,
          onStringTyped: (arrayPos: number, self: any) => {
            setTypedText(self.strings[arrayPos]);
          }
        });
      };
      document.head.appendChild(script);
    }
  }, []);

  const showComingSoon = () => {
    alert('Coming soon! This feature is under development.');
  };

  const filteredSports = sportsData.filter(sport => {
    const matchesFilter = currentFilter === 'all' || sport.category === currentFilter;
    const matchesSearch = searchQuery === '' || 
      sport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sport.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const showSportDetails = (sport: Sport) => {
    alert(`${sport.name} details coming soon!`);
  };

  return (
    <Layout title="Home" description="Discover excellence in university athletics at Unill Sports">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-unill-purple-900 via-unill-purple-800 to-unill-purple-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="animate-float">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span id="hero-text" className="bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                Welcome to Unill Sports
              </span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Discover excellence in university athletics. Join our diverse sports programs and compete at the highest level with state-of-the-art facilities and expert coaching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/sports" className="bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-unill-yellow-500 hover:to-unill-purple-600 transition-all transform hover:scale-105 animate-pulse-glow">
              Explore Sports
            </a>
            <a href="/teams" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105">
              Meet Our Teams
            </a>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>
      
      {/* Live Matches Section */}
      <section className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Live & Upcoming Matches
            </h2>
            <p className="text-xl text-gray-300">Stay updated with the latest university sports action</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Live Match */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 animate-pulse-live">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">LIVE</span>
                <span className="text-sm text-gray-300">Basketball</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <h4 className="font-bold text-lg">Titans</h4>
                    <p className="text-3xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">67</p>
                  </div>
                  <div className="text-gray-400 text-xl">VS</div>
                  <div className="text-center">
                    <h4 className="font-bold text-lg">Warriors</h4>
                    <p className="text-3xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">64</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">Sports Arena • 20:00</p>
              </div>
            </div>
            
            {/* Upcoming Match */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">UPCOMING</span>
                <span className="text-sm text-gray-300">Football</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <h4 className="font-bold text-lg">Eagles</h4>
                    <div className="w-12 h-12 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full mx-auto"></div>
                  </div>
                  <div className="text-gray-400 text-xl">VS</div>
                  <div className="text-center">
                    <h4 className="font-bold text-lg">Lions</h4>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-300">Oct 15 • University Stadium • 19:00</p>
              </div>
            </div>
            
            {/* Recent Result */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">COMPLETED</span>
                <span className="text-sm text-gray-300">Volleyball</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <h4 className="font-bold text-lg">Spikers</h4>
                    <p className="text-3xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">3</p>
                  </div>
                  <div className="text-gray-400 text-xl">VS</div>
                  <div className="text-center">
                    <h4 className="font-bold text-lg">Hawks</h4>
                    <p className="text-3xl font-black text-gray-400">1</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">Oct 10 • Gymnasium • Final</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Sports Discovery Section */}
      <section className="py-20 bg-gradient-to-b from-black/20 to-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Discover Your Sport
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From team sports to individual competitions, find your perfect athletic match among our diverse university sports programs.
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text" 
                  placeholder="Search sports..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-unill-yellow-400 focus:border-transparent"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-3">
                <button 
                  className={`filter-btn px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                    currentFilter === 'all' ? 'active' : ''
                  }`}
                  onClick={() => setCurrentFilter('all')}
                >
                  All Sports
                </button>
                <button 
                  className={`filter-btn px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                    currentFilter === 'team' ? 'active' : ''
                  }`}
                  onClick={() => setCurrentFilter('team')}
                >
                  Team Sports
                </button>
                <button 
                  className={`filter-btn px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                    currentFilter === 'individual' ? 'active' : ''
                  }`}
                  onClick={() => setCurrentFilter('individual')}
                >
                  Individual Sports
                </button>
              </div>
            </div>
          </div>
          
          {/* Sports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredSports.map((sport, index) => (
              <div 
                key={sport.id}
                className="sport-card group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl opacity-0 animate-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => showSportDetails(sport)}
              >
                <div className="relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-md shadow-lg">
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src={sport.image} 
                      alt={sport.name} 
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">{sport.name}</h3>
                    <p className="text-sm opacity-90 mb-3">{sport.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="bg-white/20 px-2 py-1 rounded">{sport.players} Players</span>
                      <span className="bg-white/20 px-2 py-1 rounded">{sport.season}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              University Sports Excellence
            </h2>
            <p className="text-xl text-gray-300">Numbers that speak to our athletic achievements</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">12+</div>
              <div className="text-lg font-semibold mb-2">Sports Programs</div>
              <div className="text-sm text-gray-300">Diverse athletic opportunities</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">500+</div>
              <div className="text-lg font-semibold mb-2">Student Athletes</div>
              <div className="text-sm text-gray-300">Active participants</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">35</div>
              <div className="text-lg font-semibold mb-2">Championships</div>
              <div className="text-sm text-gray-300">University titles won</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">15</div>
              <div className="text-lg font-semibold mb-2">Facilities</div>
              <div className="text-sm text-gray-300">State-of-the-art venues</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Join the Team?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Take your athletic journey to the next level. Join Unill Sports and become part of our winning tradition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={showComingSoon}
              className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Register Now
            </button>
            <a href="/teams" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105">
              Meet the Teams
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        .sport-card {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }
        
        .sport-card.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .filter-btn.active {
          background: linear-gradient(135deg, #a855f7, #f59e0b);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
        }
      `}</style>
    </Layout>
  );
};

export default HomePage;
