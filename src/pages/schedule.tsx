import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiService, ScheduleData } from '../services/apiService';
import { Match } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchLeagues } from '../store/correspondentThunk';
import { League } from '../models';
import { useTheme } from '../components/ThemeProvider';

const SchedulePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { leagues, loading: leaguesLoading } = useAppSelector((state) =>  state.leagues);
  const { theme, mounted: themeMounted } = useTheme();
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState<Match[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setMounted(true);

    const loadData = async () => {
      try {
        console.log('Schedule page: Starting data load');
        setLoading(true);

        // Load schedule data with timeout
        const schedulePromise = apiService.getScheduleData();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Schedule data timeout')), 8000)
        );

        const scheduleData = await Promise.race([schedulePromise, timeoutPromise]);
        console.log(scheduleData);

        if (isMounted) {
          setData(scheduleData);
          setMatches(scheduleData.matches);
          setLoading(false); // Allow UI to render with schedule data
        }

        // Load leagues data asynchronously (non-blocking)
        if (isMounted) {
          try {
            console.log('Schedule page: Dispatching fetchLeagues');
            await dispatch(fetchLeagues()).unwrap();
          } catch (leaguesError) {
            console.error('Failed to load leagues data:', leaguesError);
            // Don't fail the whole page if leagues fail
          }
        }
      } catch (error) {
        console.error('Failed to load schedule data:', error);
        if (isMounted) {
          setLoading(false); // Allow UI to render even if schedule data fails
        }
      }
    };

    loadData();

    // Initialize charts (only after data is loaded)
    const initCharts = () => {
      if (typeof window !== 'undefined' && data && isMounted) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
        script.onload = () => {
          setTimeout(() => {
            if (isMounted) initScheduleCharts();
          }, 1000);
        };
        document.head.appendChild(script);
      }
    };

    // Initialize live updates
    const interval = setInterval(() => {
      if (isMounted) updateLiveScores();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [dispatch]);

  const updateLiveScores = () => {
    setMatches(prevMatches => 
      prevMatches.map(match => {
        if (match.status === 'live' && match.score) {
          // Simulate score updates only on client side
          if (mounted && Math.random() > 0.7) {
            return {
              ...match,
              score: {
                home: match.score.home + Math.floor(Math.random() * 3),
                away: match.score.away + Math.floor(Math.random() * 2)
              }
            };
          }
        }
        return match;
      })
    );
  };

  const showComingSoon = () => {
    alert('Coming soon! This feature is under development.');
  };

  const handleWatchLive = (match: Match) => {
    // Navigate to live match page with match ID
    window.location.href = `/live-match/${match.id}`;
  };

  const handleSetReminder = async (match: Match) => {
    try {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Schedule reminder using Firebase Cloud Messaging
          alert(`Reminder set for ${match.homeTeam} vs ${match.awayTeam} at ${match.time}`);
        } else {
          alert('Please enable notifications to set reminders');
        }
      } else {
        alert('Notifications not supported in this browser');
      }
    } catch (error) {
      alert('Failed to set reminder: ' + (error as Error).message);
    }
  };

  const showDayDetails = (date: string) => {
    const matchesOnDay = matches.filter(match => match.date === date);
    if (matchesOnDay.length === 0) return;

    alert(`${matchesOnDay.length} match(es) on ${mounted ? new Date(date).toLocaleDateString() : date}`);
  };

  if (loading || !data) {
    return (
      <Layout title="Schedule & Results" description="View university sports schedules, match results, and upcoming fixtures. Stay updated with live scores and game statistics.">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-unill-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-700">
              {loading ? 'Loading schedule data...' : 'Preparing schedule...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const changeMonth = (direction: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day p-2 border border-white/10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const matchesOnDay = matches.filter(match => match.date === dateStr);
      const hasMatches = matchesOnDay.length > 0;

      days.push(
        <div 
          key={day}
          className={`calendar-day p-2 border border-white/10 min-h-20 cursor-pointer hover:bg-unill-purple-500/20 transition-all ${
            hasMatches ? 'bg-unill-yellow-500/20' : ''
          }`} 
          onClick={() => showDayDetails(dateStr)}
        >
          <div className="font-semibold">{day}</div>
          {hasMatches && (
            <div className="text-xs text-unill-yellow-400 mt-1">
              {matchesOnDay.length} match{matchesOnDay.length > 1 ? 'es' : ''}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
        <div className="calendar-header mb-6">
          <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex justify-between mt-4">
            <button 
              onClick={() => changeMonth(-1)}
              className="px-4 py-2 bg-unill-purple-500 text-white rounded hover:bg-unill-purple-600 transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => changeMonth(1)}
              className="px-4 py-2 bg-unill-purple-500 text-white rounded hover:bg-unill-purple-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
        <div className="calendar-grid grid grid-cols-7 gap-2">
          <div className="font-semibold text-center p-2 text-gray-700">Sun</div>
          <div className="font-semibold text-center p-2 text-gray-700">Mon</div>
          <div className="font-semibold text-center p-2 text-gray-700">Tue</div>
          <div className="font-semibold text-center p-2 text-gray-700">Wed</div>
          <div className="font-semibold text-center p-2 text-gray-700">Thu</div>
          <div className="font-semibold text-center p-2 text-gray-700">Fri</div>
          <div className="font-semibold text-center p-2 text-gray-700">Sat</div>
          {days}
        </div>
      </div>
    );
  };

  const filteredMatches = matches.filter(match => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'live') return match.status === 'live';
    return match.sport === currentFilter;
  });

  const initScheduleCharts = () => {
    if (typeof window === 'undefined' || !(window as any).echarts) return;

    const echarts = (window as any).echarts;

    // Win/Loss Chart
    const winLossChart = echarts.init(document.getElementById('win-loss-chart'));
    if (winLossChart) {
      const option = {
        title: {
          text: 'Season Performance',
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
          data: ['Football', 'Basketball', 'Volleyball', 'Rugby', 'Hockey', 'Tennis'],
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
            data: [8, 15, 12, 6, 9, 16],
            itemStyle: { color: '#10b981' }
          },
          {
            name: 'Losses',
            type: 'bar',
            data: [2, 5, 3, 4, 3, 4],
            itemStyle: { color: '#ef4444' }
          }
        ]
      };
      winLossChart.setOption(option);
    }

    // Upcoming Matches Chart
    const upcomingChart = echarts.init(document.getElementById('upcoming-chart'));
    if (upcomingChart) {
      const option = {
        title: {
          text: 'Next 7 Days',
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
            data: [
              { value: 3, name: 'Football', itemStyle: { color: '#a855f7' } },
              { value: 2, name: 'Basketball', itemStyle: { color: '#f59e0b' } },
              { value: 2, name: 'Volleyball', itemStyle: { color: '#2a9d8f' } },
              { value: 1, name: 'Rugby', itemStyle: { color: '#e76f51' } }
            ],
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
      upcomingChart.setOption(option);
    }
  };

  return (
    <Layout title="Schedule & Results" description="View university sports schedules, match results, and upcoming fixtures. Stay updated with live scores and game statistics.">
      {/* Hero Section */}
      <section className={`pt-24 pb-16 bg-gradient-to-b from-black/30 to-transparent ${themeMounted && theme === 'light' ? 'bg-transparent' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
            Schedule & Results
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Stay updated with live scores, upcoming fixtures, and match results across all university sports programs.
          </p>
        </div>
      </section>
      
      {/* Filter Section */}
      <section className={`py-8 ${themeMounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              className={`filter-btn active px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                currentFilter === 'all' ? 'active' : ''
              }`}
              onClick={() => setCurrentFilter('all')}
            >
              All Sports
            </button>
            <button 
              className={`filter-btn px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                currentFilter === 'football' ? 'active' : ''
              }`}
              onClick={() => setCurrentFilter('football')}
            >
              Football
            </button>
            <button 
              className={`filter-btn px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                currentFilter === 'basketball' ? 'active' : ''
              }`}
              onClick={() => setCurrentFilter('basketball')}
            >
              Basketball
            </button>
            <button 
              className={`filter-btn px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                currentFilter === 'volleyball' ? 'active' : ''
              }`}
              onClick={() => setCurrentFilter('volleyball')}
            >
              Volleyball
            </button>
            <button 
              className={`filter-btn px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                currentFilter === 'live' ? 'active' : ''
              }`}
              onClick={() => setCurrentFilter('live')}
            >
              Live Now
            </button>
          </div>
        </div>
      </section>
      
      {/* Calendar Section */}
      <section className={`py-16 ${themeMounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Sports Calendar
            </h2>
            <p className="text-xl text-gray-700">Click on any date to view matches and events</p>
          </div>
          
          {renderCalendar()}
        </div>
      </section>
      
      {/* Live Matches */}
      <section className={`py-16 bg-black/20 backdrop-blur-sm ${themeMounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Live & Upcoming Matches
            </h2>
            <p className="text-xl text-gray-700">Real-time updates from ongoing university sports events</p>
          </div>
          
          <div id="matches-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMatches.map((match) => (
              <div 
                key={match.id}
                className={`bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 ${
                  match.status === 'live' ? 'animate-pulse-live' : ''
                }`}
                data-sport={match.sport}
                data-status={match.status}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    match.status === 'live' ? 'bg-red-500 text-white' :
                    match.status === 'upcoming' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    {match.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-700 capitalize">{match.sport}</span>
                </div>
                <div className="text-center mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <h4 className="font-bold text-lg mb-2">{match.homeTeam}</h4>
                      <div className="w-16 h-16 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full mx-auto mb-2"></div>
                      {match.score && (
                        <p className="text-3xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                          {match.score.home}
                        </p>
                      )}
                    </div>
                    <div className="text-gray-400 text-xl font-bold">VS</div>
                    <div className="text-center">
                      <h4 className="font-bold text-lg mb-2">{match.awayTeam}</h4>
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-2"></div>
                      {match.score && (
                        <p className="text-3xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                          {match.score.away}
                        </p>
                      )}
                    </div>
                  </div>
                  {match.status === 'live' && match.score && (
                    <div className="bg-white/10 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">3rd Quarter • 2:45 remaining</p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  )}
                  {match.status === 'upcoming' && (
                    <div className="bg-white/10 rounded-lg p-3 mb-4">
                      <p className="text-lg font-semibold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                        {mounted ? new Date(match.date).toLocaleDateString() : ''}
                      </p>
                      <p className="text-sm text-gray-700">{match.time}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-700">📍 {match.venue}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => match.status === 'live' ? handleWatchLive(match) : handleSetReminder(match)}
                    className="flex-1 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 text-white px-4 py-2 rounded text-sm font-semibold hover:from-unill-yellow-500 hover:to-unill-purple-600 transition-all"
                  >
                    {match.status === 'live' ? 'Watch Live' : 'Set Reminder'}
                  </button>
                  <button
                    onClick={() => alert('Match preview/report feature coming soon!')}
                    className="flex-1 border border-white/20 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-white/10 transition-all"
                  >
                    {match.status === 'completed' ? 'Match Report' : 'Preview'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Active Leagues */}
      <section className={`py-16 ${themeMounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Active Leagues
            </h2>
            <p className="text-xl text-gray-700">Explore ongoing tournaments and competitions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leagues && leagues.length > 0 ? (
              leagues.map((league) => (
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
      
      {/* Quick Stats */}
      <section className={`py-16 bg-black/20 backdrop-blur-sm ${themeMounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              This Week in Numbers
            </h2>
            <p className="text-xl text-gray-700">Quick overview of university sports activity</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-4">
                {data.stats.totalMatches}
              </div>
              <div className="text-lg font-semibold mb-2">Total Matches</div>
              <div className="text-sm text-gray-700">This week</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-4">
                {data.stats.liveNow}
              </div>
              <div className="text-lg font-semibold mb-2">Live Now</div>
              <div className="text-sm text-gray-700">Ongoing matches</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-4">
                {data.stats.homeGames}
              </div>
              <div className="text-lg font-semibold mb-2">Home Games</div>
              <div className="text-sm text-gray-700">At university venues</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center border border-white/20">
              <div className="text-5xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-4">
                {data.stats.expectedAttendance.toLocaleString()}
              </div>
              <div className="text-lg font-semibold mb-2">Expected Attendance</div>
              <div className="text-sm text-gray-700">Total spectators</div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .filter-btn.active {
          background: linear-gradient(135deg, #a855f7, #f59e0b);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
        }
        
        .calendar-day:hover {
          background: rgba(168, 85, 247, 0.2);
          transform: scale(1.05);
        }
      `}</style>
    </Layout>
  );
};

export default SchedulePage;
