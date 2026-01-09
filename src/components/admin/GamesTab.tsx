import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { apiService } from '@/services/apiService';
import { db } from '@/services/firebase';
import { addDoc, collection, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import ExportButtons from './ExportButtons';

// Modal Component
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-50 dark:bg-opacity-70">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-700 dark:hover:text-gray-100">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Game Form Component
function GameForm({ formData, setFormData, teams, onSubmit, submitLabel }: any) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Sport</label>
          <select
            value={formData.sport}
            onChange={(e) => setFormData({...formData, sport: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="volleyball">Volleyball</option>
            <option value="rugby">Rugby</option>
            <option value="hockey">Hockey</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Home Team</label>
          <input
            type="text"
            required
            value={formData.homeTeam}
            onChange={(e) => setFormData({...formData, homeTeam: e.target.value})}
            list="teams-list"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Type or select home team"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Away Team</label>
          <input
            type="text"
            required
            value={formData.awayTeam}
            onChange={(e) => setFormData({...formData, awayTeam: e.target.value})}
            list="teams-list"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Type or select away team"
          />
        </div>
        <datalist id="teams-list">
          {teams.map((team: any) => (
            <option key={team.id} value={team.name} />
          ))}
        </datalist>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Date</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Time</label>
          <input
            type="time"
            required
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Venue</label>
          <input
            type="text"
            required
            value={formData.venue}
            onChange={(e) => setFormData({...formData, venue: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      {formData.homeTeam && formData.awayTeam && formData.date && formData.time && formData.venue && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Game Preview</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>{formData.homeTeam}</strong> vs <strong>{formData.awayTeam}</strong><br />
            {formData.sport} • {new Date(formData.date).toLocaleDateString()} at {formData.time}<br />
            Venue: {formData.venue}
          </p>
        </div>
      )}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function ShimmerGameCard() {
  return (
    <div className="p-4 rounded-lg bg-gray-50 border-l-4 border-gray-300 mb-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-5 bg-gray-200 rounded w-48"></div>
        <div className="flex items-center space-x-2">
          <div className="h-6 bg-gray-200 rounded w-12"></div>
          <div className="w-10 h-6 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="flex justify-end space-x-2">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  );
}

export default function GamesTab({ live, upcoming, updateScore, startG, endG }: any) {
  const { loading: reduxLoading } = useAppSelector(s => s.admin);
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;
  const [sportFilter, setSportFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newGame, setNewGame] = useState({
    sport: 'football',
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    venue: ''
  });

  const resetNewGame = () => {
    setNewGame({
      sport: 'football',
      homeTeam: '',
      awayTeam: '',
      date: '',
      time: '',
      venue: ''
    });
  };

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
    if (!newGame.homeTeam || !newGame.awayTeam) {
      alert('Please select both home and away teams');
      return;
    }
    if (newGame.homeTeam === newGame.awayTeam) {
      alert('Home and away teams cannot be the same');
      return;
    }
    try {
      const gameData = {
        ...newGame,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        scheduledAt: `${newGame.date}T${newGame.time}:00`
      };
      await addDoc(collection(db, 'games'), gameData);
      alert('Game added successfully');
      resetNewGame();
      setShowAddModal(false);
      // Reload matches
      const matchesData = await apiService.getSchedule();
      setMatches(matchesData || []);
    } catch (error) {
      alert('Failed to add game: ' + (error as Error).message);
    }
  };

  const handleEditGame = async () => {
    if (!editingGame.homeTeam || !editingGame.awayTeam) {
      alert('Please select both home and away teams');
      return;
    }
    if (editingGame.homeTeam === editingGame.awayTeam) {
      alert('Home and away teams cannot be the same');
      return;
    }
    try {
      const gameData = {
        ...editingGame,
        scheduledAt: `${editingGame.date}T${editingGame.time}:00`
      };
      await updateDoc(doc(db, 'games', editingGame.id), gameData);
      alert('Game updated successfully');
      setShowEditModal(false);
      setEditingGame(null);
      // Reload matches
      const matchesData = await apiService.getSchedule();
      setMatches(matchesData || []);
    } catch (error) {
      alert('Failed to update game: ' + (error as Error).message);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    try {
      await deleteDoc(doc(db, 'games', gameId));
      alert('Game deleted successfully');
      // Reload matches
      const matchesData = await apiService.getSchedule();
      setMatches(matchesData || []);
    } catch (error) {
      alert('Failed to delete game: ' + (error as Error).message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGames.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedGames.size} games?`)) return;
    try {
      const deletePromises = Array.from(selectedGames).map(id => deleteDoc(doc(db, 'games', id)));
      await Promise.all(deletePromises);
      alert('Games deleted successfully');
      setSelectedGames(new Set());
      // Reload matches
      const matchesData = await apiService.getSchedule();
      setMatches(matchesData || []);
    } catch (error) {
      alert('Failed to delete games: ' + (error as Error).message);
    }
  };

  const handleBulkStart = async () => {
    if (selectedGames.size === 0) return;
    try {
      const startPromises = Array.from(selectedGames).map(id => startG(id));
      await Promise.all(startPromises);
      alert('Games started successfully');
      setSelectedGames(new Set());
    } catch (error) {
      alert('Failed to start games: ' + (error as Error).message);
    }
  };

  const toggleGameSelection = (gameId: string) => {
    const newSelected = new Set(selectedGames);
    if (newSelected.has(gameId)) {
      newSelected.delete(gameId);
    } else {
      newSelected.add(gameId);
    }
    setSelectedGames(newSelected);
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  // Filter games based on search and filters
  const filteredLive = live.filter((game: any) =>
    ((game.homeTeamName || game.homeTeam || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (game.awayTeamName || game.awayTeam || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (game.sport || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!sportFilter || game.sport === sportFilter) &&
    (!statusFilter || game.status === statusFilter)
  );
  const filteredUpcoming = upcoming.filter((game: any) =>
    ((game.homeTeamName || game.homeTeam || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (game.awayTeamName || game.awayTeam || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (game.sport || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!sportFilter || game.sport === sportFilter) &&
    (!statusFilter || game.status === statusFilter)
  );

  const hasLiveGames = filteredLive.length > 0;
  const hasUpcomingGames = filteredUpcoming.length > 0;
  const isLoading = reduxLoading.games;

  // Pagination for upcoming games
  const totalPages = Math.ceil(filteredUpcoming.length / gamesPerPage);
  const paginatedUpcoming = filteredUpcoming.slice((currentPage - 1) * gamesPerPage, currentPage * gamesPerPage);

  // Export data
  const allGames = [...filteredLive, ...filteredUpcoming];
  const exportData = allGames.map((game: any) => ({
    homeTeam: game.homeTeamName || game.homeTeam,
    awayTeam: game.awayTeamName || game.awayTeam,
    sport: game.sport,
    status: game.status || 'upcoming',
    score: game.score ? `${game.score.home} - ${game.score.away}` : 'N/A',
    homeGoals: game.stats?.homeGoals ?? 'N/A',
    awayGoals: game.stats?.awayGoals ?? 'N/A',
    homeAssists: game.stats?.homeAssists ?? 'N/A',
    awayAssists: game.stats?.awayAssists ?? 'N/A',
    homePossession: game.stats?.possession?.home ?? 'N/A',
    awayPossession: game.stats?.possession?.away ?? 'N/A',
    homeShots: game.stats?.shots?.home ?? 'N/A',
    awayShots: game.stats?.shots?.away ?? 'N/A',
    venue: game.venue || 'TBD'
  }));
  const exportHeaders = ['homeTeam', 'awayTeam', 'sport', 'status', 'score', 'homeGoals', 'awayGoals', 'homeAssists', 'awayAssists', 'homePossession', 'awayPossession', 'homeShots', 'awayShots', 'venue'];

  return (
    <div id="content-games" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Game Schedule</h2><p className="text-gray-600 dark:text-gray-400">Update upcoming and live game information.</p></div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Sports</option>
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="volleyball">Volleyball</option>
            <option value="rugby">Rugby</option>
            <option value="hockey">Hockey</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="live">Live</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
          {selectedGames.size > 0 && (
            <div className="flex space-x-2">
              <button onClick={handleBulkStart} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm">Start Selected ({selectedGames.size})</button>
              <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm">Delete Selected ({selectedGames.size})</button>
            </div>
          )}
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Add New Game</button>
        </div>
      </div>

      {/* Add Game Modal */}
      {showAddModal && (
        <Modal title="Add New Game" onClose={() => { setShowAddModal(false); resetNewGame(); }}>
          <GameForm
            formData={newGame}
            setFormData={setNewGame}
            teams={teams}
            onSubmit={handleAddGame}
            submitLabel="Add Game"
          />
        </Modal>
      )}

      {/* Edit Game Modal */}
      {showEditModal && editingGame && (
        <Modal title="Edit Game" onClose={() => { setShowEditModal(false); setEditingGame(null); }}>
          <GameForm
            formData={editingGame}
            setFormData={setEditingGame}
            teams={teams}
            onSubmit={handleEditGame}
            submitLabel="Update Game"
          />
        </Modal>
      )}
      {allGames.length > 0 && <ExportButtons data={exportData} headers={exportHeaders} filename="games" />}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Live Games</h3>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : hasLiveGames ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Select</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teams</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sport</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Goals</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assists</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Possession</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Shots</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLive.map((g: any) => (
                    <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedGames.has(g.id)}
                          onChange={() => toggleGameSelection(g.id)}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{g.homeTeamName || g.homeTeam} vs {g.awayTeamName || g.awayTeam}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.sport}</td>
                      <td className="px-4 py-2 text-sm text-red-600 dark:text-red-400 font-bold">{g.score?.home ?? 0} - {g.score?.away ?? 0}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.stats?.homeGoals ?? 0} - {g.stats?.awayGoals ?? 0}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.stats?.homeAssists ?? 0} - {g.stats?.awayAssists ?? 0}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.stats?.possession?.home ?? 0}% - {g.stats?.possession?.away ?? 0}%</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.stats?.shots?.home ?? 0} - {g.stats?.shots?.away ?? 0}</td>
                      <td className="px-4 py-2 text-sm space-x-2">
                        <button onClick={() => { const h = prompt('Home score'); const a = prompt('Away score'); if (h !== null && a !== null) updateScore(g.id, +h, +a); }} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">Update Score</button>
                        <button onClick={() => endG(g.id)} className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700">End Game</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">No live games</p>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Games</h3>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : hasUpcomingGames ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Select</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teams</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sport</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Venue</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedUpcoming.map((g: any) => (
                    <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedGames.has(g.id)}
                          onChange={() => toggleGameSelection(g.id)}
                          className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{g.homeTeamName || g.homeTeam} vs {g.awayTeamName || g.awayTeam}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.sport}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{new Date(g.scheduledAt).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.venue}</td>
                      <td className="px-4 py-2 text-sm space-x-2">
                        <button onClick={() => startG(g.id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">Start</button>
                        <button onClick={() => { setEditingGame({ ...g, date: g.scheduledAt.split('T')[0], time: g.scheduledAt.split('T')[1].substring(0, 5) }); setShowEditModal(true); }} className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">Edit</button>
                        <button onClick={() => handleDeleteGame(g.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">No upcoming games</p>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}