import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { apiService } from '@/services/apiService';
import { db } from '@/services/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { FiUsers, FiPlayCircle, FiShoppingBag, FiMessageSquare, FiArrowRight, FiCalendar } from 'react-icons/fi';

/* ---------------------------------
    MiniCard component
---------------------------------- */
function MiniCard({ title, img, children }: { title: string; img?: string; children: React.ReactNode }) {
  return (
    <div className="flex-shrink-0 w-full h-full bg-white dark:bg-gray-800 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-xl">
      <h3 className="text-lg font-bold mb-3 text-blue-600 dark:text-blue-400">{title}</h3>
      {img && (
        <div className="relative overflow-hidden rounded-xl mb-4 group">
          <img src={img} alt={title} className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        </div>
      )}
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">{children}</div>
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
        const matchesData = await apiService.getSchedule();
        if (matchesData && matchesData.length > 0) {
          setMatches(matchesData);
        } else {
          throw new Error('Empty Firebase matches data');
        }
      } catch (error) {
        console.error('Failed to load matches from Firebase:', error);
        try {
          const response = await fetch('/data/schedule.json');
          if (!response.ok) throw new Error('Failed to load schedule data');
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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

  const cardsToShow = isMobile ? 1 : 3;
  const visibleMatches = matches.slice(currentSlide, currentSlide + cardsToShow);

  if (loading) {
    return (
      <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading match radar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-700">
      <div className="relative h-full">
        {isMobile ? (
          matches.map((match: any, index: number) => (
            <div
              key={match.id}
              className={`absolute inset-0 p-4 transition-all duration-500 transform ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            >
              <MiniCard title={`${match.homeTeam} vs ${match.awayTeam}`} img={`https://picsum.photos/seed/${match.id}/400/250`}>
                <MatchInfo match={match} />
              </MiniCard>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-3 gap-6 h-full p-6">
            {visibleMatches.map((match: any) => (
              <MiniCard key={match.id} title={`${match.homeTeam} vs ${match.awayTeam}`} img={`https://picsum.photos/seed/${match.id}/400/250`}>
                <MatchInfo match={match} />
              </MiniCard>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none">
          <button onClick={prevSlide} className={`p-3 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg pointer-events-auto transition-all ${currentSlide === 0 ? 'opacity-0 cursor-default' : 'hover:scale-110 active:scale-95'}`}><FiArrowRight className="rotate-180" /></button>
          <button onClick={nextSlide} className={`p-3 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg pointer-events-auto transition-all ${(!isMobile && currentSlide >= matches.length - 3) ? 'opacity-0 cursor-default' : 'hover:scale-110 active:scale-95'}`}><FiArrowRight /></button>
        </div>
      </div>
    </div>
  );
}

function MatchInfo({ match }: { match: any }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="opacity-70">Score:</span>
        <span className="font-bold text-blue-600 dark:text-blue-400">{match.score ? `${match.score.home} - ${match.score.away}` : 'TBD'}</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="opacity-70">Venue:</span>
        <span className="truncate max-w-[120px]">{match.venue}</span>
      </div>
      <div className="flex justify-between items-center pt-2">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${match.status === 'live' ? 'bg-red-500 text-white animate-pulse' :
            match.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
          {match.status}
        </span>
        <span className="text-xs font-medium">{match.date} • {match.time}</span>
      </div>
    </div>
  );
}

function ActivityFeed({ users }: any) {
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        const q = query(collection(db, 'admin', 'dashboard', 'recentUsers'), orderBy('timestamp', 'desc'), limit(4));
        const snapshot = await getDocs(q);
        const recent = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentUsers(recent);
      } catch (error) {
        console.error('Failed to fetch recent users:', error);
        // Fallback to provided users
        setRecentUsers(users.slice(0, 4));
      }
    };
    fetchRecentUsers();
  }, [users]);

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold dark:text-white">Recent Activity</h3>
        <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</button>
      </div>
      <div className="space-y-4">
        {recentUsers.map((u: any, idx: number) => (
          <div key={u.id || u.uid} className="group flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                <span className="text-white font-bold text-lg">{u.name.slice(0, 1).toUpperCase()}</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white dark:border-gray-800 rounded-full ${u.status === 'active' || u.status === true ? 'bg-green-500' : 'bg-yellow-500'}`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{u.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{u.role} at {u.university || 'Unill Sports'}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{u.clientBrowser} • {u.ip}</p>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{u.timestamp ? new Date(u.timestamp.toDate()).toLocaleString() : `${idx + 1}h ago`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Schedule({ upcoming }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <FiCalendar className="text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-bold dark:text-white">Today's Slate</h3>
      </div>
      <div className="space-y-4">
        {upcoming.slice(0, 4).map((g: any) => (
          <div key={g.id} className="relative p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform" />
            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{g.homeTeamName} vs {g.awayTeamName}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-400 mr-2" />{g.sport}</span>
              <span>{new Date(g.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        {upcoming.length === 0 && <p className="text-center py-10 text-gray-500 italic">No games scheduled for today.</p>}
      </div>
      <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all font-bold shadow-lg hover:shadow-blue-500/30 active:scale-95">Full Schedule</button>
    </div>
  );
}

function StatCard({ icon: Icon, color, value, label, change, trendingUp }: any) {
  const colorMap: any = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900/30',
    orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-black/5 hover:-translate-y-1 transition-all group">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${colorMap[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center text-xs font-bold ${trendingUp ? 'text-green-500' : 'text-red-500'}`}>
          {trendingUp ? '↑' : '↓'} {change}
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</h4>
        <div className="text-3xl font-black mt-1 dark:text-white tabular-nums">{value}</div>
      </div>
    </div>
  );
}

export default function DashboardTab({ stats, live, users, upcoming, openGame }: any) {
  const { loading } = useAppSelector(s => s.admin);
  const isLoading = loading.dashboard;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard icon={FiUsers} color="blue" label="Total Users" value={stats.users || '0'} change="12%" trendingUp />
            <StatCard icon={FiPlayCircle} color="green" label="Live Matches" value={stats.liveGames || '0'} change="2" trendingUp />
            <StatCard icon={FiShoppingBag} color="purple" label="Sales (KSh)" value={stats.merchSales || '0'} change="8%" trendingUp />
            <StatCard icon={FiMessageSquare} color="orange" label="Reviews" value={stats.pendingReviews || '0'} change="5" trendingDown={false} />
          </>
        )}
      </div>

      {/* Main Radar Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-2xl shadow-black/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black dark:text-white tracking-tight">Match Radar</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Monitoring active tournaments across all regions</p>
          </div>
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-1.5 rounded-full border border-gray-200 dark:border-gray-600">
            <span className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-bold shadow-sm dark:text-white">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping mr-2.5" />
              Live Now
            </span>
          </div>
        </div>
        <KenyaMap live={live} upcoming={upcoming} onPin={openGame} />
      </div>

      {/* Activity and Schedule Swiper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ActivityFeed users={users || []} />
        <Schedule upcoming={upcoming || []} />
      </div>
    </div>
  );
}
