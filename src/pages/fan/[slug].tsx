import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { fetchGames } from '@/store/adminThunk';
import { fetchMerch } from '@/store/adminThunk';
import { fetchFanData, followTeam, buyTicket } from '@/store/fanThunk';
import dynamic from 'next/dynamic';
import FanGuard from '@/guards/FanGuard';
import { ChatMessage } from '@/services/firestoreFan';
import UserHeader from '@/components/UserHeader';
import { apiService } from '@/services/apiService';

/* ---------- types ---------- */
export type TeamTheme = 'crimson' | 'blue' | 'cardinal' | 'gold';

/* ---------- styles ---------- */
const themes: Record<TeamTheme, Record<string, string>> = {
  crimson: { primary: '#990000', secondary: '#ffffff', accent: '#13294b' },
  blue:    { primary: '#003366', secondary: '#ffffff', accent: '#990000' },
  cardinal:{ primary: '#8C1515', secondary: '#ffffff', accent: '#4D4D4D' },
  gold:    { primary: '#FFB81C', secondary: '#000000', accent: '#00539B' },
};

interface FanPageProps {
  slug?: string;
}

export default function FanPage({ slug: propSlug }: FanPageProps) {
  const router = useRouter();
  const { slug: routerSlug } = router.query;
  const slug = propSlug || routerSlug;
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const { followedTeams, myTickets, newsFeed } = useAppSelector(s => s.fan);
  const merch = useAppSelector(s => s.merch.items);
  const { upcoming } = useAppSelector(s => s.games);

  /* ---------- local state ---------- */
  const [teamData, setTeamData] = useState<any>(null);
  const [theme, setTheme] = useState<TeamTheme>('crimson');
  const [chatMsg, setChatMsg] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Array<{name: string; avatar?: string}>>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const selectedFixture = upcoming[0]; // demo: first upcoming game

  /* ---------- mounted check ---------- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------- init ---------- */
  useEffect(() => {
    // Wait for component to be mounted and router to be ready
    if (!mounted || !router.isReady || !slug) return;

    const loadTeamData = async () => {
      try {
        const teamsData = await apiService.getTeamsData();
        const team = teamsData.teams.find((t: any) => t.id === slug);
        if (team) {
          setTeamData(team);
          // Set theme based on team data (you can customize this logic)
          setTheme("blue");
        } else {
          console.warn(`Team with slug "${slug}" not found`);
          setTeamData(null);
        }
      } catch (error) {
        console.error('Failed to load team data:', error);
        setTeamData(null);
      } finally {
        setLoading(false);
      }
    };

    // Initialize AOS and feather icons only on client side
    const initClientSideLibs = async () => {
      if (typeof window !== 'undefined') {
        try {
          const [{ default: AOS }, { default: feather }] = await Promise.all([
            import('aos'),
            import('feather-icons')
          ]);
          
          // Dynamically add AOS CSS
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
          document.head.appendChild(link);
          
          AOS.init({ once: true });
          feather.replace();
        } catch (error) {
          console.warn('Failed to load AOS or Feather icons:', error);
        }
      }
    };

    initClientSideLibs();
    dispatch(fetchGames());
    dispatch(fetchMerch());
    if (user) {
      dispatch(fetchFanData(user.uid));
      subscribeChat();
    }
    loadTeamData();

    // Mock online users for demo
    setOnlineUsers([
      { name: 'John Fan' },
      { name: 'Sarah Supporter' },
      { name: 'Mike Enthusiast' },
      { name: 'Emma Cheerleader' },
      { name: 'David Loyal' },
      { name: 'Lisa Passionate' },
      { name: 'Tom Dedicated' },
      { name: 'Anna Devoted' }
    ]);
  }, [dispatch, user, slug, router.isReady, mounted]);

  /* ---------- theme css vars ---------- */
  useEffect(() => {
    const root = document.documentElement;
    const t = themes[theme];
    root.style.setProperty('--primary-color', t.primary);
    root.style.setProperty('--secondary-color', t.secondary);
    root.style.setProperty('--accent-color', t.accent);
    root.className = `theme-${theme}`;
  }, [theme]);

  /* ---------- real-time chat ---------- */
  const subscribeChat = () => {
    if (!selectedFixture?.id) return;
    import('@/services/firestoreFan').then(({ subscribeFanChat }) => {
      subscribeFanChat(selectedFixture.id, (msgs) => setChatMessages(msgs));
    });
  };

  /* ---------- handlers ---------- */
  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !selectedFixture?.id || !user) return;
    import('@/services/firestoreFan').then(({ sendFanChatMessage }) => {
      sendFanChatMessage(selectedFixture.id, user.uid, user.displayName || 'Fan', chatMsg);
      setChatMsg('');
    });
  };

  const follow = (teamId: string) => dispatch(followTeam(teamId));
  const buyTix = (fixtureId: string) => {
    const seat = prompt('Preferred seat (e.g. A1)') || 'GA';
    dispatch(buyTicket({ fixtureId, seat, price: 10 }));
  };

  /* ---------- helpers ---------- */
  const isFollowed = (teamId: string) => followedTeams.includes(teamId);

  // Show loading while not mounted, router is not ready, or while loading team data
  if (!mounted || !router.isReady || loading) {
    return (
      <FanGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading team data...</p>
          </div>
        </div>
      </FanGuard>
    );
  }

  if (!teamData) {
    return (
      <FanGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Not Found</h1>
            <p className="text-gray-600">The requested team could not be found.</p>
          </div>
        </div>
      </FanGuard>
    );
  }

  return (
    <FanGuard>
      <UserHeader theme={theme} />
      <div className="relative">
        {/* Main Content */}
        <div className="lg:pr-80"> {/* Add padding for sidebar on large screens */}
          {/* ------- HERO ------- */}
          <section className="team-theme py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{teamData.name.charAt(0)}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{teamData.name}</h1>
              <p className="text-xl">{teamData.sport} Team - {teamData.league}</p>
            </div>
          </section>

          {/* ------- TEAM STATS ------- */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 team-text">Team Statistics</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <StatCard label="Season Record" value={teamData.record} delay={0} />
                <StatCard label="Championships" value={teamData.championships.toString()} delay={200} />
                <StatCard label="Founded" value={teamData.founded.toString()} delay={400} />
                <StatCard label="Players" value={teamData.players.length.toString()} delay={600} />
              </div>
            </div>
          </section>

          {/* ------- PLAYERS ------- */}
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 team-text">Team Roster</h2>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {teamData.players.slice(0, 8).map((player: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 text-center" data-aos="fade-up" data-aos-delay={index * 100}>
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">{player.avatar}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{player.name}</h3>
                    <p className="text-sm text-gray-600">{player.position}</p>
                    <p className="text-xs text-gray-500">#{player.number} • {player.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ------- MERCHANDISE ------- */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 team-text">Team Merchandise</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {merch.slice(0, 3).map((item: any, index: number) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden merch-item transition-all duration-300" data-aos="fade-up" data-aos-delay={index * 200}>
                    <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 team-text">{item.name}</h3>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold team-text">KSh {item.price}</span>
                        <button className="team-theme text-white px-4 py-2 rounded hover:opacity-90">Add to Cart</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ------- UPCOMING GAMES ------- */}
          <section className="py-12 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 team-text">Upcoming Games</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {upcoming.slice(0, 2).map((g, idx) => (
                  <div key={g.id} className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up" data-aos-delay={idx * 200}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">UPCOMING</span>
                      <span className="text-gray-600">{g.sport}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{g.homeTeamName} vs {g.awayTeamName}</h3>
                    <p className="text-gray-600 mb-4">
                      {mounted ? new Date(g.scheduledAt).toLocaleDateString() : ''} – {mounted ? new Date(g.scheduledAt).toLocaleTimeString() : ''}
                    </p>
                    <p className="text-gray-600 mb-4">{g.venue}</p>
                    <div className="flex space-x-3">
                      <button onClick={() => buyTix(g.id)} className="block text-center team-theme text-white py-2 rounded hover:opacity-90 flex-1">Get Tickets</button>
                      <button onClick={() => follow(g.homeTeamId)} className={`px-4 py-2 rounded ${isFollowed(g.homeTeamId) ? 'bg-gray-400' : 'team-accent text-white hover:opacity-90'}`}>
                        {isFollowed(g.homeTeamId) ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Enhanced Chat Sidebar */}
        <div className="fixed top-0 right-0 h-full z-40">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 h-full bg-white shadow-lg border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              {/* Online Users Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 team-text">Online Fans ({onlineUsers.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {onlineUsers.map((user, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Chat Section */}
              <div>
                <h3 className="text-lg font-bold mb-3 team-text">Fan Chat</h3>
                <div className="h-80 overflow-y-auto mb-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{msg.user.charAt(0)}</span>
                          </div>
                          <span className="font-semibold text-sm text-gray-900">{msg.user}</span>
                          <span className="text-xs text-gray-500">{mounted ? new Date(msg.createdAt).toLocaleTimeString() : ''}</span>
                        </div>
                        <div className="ml-8 p-3 bg-white rounded-lg shadow-sm border">
                          <p className="text-sm text-gray-800">{msg.text}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <button className="hover:text-blue-600 flex items-center space-x-1">
                              <span>👍</span>
                              <span>12</span>
                            </button>
                            <button className="hover:text-blue-600">Reply</button>
                            <button className="hover:text-red-600">Report</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {user ? (
                  <form onSubmit={sendChat} className="flex space-x-2">
                    <input
                      value={chatMsg}
                      onChange={e => setChatMsg(e.target.value)}
                      type="text"
                      placeholder="Share your thoughts..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="team-theme text-white px-4 py-2 rounded-md hover:opacity-90">
                      Post
                    </button>
                  </form>
                ) : (
                  <p className="text-center text-gray-500 text-sm">Login to join the conversation</p>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Floating Chat */}
          <div className="lg:hidden">
            {/* Chat Toggle Button */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="fixed bottom-6 right-6 w-14 h-14 team-theme text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:opacity-90 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            {/* Floating Chat Window */}
            {isChatOpen && (
              <div className="fixed bottom-20 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 z-40 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold team-text">Fan Community</h3>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Online Users */}
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold mb-2">Online ({onlineUsers.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {onlineUsers.slice(0, 6).map((user, index) => (
                      <div key={index} className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1">
                        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <span className="text-xs text-gray-700">{user.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{msg.user.charAt(0)}</span>
                          </div>
                          <span className="font-semibold text-sm text-gray-900">{msg.user}</span>
                          <span className="text-xs text-gray-500">{mounted ? new Date(msg.createdAt).toLocaleTimeString() : ''}</span>
                        </div>
                        <div className="ml-7 p-2 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-800">{msg.text}</p>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            <button className="hover:text-blue-600">👍 8</button>
                            <button className="hover:text-blue-600">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  {user ? (
                    <form onSubmit={sendChat} className="flex space-x-2">
                      <input
                        value={chatMsg}
                        onChange={e => setChatMsg(e.target.value)}
                        type="text"
                        placeholder="Share your thoughts..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button type="submit" className="team-theme text-white px-3 py-2 rounded-md hover:opacity-90 text-sm">
                        Post
                      </button>
                    </form>
                  ) : (
                    <p className="text-center text-gray-500 text-sm">Login to join the conversation</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FanGuard>
  );
}

/* -----------------------------------
   Sub-components
----------------------------------- */
function StatCard({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div className="text-center p-6 rounded-lg team-accent text-white" data-aos="fade-up" data-aos-delay={delay}>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <p>{label}</p>
    </div>
  );
}

/* -----------------------------------
   ✅ Fix dynamic slug issues for Vercel deployment
----------------------------------- */
import type { GetServerSideProps } from "next";

// Use getServerSideProps instead of getStaticProps to avoid 403 errors
export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const slug = params?.slug as string;

  if (!slug) {
    return {
      notFound: true,
    };
  }

  // Set cache headers to improve performance
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  );

  try {
    // Validate that the slug is a reasonable format (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        slug,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      notFound: true,
    };
  }
};