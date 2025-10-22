import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiService, HomeData } from '../services/apiService';
import { Sport } from '../types';
import { useAppSelector } from '../hooks/redux';
import banner from '../images/banner.gif';
import MerchandiseCard from '../components/MerchandiseCard';

const HomePage: React.FC = () => {
  const user = useAppSelector(s => s.auth.user);
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [merchandise, setMerchandise] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const homeData = await apiService.getHomeData();
        setData(homeData);
        
        // Load merchandise data (mock data for now)
        setMerchandise([
          {
            id: '1',
            name: 'University Sports Jersey',
            description: 'Official university sports jersey with moisture-wicking fabric',
            price: 2500,
            images: [
              '/images/jersey-1.jpg',
              '/images/jersey-2.jpg',
              '/images/jersey-3.jpg'
            ],
            category: 'Apparel',
            inStock: true,
            likes: 45
          },
          {
            id: '2',
            name: 'Sports Water Bottle',
            description: 'Insulated water bottle with university logo',
            price: 800,
            images: [
              '/images/bottle-1.jpg',
              '/images/bottle-2.jpg'
            ],
            category: 'Accessories',
            inStock: true,
            likes: 23
          },
          {
            id: '3',
            name: 'Team Hoodie',
            description: 'Comfortable hoodie perfect for game days',
            price: 3200,
            images: [
              '/images/hoodie-1.jpg',
              '/images/hoodie-2.jpg',
              '/images/hoodie-3.jpg'
            ],
            category: 'Apparel',
            inStock: false,
            likes: 67
          },
          {
            id: '4',
            name: 'Sports Cap',
            description: 'Adjustable cap with embroidered university logo',
            price: 1200,
            images: [
              '/images/cap-1.jpg',
              '/images/cap-2.jpg'
            ],
            category: 'Accessories',
            inStock: true,
            likes: 34
          }
        ]);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const showComingSoon = () => {
    alert('Coming soon! This feature is under development.');
  };

  const filteredSports = data?.sports.filter(sport => {
    const matchesFilter = currentFilter === 'all' || sport.category === currentFilter;
    const matchesSearch = searchQuery === '' ||
      sport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sport.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  const showSportDetails = (sport: Sport) => {
    alert(`${sport.name} details coming soon!`);
  };

  const handleAddToCart = (item: any) => {
    // TODO: Implement add to cart functionality
    alert(`Added ${item.name} to cart!`);
  };

  const handleToggleWishlist = async (itemId: string, isLiked: boolean) => {
    // TODO: Implement Firebase wishlist functionality
    try {
      // Mock Firebase update
      console.log(`${isLiked ? 'Added to' : 'Removed from'} wishlist: ${itemId}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      throw error;
    }
  };

  /* ---------------------------------
    Live Match Card Component
  ---------------------------------- */
  function LiveMatchCard({ match }: { match: any }) {
    return (
      <div className="flex-shrink-0 w-80 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 animate-pulse-live">
        <div className="flex items-center justify-between mb-3">
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">LIVE</span>
          <span className="text-sm text-gray-300 capitalize">{match.sport}</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-between mb-3">
            <div className="text-center">
              <h4 className="font-bold text-sm">{match.homeTeam}</h4>
              <p className="text-2xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                {match.score?.home ?? 0}
              </p>
            </div>
            <div className="text-gray-400 text-lg">VS</div>
            <div className="text-center">
              <h4 className="font-bold text-sm">{match.awayTeam}</h4>
              <p className="text-2xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                {match.score?.away ?? 0}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-300 mb-3">{match.venue} • {match.time}</p>
          <button
            onClick={() => window.location.href = `/live-match/${match.id}`}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all"
          >
            Watch Live
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Layout title="Home" description="Discover excellence in university athletics at Unill Sports">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-unill-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout title="Home" description="Discover excellence in university athletics at Unill Sports">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundImage: `url(${banner.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="animate-float">
            <h1 className="text-5xl md:text-9xl font-black italic mb-6 leading-tight bg-gradient-to-r from-unill-purple-400 to-unill-yellow-500 bg-clip-text text-transparent" style={{ fontFamily: 'Redwing', fontWeight: 'bold' }}>
              UNI limelight Sports
            </h1>
          </div>
          {user == null && (
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Discover excellence in university athletics. Join our diverse sports programs and compete at the highest level with state-of-the-art facilities and expert coaching.
          </p>
          )}
          {/* Live Matches Slider for Logged-in Users */}
          {user && data?.matches && data.matches.filter(m => m.status === 'live').length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">🔴 LIVE NOW</h2>
              <div className="flex gap-4 overflow-x-auto scroll-snap-x mandatory pb-4 max-w-4xl items-center justify-center">
                {data.matches.filter(m => m.status === 'live').map((match) => (
                  <LiveMatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/sports" className="bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-unill-yellow-500 hover:to-unill-purple-600 transition-all transform hover:scale-105 animate-pulse-glow">
              Explore Sports
            </a>
            <a href="/teams" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105">
              Meet Your Teams
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
      
      {/* Merchandise Section */}
      <section className="py-16 bg-gradient-to-b from-black/10 to-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Official Merchandise
            </h2>
            <p className="text-xl text-gray-300">Show your university pride with our exclusive sports merchandise</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {merchandise.map((item) => (
              <MerchandiseCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
          
          <div className="text-center">
            <a
              href="/merchandise"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 text-white font-semibold rounded-lg hover:from-unill-yellow-500 hover:to-unill-purple-600 transition-all transform hover:scale-105"
            >
              View All Merchandise
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
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
            {data?.matches.map((match) => (
              <div
                key={match.id}
                className={`bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 ${
                  match.status === 'live' ? 'animate-pulse-live' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    match.status === 'live' ? 'bg-red-500 text-white' :
                    match.status === 'upcoming' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    {match.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-300 capitalize">{match.sport}</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <h4 className="font-bold text-lg">{match.homeTeam}</h4>
                      {match.score ? (
                        <p className="text-3xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                          {match.score.home}
                        </p>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full mx-auto"></div>
                      )}
                    </div>
                    <div className="text-gray-400 text-xl">VS</div>
                    <div className="text-center">
                      <h4 className="font-bold text-lg">{match.awayTeam}</h4>
                      {match.score ? (
                        <p className="text-3xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                          {match.score.away}
                        </p>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    {match.venue} • {match.time}
                    {match.status === 'completed' && ' • Final'}
                  </p>
                </div>
              </div>
            ))}
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
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">
                {data?.stats.sportsPrograms}+
              </div>
              <div className="text-lg font-semibold mb-2">Sports Programs</div>
              <div className="text-sm text-gray-300">Diverse athletic opportunities</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">
                {data?.stats.studentAthletes}+
              </div>
              <div className="text-lg font-semibold mb-2">Student Athletes</div>
              <div className="text-sm text-gray-300">Active participants</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">
                {data?.stats.championships}
              </div>
              <div className="text-lg font-semibold mb-2">Championships</div>
              <div className="text-sm text-gray-300">University titles won</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">
                {data?.stats.facilities}
              </div>
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
            <a
              href="/register"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Register Now
            </a>
            <a href="/teams" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105">
              Meet the Teams
            </a>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default HomePage;
