import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers, fetchUniversities, fetchTeams, createPlayerT, savePlayerT, removePlayerT, addPlayerHighlightT, fetchPlayerAvatars, createPlayerAvatarT, savePlayerAvatarT, removePlayerAvatarT } from '@/store/adminThunk';
import { RootState } from '@/store';

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
  const dispatch = useDispatch();
  const { players, universities, teams, playerAvatars, loading } = useSelector((state: RootState) => ({
    players: state.admin.players,
    universities: state.admin.universities,
    teams: state.admin.teams,
    playerAvatars: state.admin.playerAvatars,
    loading: state.admin.loading.players,
  }));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHighlightsModal, setShowHighlightsModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
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
  const [avatarData, setAvatarData] = useState({
    id: '',
    playerId: '',
    base64Image: '',
    fullSizeImage: '',
    threeDAssets: '',
    movementDetails: ''
  });

  useEffect(() => {
    dispatch(fetchPlayers() as any);
    dispatch(fetchUniversities() as any);
    dispatch(fetchTeams() as any);
    dispatch(fetchPlayerAvatars() as any);
  }, [dispatch]);

  const handleCreatePlayer = async () => {
    try {
      await dispatch(createPlayerT(formData) as any);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      alert('Failed to create player: ' + (error as Error).message);
    }
  };

  const handleEditPlayer = async () => {
    if (!selectedPlayer) return;
    try {
      await dispatch(savePlayerT({ id: selectedPlayer.id, data: formData }) as any);
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
        await dispatch(removePlayerT(id) as any);
      } catch (error) {
        alert('Failed to delete player: ' + (error as Error).message);
      }
    }
  };

  const handleUpdateHighlights = async () => {
    if (!selectedPlayer) return;
    try {
      const highlight = {
        season: highlightsData.season,
        age: parseInt(highlightsData.age),
        achievements: highlightsData.achievements.split(',').map(a => a.trim()),
        stats: {
          goals: highlightsData.goals ? parseInt(highlightsData.goals) : undefined,
          assists: highlightsData.assists ? parseInt(highlightsData.assists) : undefined,
          matches: highlightsData.matches ? parseInt(highlightsData.matches) : undefined,
          rating: highlightsData.rating ? parseFloat(highlightsData.rating) : undefined,
        },
        highlights: highlightsData.highlights.split('\n').filter(h => h.trim()),
      };
      await dispatch(addPlayerHighlightT({ playerId: selectedPlayer.id, highlight }) as any);
      setShowHighlightsModal(false);
      setSelectedPlayer(null);
      resetHighlightsForm();
    } catch (error) {
      alert('Failed to update highlights: ' + (error as Error).message);
    }
  };

  const handleCreateAvatar = async () => {
    try {
      await dispatch(createPlayerAvatarT(avatarData) as any);
      setShowAvatarModal(false);
      resetAvatarForm();
    } catch (error) {
      alert('Failed to create avatar: ' + (error as Error).message);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarData.id) return;
    try {
      await dispatch(savePlayerAvatarT({ id: avatarData.id, data: avatarData }) as any);
      setShowAvatarModal(false);
      resetAvatarForm();
    } catch (error) {
      alert('Failed to update avatar: ' + (error as Error).message);
    }
  };

  const handleDeleteAvatar = async (id: string) => {
    if (confirm('Are you sure you want to delete this avatar?')) {
      try {
        await dispatch(removePlayerAvatarT(id) as any);
      } catch (error) {
        alert('Failed to delete avatar: ' + (error as Error).message);
      }
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

  const resetAvatarForm = () => {
    setAvatarData({
      id: '',
      playerId: '',
      base64Image: '',
      fullSizeImage: '',
      threeDAssets: '',
      movementDetails: ''
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

  const openAvatarModal = (player: Player, avatar?: any) => {
    setSelectedPlayer(player);
    if (avatar) {
      setAvatarData(avatar);
    } else {
      setAvatarData({
        id: '',
        playerId: player.id,
        base64Image: '',
        fullSizeImage: '',
        threeDAssets: '',
        movementDetails: ''
      });
    }
    setShowAvatarModal(true);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">University</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Actions</th>
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
                        <div className="text-sm text-gray-500 dark:text-white">#{player.number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{player.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{player.team}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{player.university}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{player.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => openAvatarModal(player, playerAvatars.find(a => a.playerId === player.id))}
                      className="text-green-600 dark:text-white hover:text-green-900 dark:hover:text-green-300"
                    >
                      Avatar
                    </button>
                    <button
                      onClick={() => openHighlightsModal(player)}
                      className="text-purple-600 dark:text-white hover:text-purple-900 dark:hover:text-purple-300"
                    >
                      Highlights
                    </button>
                    <button
                      onClick={() => openEditModal(player)}
                      className="text-blue-600 dark:text-white hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      className="text-red-600 dark:text-white hover:text-red-900 dark:hover:text-red-300"
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
            universities={universities}
            teams={teams}
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
            universities={universities}
            teams={teams}
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

      {/* Avatar Modal */}
      {showAvatarModal && selectedPlayer && (
        <Modal title={`${avatarData.id ? 'Edit' : 'Create'} Avatar - ${selectedPlayer.name}`} onClose={() => { setShowAvatarModal(false); setSelectedPlayer(null); resetAvatarForm(); }}>
          <AvatarForm
            avatarData={avatarData}
            setAvatarData={setAvatarData}
            onSubmit={avatarData.id ? handleUpdateAvatar : handleCreateAvatar}
            onDelete={avatarData.id ? () => handleDeleteAvatar(avatarData.id) : undefined}
            submitLabel={avatarData.id ? 'Update Avatar' : 'Create Avatar'}
          />
        </Modal>
      )}
    </div>
  );
}

// Player Form Component
function PlayerForm({ formData, setFormData, onSubmit, submitLabel, universities, teams }: any) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
          <input
            type="text"
            required
            value={formData.position}
            onChange={(e) => setFormData({...formData, position: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
          <select
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number</label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => setFormData({...formData, number: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height</label>
          <input
            type="text"
            value={formData.height}
            onChange={(e) => setFormData({...formData, height: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight</label>
          <input
            type="text"
            value={formData.weight}
            onChange={(e) => setFormData({...formData, weight: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Team</label>
          <select
            value={formData.team}
            onChange={(e) => setFormData({...formData, team: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Team</option>
            {teams.map((team: any) => (
              <option key={team.id} value={team.name}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">University</label>
          <select
            value={formData.university}
            onChange={(e) => setFormData({...formData, university: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select University</option>
            {universities.map((university: any) => (
              <option key={university.id} value={university.name}>{university.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar</label>
          <input
            type="text"
            value={formData.avatar}
            onChange={(e) => setFormData({...formData, avatar: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Season</label>
          <input
            type="text"
            required
            placeholder="e.g., 2023-2024"
            value={highlightsData.season}
            onChange={(e) => setHighlightsData({...highlightsData, season: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
          <input
            type="number"
            required
            value={highlightsData.age}
            onChange={(e) => setHighlightsData({...highlightsData, age: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Achievements (comma-separated)</label>
        <input
          type="text"
          placeholder="e.g., Top Scorer, Player of the Month"
          value={highlightsData.achievements}
          onChange={(e) => setHighlightsData({...highlightsData, achievements: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goals</label>
          <input
            type="number"
            value={highlightsData.goals}
            onChange={(e) => setHighlightsData({...highlightsData, goals: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assists</label>
          <input
            type="number"
            value={highlightsData.assists}
            onChange={(e) => setHighlightsData({...highlightsData, assists: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Matches</label>
          <input
            type="number"
            value={highlightsData.matches}
            onChange={(e) => setHighlightsData({...highlightsData, matches: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
          <input
            type="number"
            step="0.1"
            value={highlightsData.rating}
            onChange={(e) => setHighlightsData({...highlightsData, rating: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Key Highlights (one per line)</label>
        <textarea
          rows={4}
          placeholder="Enter key highlights, one per line"
          value={highlightsData.highlights}
          onChange={(e) => setHighlightsData({...highlightsData, highlights: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

// Avatar Form Component
function AvatarForm({ avatarData, setAvatarData, onSubmit, onDelete, submitLabel }: any) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base64 Image</label>
        <textarea
          rows={4}
          placeholder="Paste base64 encoded image"
          value={avatarData.base64Image}
          onChange={(e) => setAvatarData({...avatarData, base64Image: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Size Image URL</label>
        <input
          type="text"
          placeholder="URL to full size image"
          value={avatarData.fullSizeImage}
          onChange={(e) => setAvatarData({...avatarData, fullSizeImage: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">3D Assets (JSON)</label>
        <textarea
          rows={4}
          placeholder="JSON data for 3D assets"
          value={avatarData.threeDAssets}
          onChange={(e) => setAvatarData({...avatarData, threeDAssets: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Movement Details (JSON)</label>
        <textarea
          rows={4}
          placeholder="JSON data for Three.js movement details"
          value={avatarData.movementDetails}
          onChange={(e) => setAvatarData({...avatarData, movementDetails: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-between space-x-3 pt-4">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Delete Avatar
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ml-auto"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// Modal Component
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 modal-backdrop backdrop-blur-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
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