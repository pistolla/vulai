import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiService, SportsData } from '../services/apiService';
import { Sport } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchLeagues } from '../store/correspondentThunk';
import { League } from '../models';
import { getSportTheme } from '../utils/sportThemes';
import { SportEngagementHub } from '../components/sports/SportEngagementHub';
import { useTheme } from '../components/ThemeProvider';

const SportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { leagues, loading: leaguesLoading } = useAppSelector((state) => state.leagues);
  const { theme, mounted } = useTheme();
  const [data, setData] = useState<SportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [leaguesError, setLeaguesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'engagement' | 'general'>('engagement');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        console.log('Sports page: Starting data load');
        setLoading(true);

        // Load sports data with timeout
        const sportsPromise = apiService.getSportsData();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Sports data timeout')), 8000)
        );

        const sportsData = await Promise.race([sportsPromise, timeoutPromise]);
        console.log("Fetched Sport Data ", sportsData);

        if (isMounted) {
          setData(sportsData);
          if (sportsData.sports && sportsData.sports.length > 0) {
            setSelectedSport(sportsData.sports[0]);
          }
          setLoading(false); // Allow UI to render with sports data
        }

        // Load leagues data asynchronously (non-blocking)
        if (isMounted) {
          try {
            console.log('Sports page: Dispatching fetchLeagues');
            setLeaguesError(null);
            await dispatch(fetchLeagues()).unwrap();
          } catch (leaguesError) {
            console.error('Failed to load leagues data:', leaguesError);
            setLeaguesError(leaguesError instanceof Error ? leaguesError.message : 'Failed to load leagues');
            // Don't fail the whole page if leagues fail
          }
        }
      } catch (error) {
        console.error('Failed to load sports data:', error);
        if (isMounted) {
          setLoading(false); // Allow UI to render even if sports data fails
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleSportSelect = (sport: Sport) => {
    setSelectedSport(sport);
  };

  if (loading || !data || !selectedSport) {
    return (
      <Layout title="Sports Programs" description="Explore comprehensive university sports programs including Football, Basketball, Volleyball, Rugby, Hockey, Badminton, Table Tennis, Chess, Athletics and more">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-unill-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-700">
              {loading ? 'Loading sports data...' : 'Preparing sports programs...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Ensure we have leagues data, even if empty - render immediately with available data
  const filteredLeagues = leagues || [];
  const hasLeaguesData = !leaguesLoading && leagues !== undefined && !leaguesError;

  return (
    <Layout title="Sports Leaderboard" description="Explore comprehensive university sports programs including Football, Basketball, Volleyball, Rugby, Hockey, Badminton, Table Tennis, Chess, Athletics and more">
      {/* Hero Section */}
      <section className={`pt-32 pb-8 bg-gradient-to-b from-black/30 to-transparent ${mounted && theme === 'light' ? 'bg-transparent' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent uppercase tracking-tighter">
            Sports Leaderboard
          </h1>
        </div>
      </section>
      
      {/* Sport Selection */}
      <section className={`py-4 overflow-x-auto no-scrollbar border-b border-white/5 ${mounted && theme === 'light' ? 'bg-transparent' : 'bg-black/5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-1 min-w-max">
            {data.sports.map((sport) => {
              const sportTheme = getSportTheme(sport.id);
              const Icon = sportTheme.icon;
              const isActive = selectedSport.id === sport.id;

              return (
                <button 
                  key={sport.id}
                  className={`flex items-center gap-3 px-6 py-2 rounded-2xl transition-all duration-300 min-w-[140px] group ${
                    isActive 
                      ? 'bg-white shadow-lg scale-105' 
                      : 'hover:bg-white/50 opacity-50 hover:opacity-100'
                  }`}
                  onClick={() => handleSportSelect(sport)}
                >
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all duration-300 ${
                      isActive ? 'shadow-md' : ''
                    }`}
                    style={{ 
                      backgroundColor: isActive ? sportTheme.color : sportTheme.bgLight,
                      color: isActive ? '#fff' : sportTheme.color
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {sport.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tabs Switcher */}
      <section className="py-6 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit mx-auto border border-gray-200 dark:border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('engagement')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'engagement'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Engagement Hub
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'general'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              General Information
            </button>
          </div>
        </div>
      </section>
      
      {activeTab === 'general' ? (
        <section id="sport-details" className={`py-16 ${mounted && theme === 'light' ? 'bg-transparent' : ''}`}>
          {/* ... existing code ... */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div>
                <img 
                  src={selectedSport.image} 
                  alt={selectedSport.name} 
                  className="w-full h-96 object-cover rounded-lg shadow-2xl"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-4xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                  {selectedSport.name}
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {selectedSport.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                    <h4 className="font-semibold mb-2">Team Size</h4>
                    <p className="text-3xl font-bold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                      {selectedSport.players}
                    </p>
                    <p className="text-sm text-gray-400">Players per team</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                    <h4 className="font-semibold mb-2">Season</h4>
                    <p className="text-3xl font-bold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                      {selectedSport.season}
                    </p>
                    <p className="text-sm text-gray-400">Active period</p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <h4 className="font-semibold mb-4">Key Positions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSport.positions.map((position) => (
                      <span 
                        key={position}
                        className="bg-gradient-to-r from-unill-purple-500/20 to-unill-yellow-500/20 border border-unill-yellow-400/30 px-3 py-1 rounded-full text-sm"
                      >
                        {position}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                Current Active Leagues
              </h2>
              <p className="text-xl text-gray-700">Explore ongoing tournaments and competitions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hasLeaguesData ? (
                filteredLeagues
                  .filter((league: any) => {
                    const sportTypeMap: { [key: string]: 'team' | 'individual' } = {
                      'football': 'team',
                      'basketball': 'team',
                      'volleyball': 'team',
                      'rugby': 'team',
                      'hockey': 'team',
                      'cricket': 'team',
                      'badminton': 'individual',
                      'table-tennis': 'individual',
                      'chess': 'individual',
                      'athletics': 'individual',
                      'swimming': 'individual',
                      'tennis': 'individual'
                    };

                    const selectedSportType = sportTypeMap[selectedSport.id] || 'team';
                    return league.sportType === selectedSportType;
                  })
                  .map((league: any) => (
                  <div
                    key={league.id}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 cursor-pointer hover:bg-white/20 transition-all transform hover:scale-105"
                    onClick={() => window.location.href = `/league/${league.id}`}
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{league.name}</h3>
                        <p className="text-sm text-gray-700 capitalize">{league.sportType} Sport</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-semibold capitalize">{league.sportType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Description:</span>
                        <span className="font-semibold">{league.description || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Active</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : leaguesError ? (
                <div className="col-span-3 text-center py-8">
                  {/* ... error UI ... */}
                  <p className="text-red-400 font-semibold">Failed to load leagues</p>
                </div>
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-400 mt-4">Loading leagues...</p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SportEngagementHub sportId={selectedSport.id} leagues={filteredLeagues} />
          </div>
        </div>
      )}
      
      
      
      {/* Getting Started */}
      <section className={`py-16 ${mounted && theme === 'light' ? 'bg-transparent' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-12 border border-white/20">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Join any team sports programs by filling an online form. 
              We will help you get in touch with the team management.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="font-semibold mb-2">Register</h4>
                <p className="text-sm text-gray-400">Sign up for tryouts and registration</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-unill-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏃</span>
                </div>
                <h4 className="font-semibold mb-2">Try Out</h4>
                <p className="text-sm text-gray-400">Showcase your skills and abilities</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="font-semibold mb-2">Compete</h4>
                <p className="text-sm text-gray-400">Join the team and compete at university level</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-unill-yellow-500 hover:to-unill-purple-600 transition-all transform hover:scale-105"
              >
                Register Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SportsPage;
