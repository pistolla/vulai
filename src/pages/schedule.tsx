import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiService, ScheduleData } from '../services/apiService';
import { Match } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchLeagues } from '../store/correspondentThunk';
import { League, Fixture, Season } from '../models';
import { useTheme } from '../components/ThemeProvider';
import { loadLiveGames, loadUpcomingGames } from '../services/firestoreAdmin';
import { firebaseLeagueService } from '../services/firebaseCorrespondence';

type DisplayMatch = {
  id: number;
  status: 'live' | 'upcoming' | 'completed';
  sport: string;
  homeTeam: string;
  awayTeam: string;
  score?: { home: number; away: number };
  date: string;
  time: string;
  venue: string;
};

const SchedulePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { leagues, loading: leaguesLoading } = useAppSelector((state) => state.leagues);
  const user = useAppSelector(s => s.auth.user);
  const { theme, mounted: themeMounted } = useTheme();
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState<Match[]>([]);
  const [mounted, setMounted] = useState(false);
  const [calendarView, setCalendarView] = useState<string>('horizontal');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [displayFixtures, setDisplayFixtures] = useState<DisplayMatch[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');

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

        // Load sports data
        if (isMounted) {
          try {
            const sportsData = await apiService.getSports();
            setSports(sportsData);
          } catch (sportsError) {
            console.error('Failed to load sports data:', sportsError);
          }
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

        // Load fixtures for ALL users (public)
        if (isMounted) {
          try {
            const [live, upcoming] = await Promise.all([
              loadLiveGames(),
              loadUpcomingGames()
            ]);
            const allFixtures = [...live, ...upcoming].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
            setFixtures(allFixtures);

            // Map to display format
            setDisplayFixtures(allFixtures.map(f => ({
              id: parseInt(f.id) || 0,
              status: f.status === 'scheduled' ? 'upcoming' : f.status === 'postponed' ? 'upcoming' : f.status,
              sport: f.sport,
              homeTeam: f.homeTeamName,
              awayTeam: f.awayTeamName,
              score: f.score,
              date: new Date(f.scheduledAt).toISOString().split('T')[0],
              time: new Date(f.scheduledAt).toLocaleTimeString(),
              venue: f.venue,
              seasonId: (f as any).seasonId // Preserve seasonId for filtering
            })));
          } catch (fixtureError) {
            console.error('Failed to load fixtures:', fixtureError);
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

    const fetchSeasonsForSport = async (sportName: string) => {
      try {
        const sportsData: any[] = await apiService.getSports();
        // First try exact match
        let sport = sportsData.find(s => s.name.toLowerCase() === sportName.toLowerCase());
        // Try partial match if exact fails
        if (!sport) {
          sport = sportsData.find(s => 
            s.name.toLowerCase().includes(sportName.toLowerCase()) ||
            sportName.toLowerCase().includes(s.name.toLowerCase())
          );
        }
        if (sport) {
          const res = await firebaseLeagueService.listSeasons(sport.id);
          if (isMounted) {
            setSeasons(res);
            const active = res.find((s: Season) => s.isActive);
            if (active) setSelectedSeasonId(active.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch seasons for schedule:', error);
      }
    };

    if (currentFilter !== 'all' && currentFilter !== 'live') {
      fetchSeasonsForSport(currentFilter);
    } else {
      setSeasons([]);
      setSelectedSeasonId('');
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [dispatch, currentFilter]);

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

  const handleSetReminder = async (match: Fixture | Match) => {
    try {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Schedule reminder using Firebase Cloud Messaging
          const homeTeam = ('homeTeamName' in match) ? match.homeTeamName : match.homeTeam;
          const awayTeam = ('awayTeamName' in match) ? match.awayTeamName : match.awayTeam;
          const time = ('scheduledAt' in match) ? new Date(match.scheduledAt).toLocaleTimeString() : match.time;
          alert(`Reminder set for ${homeTeam} vs ${awayTeam} at ${time}`);
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
    // Use fixtures if available, else static matches
    const matchesOnDay = fixtures.length > 0
      ? fixtures.filter(fixture => {
        const fixtureDate = new Date(fixture.scheduledAt).toISOString().split('T')[0];
        return fixtureDate === date;
      })
      : matches.filter(match => match.date === date);

    if (matchesOnDay.length === 0) return;

    setSelectedDate(date);
    setModalOpen(true);
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
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const calendarButtons = (
      <div className="flex gap-2 items-center">
        <button
          onClick={() => {
            setCurrentDate(new Date());
            setSelectedDate(new Date().toISOString().split('T')[0]);
          }}
          className="px-3 py-1 text-xs font-bold bg-unill-yellow-400 text-gray-900 rounded-full hover:bg-unill-yellow-500 transition-all shadow-lg shadow-unill-yellow-400/20"
        >
          Today
        </button>
        <div className="flex gap-1 bg-black/20 p-1 rounded-lg backdrop-blur-md border border-white/10">
          <button
            onClick={() => setCalendarView('grid')}
            className={`p-1.5 rounded transition-all ${calendarView === 'grid' ? 'bg-unill-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button
            onClick={() => setCalendarView('horizontal')}
            className={`p-1.5 rounded transition-all ${calendarView === 'horizontal' ? 'bg-unill-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    );

    if (calendarView === 'horizontal') {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const daysInMonth = lastDay.getDate();

      const dates = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const todayStr = new Date().toISOString().split('T')[0];
        const isToday = dateStr === todayStr;

        const matchesOnDay = fixtures.length > 0
          ? fixtures.filter(fixture => {
            const fixtureDate = new Date(fixture.scheduledAt).toISOString().split('T')[0];
            return fixtureDate === dateStr;
          })
          : matches.filter(match => match.date === dateStr);
        const hasMatches = matchesOnDay.length > 0;

        dates.push(
          <div
            key={day}
            className={`flex-shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group
              ${isToday
                ? 'bg-unill-yellow-400 border-unill-yellow-500 shadow-lg shadow-unill-yellow-400/30 -translate-y-1'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
              } 
              ${hasMatches && !isToday ? 'bg-unill-purple-500/20 border-unill-purple-500/30' : ''}`}
            onClick={() => showDayDetails(dateStr)}
          >
            <div className={`font-black text-lg ${isToday ? 'text-gray-900' : 'text-white'}`}>{day}</div>
            {hasMatches ? (
              <div className={`text-[10px] font-bold uppercase mt-1 ${isToday ? 'text-gray-900/60' : 'text-unill-yellow-400'}`}>
                {matchesOnDay.length} Match{matchesOnDay.length > 1 ? 'es' : ''}
              </div>
            ) : (
              <div className={`text-[10px] font-medium opacity-40 ${isToday ? 'text-gray-900' : ''}`}>Empty</div>
            )}
            {isToday && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-unill-yellow-400 animate-pulse" />
            )}
          </div>
        );
      }

      return (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          <div className="calendar-header flex justify-between items-center mb-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            {calendarButtons}
          </div>
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
          <div className="horizontal-calendar flex gap-2 overflow-x-auto pb-4">
            {dates}
          </div>
        </div>
      );
    } else {
      // Grid view (existing code)
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];

      // Empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day p-2 border border-white/10"></div>);
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const todayStr = new Date().toISOString().split('T')[0];
        const isToday = dateStr === todayStr;

        const matchesOnDay = fixtures.length > 0
          ? fixtures.filter(fixture => {
            const fixtureDate = new Date(fixture.scheduledAt).toISOString().split('T')[0];
            return fixtureDate === dateStr;
          })
          : matches.filter(match => match.date === dateStr);
        const hasMatches = matchesOnDay.length > 0;

        days.push(
          <div
            key={day}
            className={`calendar-day p-2 border border-white/10 min-h-24 cursor-pointer transition-all duration-300 relative
              ${isToday ? 'bg-unill-yellow-400 border-unill-yellow-500 shadow-lg shadow-unill-yellow-400/20 z-10' : 'hover:bg-unill-purple-500/20'}
              ${hasMatches && !isToday ? 'bg-unill-yellow-500/10' : ''}`}
            onClick={() => showDayDetails(dateStr)}
          >
            <div className={`font-black text-lg ${isToday ? 'text-gray-900' : 'text-white'}`}>{day}</div>
            {hasMatches && (
              <div className={`text-[10px] font-bold uppercase mt-1 ${isToday ? 'text-gray-900/60' : 'text-unill-yellow-400'}`}>
                {matchesOnDay.length} Match{matchesOnDay.length > 1 ? 'es' : ''}
              </div>
            )}
            {isToday && (
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="text-[10px] font-black uppercase text-gray-900 leading-none">Today</span>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        );
      }

      return (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          <div className="calendar-header flex justify-between items-center mb-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            {calendarButtons}
          </div>
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
    }
  };

  const displayMatches = displayFixtures.length > 0 ? displayFixtures : matches;
  const filteredMatches = displayMatches.filter(match => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'live') return match.status === 'live';

    const sportMatch = match.sport.toLowerCase() === currentFilter.toLowerCase();
    if (!sportMatch) return false;

    if (selectedSeasonId) {
      return (match as any).seasonId === selectedSeasonId;
    }

    return true;
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
    <Layout title="Leagues & Fixtures" description="View university sports leagues, match results, and upcoming fixtures.">
      {/* Hero Section */}
      <section className={`pt-24 pb-2 bg-gradient-to-b from-black/30 to-transparent ${themeMounted && theme === 'light' ? 'bg-transparent' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
            Leagues & Fixtures
          </h1>
        </div>
      </section>

      {/* Unified Actions Header */}
      <section className={`py-0 ${themeMounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-0">
          </div>

          {renderCalendar()}

          <div className="mt-8 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-1">
              {/* Search Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-unill-yellow-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Search sports, leagues, teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 pl-12 pr-4 py-4 text-sm font-medium"
                />
              </div>

              {/* Sport Selector */}
              <div className="border-l border-white/10 relative">
                <select
                  value={currentFilter}
                  onChange={(e) => setCurrentFilter(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-white py-4 pl-4 pr-10 text-sm font-medium appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <option value="all" className="bg-gray-900">All Disciplines</option>
                  <option value="live" className="bg-gray-900">🔥 Live Events</option>
                  {sports.map(sport => (
                    <option key={sport.id} value={sport.name.toLowerCase()} className="bg-gray-900">{sport.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Season Selector */}
              <div className="border-l border-white/10 relative">
                <select
                  value={selectedSeasonId}
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                  disabled={seasons.length === 0}
                  className="w-full bg-transparent border-none focus:ring-0 text-white py-4 pl-4 pr-10 text-sm font-medium appearance-none cursor-pointer hover:bg-white/5 transition-colors disabled:opacity-30"
                >
                  <option value="" className="bg-gray-900">Select Season</option>
                  {seasons.map(s => (
                    <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>

              {/* League Quick Select */}
              <div className="border-l border-white/10 relative">
                <select
                  value={selectedLeague}
                  onChange={(e) => {
                    const leagueId = e.target.value;
                    setSelectedLeague(leagueId);
                    if (leagueId) window.location.href = `/league/${leagueId}`;
                  }}
                  className="w-full bg-transparent border-none focus:ring-0 text-white py-4 pl-4 pr-10 text-sm font-medium appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <option value="" className="bg-gray-900">Jump to League</option>
                  {leagues
                    .filter((league: any) => league.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((league: any) => (
                      <option key={league.id} value={league.id} className="bg-gray-900">{league.name}</option>
                    ))
                  }
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Matches */}
      <section className={`py-8 bg-black/20 backdrop-blur-sm ${themeMounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 flex-col sm:flex-row">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Live & Upcoming Matches
            </h2>
            <p className="text-lg text-gray-700 mt-2 sm:mt-0">Real-time updates from ongoing university sports events</p>
          </div>

          <div id="matches-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className={`bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 ${match.status === 'live' ? 'animate-pulse-live' : ''
                  }`}
                data-sport={match.sport}
                data-status={match.status}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${match.status === 'live' ? 'bg-red-500 text-white' :
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
                      <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{match.homeTeam}</h4>
                      <div className="w-16 h-16 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full mx-auto mb-2"></div>
                      {match.score && (
                        <p className="text-3xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                          {match.score.home}
                        </p>
                      )}
                    </div>
                    <div className="text-gray-400 text-xl font-bold">VS</div>
                    <div className="text-center">
                      <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{match.awayTeam}</h4>
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
      <section className={`py-8 ${themeMounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 flex-col sm:flex-row">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Active Leagues
            </h2>
            <p className="text-lg text-gray-700 mt-2 sm:mt-0">Explore ongoing tournaments and competitions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leagues && leagues.length > 0 ? (
              leagues.map((league: any) => (
                <div
                  key={league.id}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 cursor-pointer hover:bg-white/20 transition-all transform hover:scale-105"
                  onClick={() => window.location.href = `/league/${league.id}`}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{league.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{league.sportType} Sport</p>
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
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/league-explorer?leagueId=${league.id}`;
                      }}
                      className="flex-1 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 text-white px-3 py-2 rounded text-sm font-semibold hover:from-unill-yellow-500 hover:to-unill-purple-600 transition-all"
                    >
                      View History
                    </button>
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

      {/* Match Details Modal */}
      {modalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Matches on {new Date(selectedDate).toLocaleDateString()}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {(fixtures.length > 0
                ? fixtures.filter(fixture => {
                  const fixtureDate = new Date(fixture.scheduledAt).toISOString().split('T')[0];
                  return fixtureDate === selectedDate;
                })
                : matches.filter(match => match.date === selectedDate)
              ).map((match, index) => (
                <div key={index} className="bg-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold capitalize">{('sport' in match) ? match.sport : (match as Match).sport}</span>
                    <span className={`px-2 py-1 rounded text-xs ${match.status === 'live' ? 'bg-red-500 text-white' :
                      match.status === 'scheduled' ? 'bg-blue-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                      {match.status === 'scheduled' ? 'UPCOMING' : match.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="font-bold">{('homeTeamName' in match) ? match.homeTeamName : match.homeTeam}</h4>
                      </div>
                      <div className="text-gray-400">VS</div>
                      <div className="text-right">
                        <h4 className="font-bold">{('awayTeamName' in match) ? match.awayTeamName : match.awayTeam}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {match.venue} • {('scheduledAt' in match) ? new Date(match.scheduledAt).toLocaleTimeString() : match.time}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSetReminder(match)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Set Notification
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

        .horizontal-scroll {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        .horizontal-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </Layout>
  );
};

export default SchedulePage;
