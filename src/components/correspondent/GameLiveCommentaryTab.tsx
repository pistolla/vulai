import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { startLiveCommentary, pushCommentaryEvent, endLiveCommentary } from '@/store/correspondentThunk';
import { fetchGames } from '@/store/adminThunk';

export const GameLiveCommentaryTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const games = useAppSelector(s => s.games.upcoming);
  const activeCommentary = useAppSelector(s => s.correspondent.activeCommentary);
  
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [commentary, setCommentary] = useState('');
  const [minute, setMinute] = useState<number>(0);
  const [eventType, setEventType] = useState<'goal' | 'card' | 'substitution' | 'period' | 'text'>('text');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    dispatch(fetchGames());
  }, [dispatch]);

  useEffect(() => {
    setIsLive(activeCommentary?.status === 'live');
  }, [activeCommentary]);

  const startLive = async () => {
    if (!selectedGameId) {
      alert('Please select a game first.');
      return;
    }
    
    try {
      await dispatch(startLiveCommentary(selectedGameId));
      setIsLive(true);
    } catch (error) {
      console.error('Failed to start live commentary:', error);
      alert('Failed to start live commentary. Please try again.');
    }
  };

  const pushEvent = async () => {
    if (!commentary.trim() || !selectedGameId) {
      alert('Please enter commentary text and select a game.');
      return;
    }

    try {
      await dispatch(pushCommentaryEvent({
        fixtureId: selectedGameId,
        event: {
          minute,
          type: eventType,
          teamId: user?.teamId || '',
          body: commentary,
        },
      }));
      setCommentary('');
      setMinute(minute + 1); // Auto-increment minute for convenience
    } catch (error) {
      console.error('Failed to push commentary event:', error);
      alert('Failed to send commentary update. Please try again.');
    }
  };

  const endLive = async () => {
    if (!selectedGameId) return;
    
    try {
      await dispatch(endLiveCommentary(selectedGameId));
      setIsLive(false);
      setSelectedGameId('');
      setCommentary('');
      setMinute(0);
    } catch (error) {
      console.error('Failed to end live commentary:', error);
      alert('Failed to end live commentary. Please try again.');
    }
  };

  const selectedGame = games.find((g: any) => g.id === selectedGameId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Game Live Commentary</h2>

      {/* Game Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Game
        </label>
        <select
          value={selectedGameId}
          onChange={e => setSelectedGameId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLive}
        >
          <option value="" disabled>
            Choose a game for live commentary...
          </option>
          {games.map((game: any) => (
            <option key={game.id} value={game.id}>
              {game.homeTeamName} vs {game.awayTeamName} - {game.sport} ({new Date(game.scheduledAt).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {/* Game Info Display */}
      {selectedGame && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">
            {selectedGame.homeTeamName} vs {selectedGame.awayTeamName}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Sport:</span>
              <p className="font-medium">{selectedGame.sport}</p>
            </div>
            <div>
              <span className="text-gray-600">Venue:</span>
              <p className="font-medium">{selectedGame.venue}</p>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <p className="font-medium">{new Date(selectedGame.scheduledAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className={`font-medium ${
                isLive ? 'text-red-600' : 
                selectedGame.status === 'live' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {isLive ? 'LIVE COMMENTARY' : selectedGame.status.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Commentary Controls */}
      <div className="bg-gray-50 rounded-lg p-6">
        {!isLive ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Select a game and start live commentary to begin broadcasting updates
            </p>
            <button
              onClick={startLive}
              disabled={!selectedGameId}
              className={`px-6 py-3 rounded-md font-medium ${
                !selectedGameId
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Start Live Commentary
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Event Type and Minute */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">General Commentary</option>
                  <option value="goal">Goal</option>
                  <option value="card">Card (Yellow/Red)</option>
                  <option value="substitution">Substitution</option>
                  <option value="period">Period Change</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Minute
                </label>
                <input
                  type="number"
                  value={minute}
                  onChange={e => setMinute(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="120"
                />
              </div>
            </div>

            {/* Commentary Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Commentary
              </label>
              <textarea
                value={commentary}
                onChange={e => setCommentary(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter your live commentary here... (e.g., 'Great save by the goalkeeper!' or 'GOAL! Amazing strike from outside the box!')"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={pushEvent}
                disabled={!commentary.trim()}
                className={`flex-1 py-2 px-4 rounded-md font-medium ${
                  !commentary.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Send Update
              </button>
              <button
                onClick={endLive}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                End Commentary
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Events */}
      {activeCommentary && activeCommentary.events.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Recent Commentary Events</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            {activeCommentary.events.slice(-5).reverse().map((event: any) => (
              <div key={event.id} className="mb-3 last:mb-0 p-3 bg-white rounded border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-blue-600">
                    {event.minute}' - {event.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{event.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};