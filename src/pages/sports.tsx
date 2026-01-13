import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiService, SportsData } from '../services/apiService';
import { Sport } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchLeagues } from '../store/correspondentThunk';
import { League } from '../models';
import { useTheme } from '../components/ThemeProvider';

const SportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { leagues, loading: leaguesLoading } = useAppSelector((state) => state.leagues);
  const { theme, mounted } = useTheme();
  const [data, setData] = useState<SportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [leaguesError, setLeaguesError] = useState<string | null>(null);

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

  // Separate useEffect for chart initialization to avoid hydration issues
  useEffect(() => {
    let isMounted = true;
    let scriptLoaded = false;

    const initChartsAsync = async () => {
      if (typeof window === 'undefined' || !data || !selectedSport || !isMounted) return;

      try {
        // Check if ECharts is already loaded
        if ((window as any).echarts) {
          scriptLoaded = true;
        } else {
          // Load ECharts script dynamically
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
            script.onload = () => {
              scriptLoaded = true;
              resolve();
            };
            script.onerror = () => reject(new Error('Failed to load ECharts'));
            document.head.appendChild(script);

            // Timeout after 10 seconds
            setTimeout(() => reject(new Error('ECharts load timeout')), 10000);
          });
        }

        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (isMounted && scriptLoaded) {
          initCharts();
        }
      } catch (error) {
        console.warn('Failed to initialize charts:', error);
        // Continue without charts - page should still be functional
      }
    };

    initChartsAsync();

    return () => {
      isMounted = false;
    };
  }, [data, selectedSport]);

  const initCharts = () => {
    if (typeof window === 'undefined' || !(window as any).echarts || !data || !selectedSport || !Array.isArray(data.sports)) return;

    try {
      const echarts = (window as any).echarts;

      // Team performance chart
      const performanceElement = document.getElementById('performance-chart');
      if (performanceElement) {
        try {
          const performanceChart = echarts.init(performanceElement);
          const option = {
            title: {
              text: 'Team Performance',
              left: 'center',
              textStyle: { color: '#f59e0b' }
            },
            tooltip: {
              trigger: 'axis',
              backgroundColor: 'rgba(0,0,0,0.8)',
              textStyle: { color: '#fff' }
            },
            legend: {
              data: ['Wins', 'Losses'],
              bottom: 0,
              textStyle: { color: '#fff' }
            },
            xAxis: {
              type: 'category',
              data: data.sports.map(sport => sport.name),
              axisLabel: { color: '#fff' },
              axisLine: { lineStyle: { color: '#fff' } }
            },
            yAxis: {
              type: 'value',
              axisLabel: { color: '#fff' },
              axisLine: { lineStyle: { color: '#fff' } },
              splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
            },
            series: [
              {
                name: 'Wins',
                type: 'bar',
                data: data.sports.map(sport => sport.stats.wins),
                itemStyle: { color: '#10b981' }
              },
              {
                name: 'Losses',
                type: 'bar',
                data: data.sports.map(sport => sport.stats.losses),
                itemStyle: { color: '#ef4444' }
              }
            ]
          };
          performanceChart.setOption(option);
        } catch (error) {
          console.warn('Failed to initialize performance chart:', error);
        }
      }

      // Championships chart
      const championshipsElement = document.getElementById('championships-chart');
      if (championshipsElement) {
        try {
          const championshipsChart = echarts.init(championshipsElement);
          const option = {
            title: {
              text: 'Championship Distribution',
              left: 'center',
              textStyle: { color: '#f59e0b' }
            },
            tooltip: {
              trigger: 'item',
              backgroundColor: 'rgba(0,0,0,0.8)',
              textStyle: { color: '#fff' }
            },
            series: [
              {
                type: 'pie',
                radius: '50%',
                data: data.sports.map(sport => ({
                  value: sport.stats.championships,
                  name: sport.name,
                  itemStyle: {
                    color: sport.id === 'football' ? '#a855f7' :
                            sport.id === 'basketball' ? '#f59e0b' :
                            sport.id === 'volleyball' ? '#2a9d8f' : '#e76f51'
                  }
                })),
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                },
                label: {
                  color: '#fff'
                }
              }
            ]
          };
          championshipsChart.setOption(option);
        } catch (error) {
          console.warn('Failed to initialize championships chart:', error);
        }
      }
    } catch (error) {
      console.warn('Failed to initialize charts:', error);
    }
  };

  const showComingSoon = () => {
    alert('Coming soon! This feature is under development.');
  };

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
    <Layout title="Sports Programs" description="Explore comprehensive university sports programs including Football, Basketball, Volleyball, Rugby, Hockey, Badminton, Table Tennis, Chess, Athletics and more">
      {/* Hero Section */}
      <section className={`pt-24 pb-16 bg-gradient-to-b from-black/30 to-transparent ${mounted && theme === 'light' ? 'bg-transparent' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
            Sports Programs
          </h1>
        </div>
      </section>
      
      {/* Sport Selection */}
      <section className={`py-4 ${mounted && theme === 'light' ? 'bg-transparent' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {data.sports.map((sport) => (
                <button 
                  key={sport.id}
                  className={`sport-selector bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center hover:bg-white/20 transition-all ${
                    selectedSport.id === sport.id ? 'ring-2 ring-unill-yellow-400' : ''
                  }`}
                  onClick={() => handleSportSelect(sport)}
                >
                  <div className="text-2xl mb-2">
                    {sport.id === 'football' && '🏈'}
                    {sport.id === 'basketball' && '🏀'}
                    {sport.id === 'volleyball' && '🏐'}
                    {sport.id === 'rugby' && '🏉'}
                    {sport.id === 'hockey' && '🏑'}
                    {sport.id === 'badminton' && '🏸'}
                    {sport.id === 'table-tennis' && '🎱'}
                    {sport.id === 'chess' && '♟️'}
                    {sport.id === 'athletics' && '🏃'}
                    {sport.id === 'swimming' && '🏊'}
                    {sport.id === 'tennis' && '🎾'}
                    {sport.id === 'cricket' && '🏏'}
                  </div>
                  <div className="text-sm font-semibold">{sport.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Sport Details */}
      <section id="sport-details" className={`py-16 ${mounted && theme === 'light' ? 'bg-transparent' : ''}`}>
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
                  // Filter leagues based on selected sport type
                  // Map sport IDs to sport types
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
                <div className="text-red-400 mb-4">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <p className="text-red-400 font-semibold">Failed to load leagues</p>
                <p className="text-gray-400 text-sm mt-2">{leaguesError}</p>
                <button
                  onClick={() => {
                    setLeaguesError(null);
                    dispatch(fetchLeagues());
                  }}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="col-span-3 text-center py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                </div>
                <p className="text-gray-400 mt-4">Loading leagues...</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      
      
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
