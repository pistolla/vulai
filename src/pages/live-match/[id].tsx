import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { subscribeFanChat, sendFanChatMessage } from '../../services/firestoreFan';
import { useAppSelector } from '../../hooks/redux';
import { RootState } from '@/store';
import { MatchHeader } from '../../components/live-match/MatchHeader';
import { LivePitch } from '../../components/live-match/LivePitch';
import { StatsComparison } from '../../components/live-match/StatsComparison';
import { MomentumBar } from '../../components/live-match/MomentumBar';
import { FiMessageSquare, FiSend, FiZap } from 'react-icons/fi';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { SoccerGameProcessor, GameState, Player, Ball } from '../../services/soccer_processor';

interface MatchStats {
  possession: { home: number; away: number };
  shotsOnGoal: { home: number; away: number };
  fouls: { home: number; away: number };
  cards: { home: { yellow: number; red: number }; away: { yellow: number; red: number } };
  corners: { home: number; away: number };
}

interface MatchData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  score: { home: number; away: number };
  status: string;
  minute: number;
  venue: string;
  sport: string;
  stats?: MatchStats;
}

interface TelemetryData {
  ball: { x: number; y: number; z: number };
  players: Array<{ id: string; x: number; y: number; z: number; team: 'home' | 'away' }>;
  timestamp: number;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  createdAt: any;
}

interface CommentaryMessage {
  id: string;
  correspondent: string;
  comment: string;
  timestamp: number;
}

// Basic game stats analysis function
function analyzeGameStats(telemetry: TelemetryData): any {
  // Basic analysis: detect ball position, player speeds, etc.
  // This is a simplified example
  const ball = telemetry.ball;
  const players = telemetry.players;

  // Detect if ball is in goal area (simplified)
  const homeGoal = ball.x < 50 && ball.y > 100 && ball.y < 200;
  const awayGoal = ball.x > 450 && ball.y > 100 && ball.y < 200;

  // Calculate team control (players in ball vicinity)
  const ballVicinity = 50;
  const homePlayersNear = players.filter(p => p.team === 'home' && Math.sqrt((p.x - ball.x)**2 + (p.y - ball.y)**2) < ballVicinity).length;
  const awayPlayersNear = players.filter(p => p.team === 'away' && Math.sqrt((p.x - ball.x)**2 + (p.y - ball.y)**2) < ballVicinity).length;

  return {
    ballInHomeGoal: homeGoal,
    ballInAwayGoal: awayGoal,
    homeControl: homePlayersNear > awayPlayersNear,
    awayControl: awayPlayersNear > homePlayersNear,
    // Add more analysis as needed
  };
}

export default function LiveMatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAppSelector((s: RootState) => s.auth.user);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [commentaryMessages, setCommentaryMessages] = useState<CommentaryMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [cheerEffect, setCheerEffect] = useState<{ team: 'home' | 'away', active: boolean } | null>(null);
  const [enableGameStats, setEnableGameStats] = useState(false);
  const [gameStats, setGameStats] = useState<any>(null);

  // Mock telemetry data for demo
  const mockTelemetry: TelemetryData = {
    ball: { x: Math.random() * 482 + 19, y: Math.random() * 270 + 11, z: Math.random() * 10 },
    players: Array.from({ length: 22 }, (_, i) => ({
      id: `player${i}`,
      x: Math.random() * 482 + 19,
      y: Math.random() * 270 + 11,
      z: Math.random() * 10,
      team: i < 11 ? 'home' : 'away' as 'home' | 'away'
    })),
    timestamp: Date.now()
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadMatchData = async () => {
      try {
        const mockMatch: MatchData = {
          id: id as string,
          homeTeam: 'Eagles',
          awayTeam: 'Lions',
          score: { home: 2, away: 1 },
          status: 'live',
          minute: 67,
          venue: 'University Stadium',
          sport: 'football',
          stats: {
            possession: { home: 54, away: 46 },
            shotsOnGoal: { home: 8, away: 5 },
            fouls: { home: 12, away: 14 },
            corners: { home: 6, away: 4 },
            cards: {
              home: { yellow: 2, red: 0 },
              away: { yellow: 3, red: 1 }
            }
          }
        };
        setMatchData(mockMatch);

        const telemetryInterval = setInterval(async () => {
          try {
            const channelDoc = await getDoc(doc(db, 'channels', id as string));
            if (channelDoc.exists()) {
              const data = channelDoc.data();
              if (data.latestTelemetry) {
                setTelemetry(data.latestTelemetry);
                if (enableGameStats) {
                  // Process game stats
                  const stats = analyzeGameStats(data.latestTelemetry);
                  setGameStats(stats);
                }
              }
            } else {
              // Fallback to mock
              setTelemetry({
                ball: { x: Math.random() * 482 + 19, y: Math.random() * 270 + 11, z: Math.random() * 10 },
                players: Array.from({ length: 22 }, (_, i) => ({
                  id: `player${i}`,
                  x: Math.random() * 482 + 19,
                  y: Math.random() * 270 + 11,
                  z: Math.random() * 10,
                  team: i < 11 ? 'home' : 'away' as 'home' | 'away'
                })),
                timestamp: Date.now()
              });
            }
          } catch (error) {
            console.error('Error fetching telemetry:', error);
          }
        }, 500);

        const unsubscribe = subscribeFanChat(id as string, setChatMessages);

        const commentaryInterval = setInterval(() => {
          fetchLiveCommentary(id as string);
        }, 30000);

        fetchLiveCommentary(id as string);

        return () => {
          clearInterval(telemetryInterval);
          clearInterval(commentaryInterval);
          unsubscribe();
        };
      } catch (error) {
        console.error('Failed to load match data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatchData();
  }, [id]);

  const triggerCheer = (team: 'home' | 'away') => {
    setCheerEffect({ team, active: true });
    setTimeout(() => setCheerEffect(null), 1000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !id) return;

    try {
      await sendFanChatMessage(
        id as string,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      alert('Failed to send message: ' + (error as Error).message);
    }
  };

  const fetchLiveCommentary = async (matchId: string) => {
    try {
      // In a real app, this would fetch from Firebase
      // For demo, we'll simulate commentary messages
      const mockCommentary: CommentaryMessage[] = [
        {
          id: '1',
          correspondent: 'John Smith',
          comment: 'Great start by the Eagles! Strong defensive play in the opening minutes.',
          timestamp: Date.now() - 30000
        },
        {
          id: '2',
          correspondent: 'Sarah Johnson',
          comment: 'The midfield battle is intense. Both teams showing excellent tactical discipline.',
          timestamp: Date.now() - 15000
        },
        {
          id: '3',
          correspondent: 'Mike Wilson',
          comment: 'Beautiful cross from the left wing! Eagles captain just missed the header.',
          timestamp: Date.now()
        }
      ];
      setCommentaryMessages(mockCommentary);
    } catch (error) {
      console.error('Failed to fetch commentary:', error);
    }
  };

  if (loading) {
    return (
      <Layout title="Live Match">
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading live match...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!matchData) {
    return (
      <Layout title="Live Match">
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Match Not Found</h1>
                <p className="text-gray-600">The requested match could not be found.</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Live: ${matchData.homeTeam} vs ${matchData.awayTeam}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Cinematic Match Header */}
          <MatchHeader
            homeTeam={matchData.homeTeam}
            awayTeam={matchData.awayTeam}
            score={matchData.score}
            minute={matchData.minute}
            status={matchData.status}
            venue={matchData.venue}
          />

          {/* Momentum Indicator */}
          <MomentumBar pressure={15} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Pitch & Stats */}
            <div className="lg:col-span-2 space-y-8">
              <LivePitch
                telemetry={telemetry}
                homeTeam={matchData.homeTeam}
                awayTeam={matchData.awayTeam}
              />

              {matchData.stats && (
                <StatsComparison
                  stats={matchData.stats}
                  homeTeam={matchData.homeTeam}
                  awayTeam={matchData.awayTeam}
                />
              )}
            </div>

            {/* Right Column - Commentary & Chat */}
            <div className="space-y-8">
              {/* Live Commentary */}
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <FiMessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Live Commentary</h3>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {commentaryMessages.map((msg: CommentaryMessage) => (
                    <div key={msg.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-l-4 border-green-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-black text-green-600 dark:text-green-400 text-sm">{msg.correspondent}</span>
                        <span className="text-xs text-gray-400">{mounted ? new Date(msg.timestamp).toLocaleTimeString() : ''}</span>
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{msg.comment}</p>
                    </div>
                  ))}
                  {commentaryMessages.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Waiting for live commentary...</p>
                  )}
                </div>
              </div>

              {/* Fan Chat */}
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <FiMessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Fan Chat</h3>
                </div>

                <div className="h-80 overflow-y-auto mb-4 space-y-3">
                  {chatMessages.map((msg: ChatMessage) => (
                    <div key={msg.id} className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{msg.user.charAt(0)}</span>
                        </div>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{msg.user}</span>
                        <span className="text-xs text-gray-500">{mounted ? new Date(msg.createdAt).toLocaleTimeString() : ''}</span>
                      </div>
                      <div className="ml-8 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <p className="text-sm text-gray-800 dark:text-gray-200">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {user ? (
                  <form onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      type="text"
                      placeholder="Share your thoughts..."
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold transition-all active:scale-95">
                      <FiSend />
                    </button>
                  </form>
                ) : (
                  <p className="text-center text-gray-500 text-sm">Login to join the chat</p>
                )}
              </div>

              {/* Game Stats Toggle */}
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <FiZap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Game Stats</h3>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={enableGameStats}
                      onChange={(e) => setEnableGameStats(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enable Advanced Game Analysis</span>
                  </label>

                  {enableGameStats && gameStats && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        <strong>Ball Position:</strong> {gameStats.ballInHomeGoal ? 'In Home Goal Area' : gameStats.ballInAwayGoal ? 'In Away Goal Area' : 'In Play'}
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        <strong>Team Control:</strong> {gameStats.homeControl ? 'Home Team' : gameStats.awayControl ? 'Away Team' : 'Neutral'}
                      </p>
                      {/* Add more stats as analysis improves */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
