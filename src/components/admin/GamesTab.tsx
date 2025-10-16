import { useEffect, useState } from 'react';
import { apiService } from '@/services/apiService';

export default function GamesTab({ live, upcoming, updateScore, startG, endG }: any) {
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGame, setNewGame] = useState({
    sport: 'football',
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    venue: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load matches from Firebase API first
        const matchesData = await apiService.getSchedule();
        if (matchesData && matchesData.length > 0) {
          setMatches(matchesData);
        } else {
          throw new Error('Empty Firebase matches data');
        }

        // Load teams for dropdowns
        const teamsData = await apiService.getTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to load data from Firebase:', error);
        // Fallback to local JSON files
        try {
          const scheduleResponse = await fetch('/data/schedule.json');
          const teamsResponse = await fetch('/data/teams.json');
          if (scheduleResponse.ok) {
            const scheduleData = await scheduleResponse.json();
            setMatches(scheduleData.matches || []);
          }
          if (teamsResponse.ok) {
            const teamsData = await teamsResponse.json();
            setTeams(teamsData.teams || []);
          }
        } catch (localError) {
          console.error('Failed to load local data:', localError);
          setMatches([]);
          setTeams([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddGame = async () => {
    try {
      // This would need to be implemented in the API service
      alert('Add game functionality would be implemented here');
      setNewGame({ sport: 'football', homeTeam: '', awayTeam: '', date: '', time: '', venue: '' });
      setShowAddForm(false);
    } catch (error) {
      alert('Failed to add game: ' + (error as Error).message);
    }
  };

  const toggleLiveStatus = async (gameId: string, isLive: boolean) => {
    try {
      if (isLive) {
        // End the game
        await endG(gameId);
      } else {
        // Start the game
        await startG(gameId);
      }
    } catch (error) {
      alert('Failed to toggle game status: ' + (error as Error).message);
    }
  };

  return (
    <div id="content-games" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Game Schedule</h2><p className="text-gray-600">Update upcoming and live game information.</p></div>
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Add New Game</button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Game</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={newGame.sport}
              onChange={(e) => setNewGame({...newGame, sport: e.target.value})}
              className="px-3 py-2 border rounded"
            >
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="volleyball">Volleyball</option>
              <option value="rugby">Rugby</option>
              <option value="hockey">Hockey</option>
            </select>
            <select
              value={newGame.homeTeam}
              onChange={(e) => setNewGame({...newGame, homeTeam: e.target.value})}
              className="px-3 py-2 border rounded"
            >
              <option value="">Select Home Team</option>
              {teams.map(team => (
                <option key={team.id} value={team.name}>{team.name}</option>
              ))}
            </select>
            <select
              value={newGame.awayTeam}
              onChange={(e) => setNewGame({...newGame, awayTeam: e.target.value})}
              className="px-3 py-2 border rounded"
            >
              <option value="">Select Away Team</option>
              {teams.map(team => (
                <option key={team.id} value={team.name}>{team.name}</option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Date"
              value={newGame.date}
              onChange={(e) => setNewGame({...newGame, date: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="time"
              placeholder="Time"
              value={newGame.time}
              onChange={(e) => setNewGame({...newGame, time: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Venue"
              value={newGame.venue}
              onChange={(e) => setNewGame({...newGame, venue: e.target.value})}
              className="px-3 py-2 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddGame} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Game</button>
            <button onClick={() => setShowAddForm(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6"><h3 className="text-xl font-bold text-gray-900 mb-4">Live Games</h3>
          {live.map((g: any) => (
            <div key={g.id} className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-red-700">{g.homeTeamName} vs {g.awayTeamName}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-red-500 font-bold text-lg">{g.score?.home ?? 0} - {g.score?.away ?? 0}</span>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleLiveStatus(g.id, true)}
                      className="sr-only"
                    />
                    <div className="relative">
                      <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">Live</span>
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-600">Football • {g.minute}'</p>
              <div className="flex justify-end space-x-2 mt-2"><button onClick={() => { const h = prompt('Home score'); const a = prompt('Away score'); if (h !== null && a !== null) updateScore(g.id, +h, +a); }} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700">Update Score</button><button onClick={() => endG(g.id)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-xs hover:bg-gray-300">End Game</button></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6"><h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Games</h3>
          {upcoming.map((g: any) => (
            <div key={g.id} className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-yellow-700">{g.homeTeamName} vs {g.awayTeamName}</p>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleLiveStatus(g.id, false)}
                    className="sr-only"
                  />
                  <div className="relative">
                    <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Not Live</span>
                </label>
              </div>
              <p className="text-sm text-gray-600">{g.sport} • Starts in {Math.round((new Date(g.scheduledAt).getTime() - Date.now()) / 60000)} min</p>
              <div className="flex justify-end space-x-2 mt-2"><button onClick={() => startG(g.id)} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700">Start Game</button><button className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-xs hover:bg-gray-300">Edit</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}