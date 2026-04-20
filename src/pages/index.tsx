import React, { useEffect, useState } from 'react';
import { FiMapPin } from 'react-icons/fi';
import Layout from '../components/Layout';
import { apiService, HomeData } from '../services/apiService';
import { Sport } from '../types';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { addToCart } from '../store/slices/cartSlice';
import { useTheme } from '../components/ThemeProvider';
import MerchandiseCard from '../components/MerchandiseCard';
import { loadLiveGames, loadUpcomingGames } from '../services/firestoreAdmin';
import { Fixture, MerchItem, Participant } from '../models';
import QuickViewModal from '../components/QuickViewModal';
import FixtureDetailModal from '@/components/fixtures/FixtureDetailModal';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const { theme, mounted } = useTheme();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [merchandise, setMerchandise] = useState<any[]>([]);
  const [liveMatches, setLiveMatches] = useState<Fixture[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Fixture[]>([]);
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

        // Load live and upcoming matches for all users
        try {
          const [live, upcoming] = await Promise.all([
            loadLiveGames(),
            loadUpcomingGames()
          ]);
          setLiveMatches(live);
          setUpcomingMatches(upcoming);
        } catch (matchError) {
          console.error('Failed to load matches:', matchError);
        }
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const showComingSoon = () => {
    alert('Coming soon! This feature is under development.');
  };

  const filteredSports = (data?.sports || []).filter(sport => {
    const matchesFilter = currentFilter === 'all' || sport.category === currentFilter;
    const matchesSearch = searchQuery === '' ||
      sport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sport.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const showSportDetails = (sport: Sport) => {
    alert(`${sport.name} details coming soon!`);
  };

  const handleAddToCart = (item: any) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.images[0] || '',
      category: item.category || 'Standard',
      quantity: 1
    }));
    alert(`Added ${item.name} to cart!`);
  };

  const [selectedQuickViewItem, setSelectedQuickViewItem] = useState<MerchItem | null>(null);

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

  const handleQuickView = (item: MerchItem) => {
    setSelectedQuickViewItem(item);
  };

  /* ---------------------------------
     Live Match Card Component
   ---------------------------------- */
  function LiveMatchCard({ match }: { match: Fixture }) {
    const participants: Participant[] = match.participants && match.participants.length > 0 
      ? match.participants 
      : ([
          { name: match.homeTeamName || 'Home', score: match.score?.home ?? 0 },
          { name: match.awayTeamName || 'Away', score: match.score?.away ?? 0 }
        ] as Participant[]).filter(p => p.name !== 'Home');

    const displayParticipants = participants.slice(0, 3);

    return (
      <div className="flex-shrink-0 w-80 bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/20 animate-pulse-live shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Now</span>
          </div>
          <span className="text-[10px] font-black text-unill-yellow-400 uppercase tracking-widest">{match.sport}</span>
        </div>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          {displayParticipants.map((p, i) => (
            <React.Fragment key={i}>
              <div className="text-center group">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 border-2 ${
                   i === 0 ? 'bg-indigo-600 border-indigo-400/30' : 
                   i === 1 ? 'bg-cyan-600 border-cyan-400/30' : 
                   'bg-emerald-600 border-emerald-400/30'
                 }`}>
                    <span className="text-lg font-black text-white">{p.name?.charAt(0) || '?'}</span>
                 </div>
                 <p className="text-[20px] font-black text-white tabular-nums">{p.score ?? 0}</p>
                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter truncate w-16">{p.name}</p>
              </div>
              {i < displayParticipants.length - 1 && participants.length === 2 && (
                <div className="text-white/20 font-black italic text-xs mt-[-20px]">VS</div>
              )}
            </React.Fragment>
          ))}
          {participants.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-500">
               +{participants.length - 3}
            </div>
          )}
        </div>

        <p className="text-[10px] font-bold text-gray-500 text-center mb-6 uppercase tracking-widest">{match.venue} • {new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        
        <button
          onClick={() => window.location.href = `/live-match/${match.id}`}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-500/20"
        >
          Watch Feed
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <Layout title="Home" description="Discover excellence in university athletics at Unill Sports">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-unill-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout title="Home" description="Discover excellence in university athletics at Unill Sports">

      {/* Hero Section with Video Background */}
      <section className={`min-h-screen flex items-center justify-center relative overflow-hidden ${mounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-100 via-mauve-50 to-mauve-200' : ''}`}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/banner.webm" type="video/webm" />
        </video>
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
          {user && liveMatches.length > 0 && (
            <div className="mb-8 overflow-hidden">
              <h2 className="text-2xl font-bold text-white mb-4">🔴 LIVE NOW</h2>
              <div className="flex gap-6 overflow-x-auto scroll-snap-x mandatory pb-6 px-4 -mx-4 items-center justify-start md:justify-center no-scrollbar">
                {liveMatches.map((match) => (
                  <LiveMatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}

          {user == null ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/sports" className="bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-unill-yellow-500 hover:to-unill-purple-600 transition-all transform hover:scale-105 animate-pulse-glow">
                Explore Sports
              </a>
              <a href="/teams" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105">
                Meet Your Teams
              </a>
            </div>
          ) : (
             <div className="w-full max-w-5xl mx-auto">
                <div className="flex flex-col items-center mb-8">
                   <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 animate-bounce">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-unill-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-unill-yellow-500"></span>
                      </span>
                      <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Next Games For You</span>
                   </div>
                </div>

                <div className="flex flex-wrap justify-center gap-8">
                   {[...liveMatches, ...upcomingMatches]
                     .sort((a, b) => {
                       // Live fixtures always rise to the top
                       if (a.status === 'live' && b.status !== 'live') return -1;
                       if (b.status === 'live' && a.status !== 'live') return 1;
                       return 0;
                     })
                     .slice(0, 2).map((match) => {
                      const participants: Participant[] = match.participants && match.participants.length > 0 
                        ? match.participants 
                        : ([
                           { name: match.homeTeamName || 'Home', score: match.score?.home ?? 0 },
                           { name: match.awayTeamName || 'Away', score: match.score?.away ?? 0 }
                        ] as Participant[]).filter(p => p.name !== 'Home');
                      
                      const displayParticipants = participants.slice(0, 3);

                      return (
                        <button
                          key={match.id}
                          onClick={() => {
                            setSelectedMatchForDetail(match);
                            setIsDetailModalOpen(true);
                          }}
                          className={`group relative w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 text-left transition-all hover:bg-white/10 ${match.status === 'live' ? 'border-red-500/50 hover:border-red-500 shadow-lg shadow-red-500/10' : 'hover:border-unill-yellow-400/50'} hover:-translate-y-2`}
                        >
                           <div className="flex justify-between items-start mb-6">
                              <span className={`px-3 py-1 ${
                                 match.status === 'live' ? 'bg-red-500' :
                                 match.status === 'completed' ? 'bg-green-600' :
                                 match.status === 'postponed' ? 'bg-yellow-600' :
                                 'bg-unill-purple-600'
                               } rounded-full text-[10px] font-black text-white uppercase tracking-widest leading-none`}>
                               {match.status === 'live' ? 'LIVE' :
                                match.status === 'completed' ? 'FT' :
                                match.status === 'postponed' ? 'PPD' :
                                match.sport}
                            </span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">
                                 {match.status === 'live' ? 'Live Now' : new Date(match.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                           </div>
                           
                           <div className="flex items-center justify-center gap-4 mb-6">
                              {displayParticipants.map((p, i) => (
                                <React.Fragment key={i}>
                                   <div className="text-center">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 border-2 ${
                                        i === 0 ? 'bg-indigo-600 border-indigo-400/30' : 
                                        i === 1 ? 'bg-cyan-600 border-cyan-400/30' : 
                                        'bg-emerald-600 border-emerald-400/30'
                                      }`}>
                                         <span className="text-sm font-black text-white">{p.name?.charAt(0) || '?'}</span>
                                      </div>
                                      <p className="text-[9px] font-black text-white uppercase truncate w-12 mx-auto">{p.name}</p>
                                   </div>
                                   {i < displayParticipants.length - 1 && participants.length === 2 && (
                                     <div className="text-white/10 font-bold italic text-[10px] mt-[-15px]">VS</div>
                                   )}
                                </React.Fragment>
                              ))}
                              {participants.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black text-gray-500">
                                   +{participants.length - 3}
                                </div>
                              )}
                           </div>

                           <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                 <div className={`w-2 h-2 rounded-full ${match.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                                 <span className="text-[10px] font-bold text-gray-500">
                                    {match.status === 'live' 
                                      ? participants.map(p => p.score ?? 0).join(' - ') 
                                      : new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                              </div>
                              <span className="text-[10px] font-black text-unill-yellow-400 group-hover:translate-x-1 transition-transform">DETAILS →</span>
                           </div>
                        </button>
                      );
                    })}
                </div>
                
                <div className="mt-10">
                   <a href="/schedule" className="text-sm font-black text-white/40 hover:text-unill-yellow-400 uppercase tracking-[0.3em] transition-colors">
                      View Full Schedule Calendar
                   </a>
                </div>
             </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Live Matches Section */}
      <section className={`py-16 bg-black/20 backdrop-blur-sm ${mounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Live & Upcoming Matches
            </h2>
            <p className="text-xl text-gray-700">Stay updated with the latest university sports action</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {([...liveMatches, ...upcomingMatches].length > 0 ? [...liveMatches, ...upcomingMatches] : (data?.matches || [])).map((match) => {
              const participants: Participant[] = (match as any).participants && (match as any).participants.length > 0 
                ? (match as any).participants 
                : ([
                   { name: (match as any).homeTeamName || (match as any).homeTeam || 'Home', score: (match as any).score?.home ?? 0 },
                   { name: (match as any).awayTeamName || (match as any).awayTeam || 'Away', score: (match as any).score?.away ?? 0 }
                ] as Participant[]).filter(p => !!p.name && p.name !== 'Home');
              
              const displayParticipants = participants.slice(0, 3);

              return (
              <div
                key={match.id}
                className={`w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/20 hover:bg-white/15 transition-all group ${match.status === 'live' ? 'animate-pulse-live shadow-lg shadow-red-500/10' : ''
                  }`}
              >
                <div className="flex items-center justify-between mb-8">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                    match.status === 'live' ? 'bg-red-500 text-white' :
                    match.status === 'completed' ? 'bg-green-600 text-white' :
                    match.status === 'postponed' ? 'bg-yellow-600 text-white' :
                    'bg-unill-purple-600 text-white'
                  }`}>
                  {match.status === 'live' ? 'LIVE' :
                   match.status === 'completed' ? 'FULL TIME' :
                   match.status === 'postponed' ? 'POSTPONED' :
                   'UPCOMING'}
                  </span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{match.sport}</span>
                </div>
                
                <div className="flex items-center justify-center gap-6 mb-8">
                    {displayParticipants.map((p, i) => (
                      <React.Fragment key={i}>
                         <div className="text-center relative">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border-2 shadow-xl group-hover:scale-110 transition-transform ${
                              i === 0 ? 'bg-indigo-600 border-indigo-400/30' : 
                              i === 1 ? 'bg-cyan-600 border-cyan-400/30' : 
                              'bg-emerald-600 border-emerald-400/30'
                            }`}>
                               <span className="text-xl font-black text-white">{p.name?.charAt(0) || '?'}</span>
                            </div>
                            <p className="text-[11px] font-black text-white uppercase tracking-tight truncate w-20 mx-auto">{p.name}</p>
                            {(match.status === 'live' || match.status === 'completed') && (
                              <p className="mt-1 text-2xl font-black text-unill-yellow-400 tabular-nums">{p.score ?? 0}</p>
                            )}
                         </div>
                         {i < displayParticipants.length - 1 && participants.length === 2 && (
                            <div className="text-white/10 font-black italic text-xl mt-[-30px]">VS</div>
                         )}
                      </React.Fragment>
                    ))}
                    {participants.length > 3 && (
                      <div className="flex flex-col items-center">
                         <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-500 mb-2">
                            +{participants.length - 3}
                         </div>
                         <p className="text-[9px] font-black text-gray-500 uppercase">Others</p>
                      </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-2 mb-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] opacity-60">
                   <FiMapPin className="text-red-500" />
                   <span>{match.venue}</span>
                   <span>•</span>
                   <span>{('scheduledAt' in match) ? new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (match as any).time}</span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedMatchForDetail(match);
                      setIsDetailModalOpen(true);
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                  >
                    Details
                  </button>
                  {match.status === 'live' && (
                    <button
                      onClick={() => window.location.href = `/live-match/${match.id}`}
                      className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/30"
                    >
                      Watch
                    </button>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      {/* Merchandise Section */}
      <section className={`py-16 bg-gradient-to-b from-black/10 to-black/20 ${mounted && theme === 'light' ? 'bg-gradient-to-b from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Official Merchandise
            </h2>
            <p className="text-xl text-gray-700">Show your university pride with our exclusive sports merchandise</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {merchandise.map((item) => (
              <MerchandiseCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={handleQuickView}
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


      {/* Statistics Section */}
      <section className={`py-20 bg-black/20 backdrop-blur-sm ${mounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              University Sports Excellence
            </h2>
            <p className="text-xl text-gray-700">Numbers that speak to our athletic achievements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">
                {data?.stats.sportsPrograms}+
              </div>
              <div className="text-lg font-semibold mb-2">Sports Programs</div>
              <div className="text-sm text-gray-700">Diverse athletic opportunities</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">
                {data?.stats.studentAthletes}+
              </div>
              <div className="text-lg font-semibold mb-2">Student Athletes</div>
              <div className="text-sm text-gray-700">Active participants</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">
                {data?.stats.championships}
              </div>
              <div className="text-lg font-semibold mb-2">Championships</div>
              <div className="text-sm text-gray-700">University titles won</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">
                {data?.stats.facilities}
              </div>
              <div className="text-lg font-semibold mb-2">Facilities</div>
              <div className="text-sm text-gray-700">State-of-the-art venues</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={`py-20 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 ${mounted && theme === 'light' ? 'bg-gradient-to-r from-mauve-200 via-mauve-300 to-mauve-400' : ''}`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Join the Team?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join any team sports programs by filling an online form.
            We will help you get in touch with the team management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Register Now
            </a>
            <a href="/teams" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105">
              Meet Your Teams
            </a>
          </div>
        </div>
      </section>

      {selectedQuickViewItem && (
        <QuickViewModal
          item={selectedQuickViewItem}
          isOpen={!!selectedQuickViewItem}
          onClose={() => setSelectedQuickViewItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {selectedMatchForDetail && (
        <FixtureDetailModal
           isOpen={isDetailModalOpen}
           onClose={() => {
             setIsDetailModalOpen(false);
             setSelectedMatchForDetail(null);
           }}
           match={selectedMatchForDetail}
        />
      )}
    </Layout>
  );
};

export default HomePage;
