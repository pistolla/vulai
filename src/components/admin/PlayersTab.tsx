import { useEffect, useState } from 'react';

interface Player {
  id: string;
  name: string;
  position: string;
  year: string;
  number: string;
  height: string;
  weight: string;
  team: string;
  university: string;
  avatar: string;
  highlights?: {
    season: string;
    age: number;
    achievements: string[];
    stats: {
      goals?: number;
      assists?: number;
      matches?: number;
      rating?: number;
    };
    highlights: string[];
  }[];
}

interface PlayersTabProps {
  adminData: any;
}

export default function PlayersTab({ adminData }: PlayersTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHighlightsModal, setShowHighlightsModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    year: '',
    number: '',
    height: '',
    weight: '',
    team: '',
    university: '',
    avatar: ''
  });
  const [highlightsData, setHighlightsData] = useState({
    season: '',
    age: '',
    achievements: '',
    goals: '',
    assists: '',
    matches: '',
    rating: '',
    highlights: ''
  });

  // Sample data - in real app this would come from Firebase
  const samplePlayers: Player[] = [
    {
      id: '1',
      name: 'Jake Morrison',
      position: 'Quarterback',
      year: 'Senior',
      number: '12',
      height: '6\'2"',
      weight: '210 lbs',
      team: 'Eagles',
      university: 'University of Nairobi',
      avatar: 'JM'
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      position: 'Running Back',
      year: 'Junior',
      number: '23',
      height: '5\'11"',
      weight: '195 lbs',
      team: 'Titans',
      university: 'Kenyatta University',
      avatar: 'MJ'
    }
  ];

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        // Try Firebase first, fallback to sample data
        setPlayers(samplePlayers);
      } catch (error) {
        console.error('Failed to load players:', error);
        setPlayers(samplePlayers);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  const handleCreatePlayer = async () => {
    try {
      // Firebase API call would go here
      alert('Create player functionality would be implemented here');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      alert('Failed to create player: ' + (error as Error).message);
    }
  };

  const handleEditPlayer = async () => {
    try {
      // Firebase API call would go here
      alert('Update player functionality would be implemented here');
      setShowEditModal(false);
      setSelectedPlayer(null);
      resetForm();
    } catch (error) {
      alert('Failed to update player: ' + (error as Error).message);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      try {
        // Firebase API call would go here
        alert('Delete player functionality would be implemented here');
        setPlayers(players.filter(p => p.id !== id));
      } catch (error) {
        alert('Failed to delete player: ' + (error as Error).message);
      }
    }
  };

  const handleUpdateHighlights = async () => {
    try {
      // Firebase API call would go here
      alert('Update highlights functionality would be implemented here');
      setShowHighlightsModal(false);
      setSelectedPlayer(null);
      resetHighlightsForm();
    } catch (error) {
      alert('Failed to update highlights: ' + (error as Error).message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      year: '',
      number: '',
      height: '',
      weight: '',
      team: '',
      university: '',
      avatar: ''
    });
  };

  const resetHighlightsForm = () => {
    setHighlightsData({
      season: '',
      age: '',
      achievements: '',
      goals: '',
      assists: '',
      matches: '',
      rating: '',
      highlights: ''
    });
  };

  const openEditModal = (player: Player) => {
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
      position: player.position,
      year: player.year,
      number: player.number,
      height: player.height,
      weight: player.weight,
      team: player.team,
      university: player.university,
      avatar: player.avatar
    });
    setShowEditModal(true);
  };

  const openHighlightsModal = (player: Player) => {
    setSelectedPlayer(player);
    setShowHighlightsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="content-players" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Players Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage player information and career highlights.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Player
        </button>
      </div>

      {/* Responsive Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">University</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {players.map((player) => (
                <tr key={player.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{player.avatar}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{player.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">#{player.number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.team}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.university}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => openHighlightsModal(player)}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                    >
                      Highlights
                    </button>
                    <button
                      onClick={() => openEditModal(player)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Player Modal */}
      {showCreateModal && (
        <Modal title="Add New Player" onClose={() => { setShowCreateModal(false); resetForm(); }}>
          <PlayerForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreatePlayer}
            submitLabel="Add Player"
          />
        </Modal>
      )}

      {/* Edit Player Modal */}
      {showEditModal && selectedPlayer && (
        <Modal title="Edit Player" onClose={() => { setShowEditModal(false); setSelectedPlayer(null); resetForm(); }}>
          <PlayerForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditPlayer}
            submitLabel="Update Player"
          />
        </Modal>
      )}

      {/* Highlights Modal */}
      {showHighlightsModal && selectedPlayer && (
        <Modal title={`Update Highlights - ${selectedPlayer.name}`} onClose={() => { setShowHighlightsModal(false); setSelectedPlayer(null); resetHighlightsForm(); }}>
          <HighlightsForm
            highlightsData={highlightsData}
            setHighlightsData={setHighlightsData}
            onSubmit={handleUpdateHighlights}
          />
        </Modal>
      )}
    </div>
  );
}

// Player Form Component
function PlayerForm({ formData, setFormData, onSubmit, submitLabel }: any) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <input
            type="text"
            required
            value={formData.position}
            onChange={(e) => setFormData({...formData, position: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <select
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Number</label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => setFormData({...formData, number: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Height</label>
          <input
            type="text"
            value={formData.height}
            onChange={(e) => setFormData({...formData, height: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Weight</label>
          <input
            type="text"
            value={formData.weight}
            onChange={(e) => setFormData({...formData, weight: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Team</label>
          <input
            type="text"
            value={formData.team}
            onChange={(e) => setFormData({...formData, team: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">University</label>
          <input
            type="text"
            value={formData.university}
            onChange={(e) => setFormData({...formData, university: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Avatar</label>
          <input
            type="text"
            value={formData.avatar}
            onChange={(e) => setFormData({...formData, avatar: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// Highlights Form Component
function HighlightsForm({ highlightsData, setHighlightsData, onSubmit }: any) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Season</label>
          <input
            type="text"
            required
            placeholder="e.g., 2023-2024"
            value={highlightsData.season}
            onChange={(e) => setHighlightsData({...highlightsData, season: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            required
            value={highlightsData.age}
            onChange={(e) => setHighlightsData({...highlightsData, age: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Achievements (comma-separated)</label>
        <input
          type="text"
          placeholder="e.g., Top Scorer, Player of the Month"
          value={highlightsData.achievements}
          onChange={(e) => setHighlightsData({...highlightsData, achievements: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Goals</label>
          <input
            type="number"
            value={highlightsData.goals}
            onChange={(e) => setHighlightsData({...highlightsData, goals: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Assists</label>
          <input
            type="number"
            value={highlightsData.assists}
            onChange={(e) => setHighlightsData({...highlightsData, assists: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Matches</label>
          <input
            type="number"
            value={highlightsData.matches}
            onChange={(e) => setHighlightsData({...highlightsData, matches: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rating</label>
          <input
            type="number"
            step="0.1"
            value={highlightsData.rating}
            onChange={(e) => setHighlightsData({...highlightsData, rating: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Key Highlights (one per line)</label>
        <textarea
          rows={4}
          placeholder="Enter key highlights, one per line"
          value={highlightsData.highlights}
          onChange={(e) => setHighlightsData({...highlightsData, highlights: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Update Highlights
        </button>
      </div>
    </form>
  );
}

// Modal Component
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 modal-backdrop">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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