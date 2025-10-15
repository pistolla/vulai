import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { apiService } from '../../services/apiService';
import { subscribeFanChat, sendFanChatMessage } from '../../services/firestoreFan';
import { useAppSelector } from '../../hooks/redux';

interface MatchData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  score: { home: number; away: number };
  status: string;
  minute: number;
  venue: string;
  sport: string;
}

interface TelemetryData {
  ball: { x: number; y: number };
  players: Array<{ id: string; x: number; y: number; team: 'home' | 'away' }>;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  createdAt: any;
}

export default function LiveMatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAppSelector(s => s.auth.user);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock telemetry data for demo
  const mockTelemetry: TelemetryData = {
    ball: { x: Math.random() * 482 + 19, y: Math.random() * 270 + 11 },
    players: Array.from({ length: 22 }, (_, i) => ({
      id: `player${i}`,
      x: Math.random() * 482 + 19,
      y: Math.random() * 270 + 11,
      team: i < 11 ? 'home' : 'away' as 'home' | 'away'
    }))
  };

  useEffect(() => {
    if (!id) return;

    const loadMatchData = async () => {
      try {
        // In a real app, this would fetch from Firebase
        const mockMatch: MatchData = {
          id: id as string,
          homeTeam: 'Eagles',
          awayTeam: 'Lions',
          score: { home: 2, away: 1 },
          status: 'live',
          minute: 67,
          venue: 'University Stadium',
          sport: 'football'
        };
        setMatchData(mockMatch);

        // Subscribe to live telemetry updates
        const telemetryInterval = setInterval(() => {
          setTelemetry(mockTelemetry);
        }, 1000);

        // Subscribe to fan chat
        const unsubscribe = subscribeFanChat(id as string, setChatMessages);

        return () => {
          clearInterval(telemetryInterval);
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

  // Draw telemetry on canvas
  useEffect(() => {
    if (!canvasRef.current || !telemetry) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(telemetry.ball.x, telemetry.ball.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw players
    telemetry.players.forEach(player => {
      ctx.beginPath();
      ctx.arc(player.x, player.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = player.team === 'home' ? '#3b82f6' : '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [telemetry]);

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

  if (loading) {
    return (
      <Layout title="Live Match">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading live match...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!matchData) {
    return (
      <Layout title="Live Match">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Match Not Found</h1>
            <p className="text-gray-600">The requested match could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Live: ${matchData.homeTeam} vs ${matchData.awayTeam}`}>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Match Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-8 mb-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{matchData.homeTeam}</h2>
                  <div className="text-4xl font-black text-blue-600">{matchData.score.home}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">VS</div>
                  <div className="text-sm text-red-500 font-semibold">LIVE - {matchData.minute}'</div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{matchData.awayTeam}</h2>
                  <div className="text-4xl font-black text-red-600">{matchData.score.away}</div>
                </div>
              </div>
              <p className="text-gray-600">{matchData.venue} • {matchData.sport}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Pitch Visualization */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Live Match Visualization</h3>
                <div className="relative">
                  <img
                    src="/soccer_pitch.svg"
                    alt="Soccer Pitch"
                    className="w-full h-auto rounded-lg"
                  />
                  <canvas
                    ref={canvasRef}
                    width="520"
                    height="292"
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
                <div className="mt-4 flex justify-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                    <span>{matchData.homeTeam}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span>{matchData.awayTeam}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full mr-2"></div>
                    <span>Ball</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fan Chat */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Fan Chat</h3>
              <div className="h-96 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="mb-2">
                    <span className="font-semibold text-blue-600">{msg.user}:</span>
                    <span className="ml-2">{msg.text}</span>
                  </div>
                ))}
              </div>
              {user ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              ) : (
                <p className="text-center text-gray-500">Login to join the chat</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}