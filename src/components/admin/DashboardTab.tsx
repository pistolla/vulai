import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { apiService } from '@/services/apiService';

/* ---------------------------------
    MiniCard component (from team page)
---------------------------------- */
function MiniCard({ title, img, children }: { title: string; img?: string; children: React.ReactNode }) {
  return (
    <div className="flex-shrink-0 w-full h-full bg-white backdrop-blur-sm border border-gray-200 rounded-2xl p-5 hover:-translate-y-2 transition">
      <h3 className="text-lg mb-3 text-blue-600">{title}</h3>
      {img && <img src={img} alt={title} className="w-full h-32 object-cover rounded mb-3" />}
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
}

function KenyaMap({ live, upcoming, onPin }: any) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        // Try to load from Firebase API first
        const matchesData = await apiService.getSchedule();
        if (matchesData && matchesData.length > 0) {
          setMatches(matchesData);
        } else {
          throw new Error('Empty Firebase matches data');
        }
      } catch (error) {
        console.error('Failed to load matches from Firebase:', error);
        // Fallback to local JSON file
        try {
          const response = await fetch('/data/schedule.json');
          if (!response.ok) {
            throw new Error('Failed to load schedule data');
          }
          const data = await response.json();
          setMatches(data.matches || []);
        } catch (localError) {
          console.error('Failed to load local schedule data:', localError);
          setMatches([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextSlide = () => {
    if (isMobile) {
      setCurrentSlide((prev) => (prev + 1) % matches.length);
    } else {
      setCurrentSlide((prev) => Math.min(prev + 3, matches.length - 3));
    }
  };

  const prevSlide = () => {
    if (isMobile) {
      setCurrentSlide((prev) => (prev - 1 + matches.length) % matches.length);
    } else {
      setCurrentSlide((prev) => Math.max(prev - 3, 0));
    }
  };

  // Determine how many cards to show based on screen size
  const cardsToShow = isMobile ? 1 : 3;
  const visibleMatches = matches.slice(currentSlide, currentSlide + cardsToShow);

  if (loading) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
        <p className="text-gray-600">No matches found.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden shadow-lg">
      {/* Slider Container */}
      <div className="relative h-full">
        {isMobile ? (
          // Mobile: Single card slider
          matches.map((match: any, index: number) => (
            <div
              key={match.id}
              className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <MiniCard
                title={`${match.homeTeam} vs ${match.awayTeam}`}
                img="https://picsum.photos/seed/game/400/250"
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-bold">{match.score ? `${match.score.home} - ${match.score.away}` : 'Not started'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sport:</span>
                    <span>{match.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Venue:</span>
                    <span>{match.venue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{match.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{match.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      match.status === 'live' ? 'bg-red-100 text-red-800' :
                      match.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                </div>
              </MiniCard>
            </div>
          ))
        ) : (
          // Desktop: Show 3 cards side by side
          <div className="grid grid-cols-3 gap-4 h-full p-4">
            {visibleMatches.map((match: any, index: number) => (
              <MiniCard
                key={match.id}
                title={`${match.homeTeam} vs ${match.awayTeam}`}
                img="https://picsum.photos/seed/game/400/250"
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-bold">{match.score ? `${match.score.home} - ${match.score.away}` : 'Not started'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sport:</span>
                    <span>{match.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Venue:</span>
                    <span>{match.venue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{match.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{match.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      match.status === 'live' ? 'bg-red-100 text-red-800' :
                      match.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                </div>
              </MiniCard>
            ))}
          </div>
        )}

        {/* Navigation Arrows - Only show on mobile */}
        {isMobile && matches.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator - Only show on mobile */}
        {isMobile && matches.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {matches.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Desktop Navigation - Show arrows when there are more matches */}
        {!isMobile && matches.length > 3 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              disabled={currentSlide === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              disabled={currentSlide >= matches.length - 3}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ActivityFeed({ users }: any) {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Recent User Activity</h3>
      <div className="space-y-3">
        {users.slice(0, 3).map((u: any) => (
          <div key={u.uid} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center"><span className="text-white font-bold text-sm">{u.name.slice(0, 2).toUpperCase()}</span></div>
            <div className="flex-1"><p className="font-semibold text-gray-900">{u.name}</p><p className="text-sm text-gray-600">{u.role} • {u.university || '—'}</p><p className="text-xs text-gray-500">Registered recently</p></div>
            <div className="flex flex-col items-end"><span className={`px-2 py-1 rounded-full text-xs ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{u.status}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Schedule({ upcoming }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h3>
      <div className="space-y-4">
        {upcoming.slice(0, 3).map((g: any) => (
          <div key={g.id} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded"><p className="font-semibold text-gray-900 text-sm">{g.homeTeamName} vs {g.awayTeamName}</p><p className="text-sm text-gray-600">{g.sport} • {new Date(g.scheduledAt).toLocaleTimeString()}</p></div>
        ))}
      </div>
      <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">View Full Schedule</button>
    </div>
  );
}

function StatCard({ color, value, label, change }: any) {
  const grad = `bg-gradient-to-br from-${color}-500 to-${color}-600`;
  return (
    <div className={`p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200 float ${grad}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-100 text-sm`}>{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className={`text-${color}-200 text-xs mt-1`}>↗ {change}</p>
        </div>
        <svg className={`w-10 h-10 text-${color}-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      </div>
    </div>
  );
}

function ShimmerCard() {
  return (
    <div className="p-6 rounded-xl shadow-lg bg-white animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}

function ShimmerTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardTab({ stats, live, users, upcoming, openGame, adminData }: any) {
  const { loading } = useAppSelector(s => s.admin);
  const hasStats = stats && Object.keys(stats).length > 0;
  const hasLiveGames = live?.length > 0;
  const hasUpcomingGames = upcoming?.length > 0;
  const hasRecentUsers = users?.length > 0;
  const isLoading = loading.dashboard;

  return (
    <div id="content-dashboard" className="slide-in-left">
      {/* stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {isLoading ? (
          <>
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </>
        ) : hasStats ? (
          <>
            <StatCard color="blue"  value={stats.users}      label="Total Users"     change="+12%" />
            <StatCard color="green" value={stats.liveGames}  label="Live Games"      change="+3"   />
            <StatCard color="purple"value={`KSh ${stats.merchSales}`} label="Merchandise Sales" change="+8%" />
            <StatCard color="orange"value={stats.pendingReviews} label="Pending Reviews" change="-2"   />
          </>
        ) : (
          <>
            <div className="p-6 rounded-xl shadow-lg bg-white text-center">
              <p className="text-gray-500">No stats available</p>
            </div>
            <div className="p-6 rounded-xl shadow-lg bg-white text-center">
              <p className="text-gray-500">No stats available</p>
            </div>
            <div className="p-6 rounded-xl shadow-lg bg-white text-center">
              <p className="text-gray-500">No stats available</p>
            </div>
            <div className="p-6 rounded-xl shadow-lg bg-white text-center">
              <p className="text-gray-500">No stats available</p>
            </div>
          </>
        )}
      </div>

      {/* map */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Live Games Across Kenya</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><span>Live</span>
            <div className="w-2 h-2 bg-yellow-500 rounded-full ml-4" /><span>Upcoming</span>
          </div>
        </div>
        {isLoading ? (
          <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            </div>
          </div>
        ) : hasLiveGames || hasUpcomingGames ? (
          <KenyaMap live={live} upcoming={upcoming} onPin={openGame} />
        ) : (
          <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">No games available</p>
          </div>
        )}
        <p className="text-gray-600 mt-4 text-center italic">Click on the pins to view live game details and commentary</p>
      </div>

      {/* bottom grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent User Activity</h3>
              <ShimmerTable rows={3} />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h3>
              <ShimmerTable rows={3} />
            </div>
          </>
        ) : (
          <>
            {hasRecentUsers ? (
              <ActivityFeed users={users} />
            ) : (
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent User Activity</h3>
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent user activity</p>
                </div>
              </div>
            )}
            {hasUpcomingGames ? (
              <Schedule upcoming={upcoming} />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h3>
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming games</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}