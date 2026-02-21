import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/hooks/redux';
import { fetchPlayers, fetchUniversities, fetchTeams, createPlayerT, savePlayerT, removePlayerT, addPlayerHighlightT, fetchPlayerAvatars, createPlayerAvatarT, savePlayerAvatarT, removePlayerAvatarT } from '@/store/adminThunk';
import { RootState } from '@/store';
import { Player, PlayerSocial } from '@/types';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/common/ToastProvider';
import { FiUserPlus, FiEdit2, FiTrash2, FiStar, FiImage, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { confirmDelete } from '@/utils/confirmDialog';

// Input Wrapper Component for enhanced styling and error states
const InputWrapper = ({ children, error, label, labelExtra }: { children: React.ReactNode; error?: string; label: string; labelExtra?: string }) => (
  <div className={`relative ${error ? 'mb-6' : 'mb-4'}`}>
    <div className="flex items-baseline justify-between mb-2">
      <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      {labelExtra && (
        <span className="text-[10px] text-gray-400 font-medium italic">{labelExtra}</span>
      )}
    </div>
    {children}
    {error && (
      <div className="flex items-center gap-1 mt-2 text-red-500 dark:text-red-400 text-xs animate-in slide-in-from-top-1">
        <FiAlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

interface PlayerFormData {
  name: string;
  position: string;
  year: string;
  number: string;
  height: string;
  weight: string;
  universityId: string;
  sportId: string;
  teamId: string; // Reference to root 'players' collection
  avatar: string;
  bodyFat: number;
  status: string;
  injuryNote: string;
  joinedAt: string;
  kitNumber: number;
  bio: string;
  socialLinks: { instagram: string; twitter: string };
  social: PlayerSocial;
  stats: { gamesPlayed: number; points: number };
}

interface PlayersTabProps {
  adminData: any;
}

export default function PlayersTab({ adminData }: PlayersTabProps) {
  const dispatch = useAppDispatch();
  const { players, universities, teams, playerAvatars, loading } = useSelector((state: RootState) => ({
    players: state.admin.players,
    universities: state.admin.universities,
    teams: state.admin.teams,
    playerAvatars: state.admin.playerAvatars,
    loading: state.admin.loading.players,
  }));
  const { success, error: showError, warning } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHighlightsModal, setShowHighlightsModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    position: '',
    year: '',
    number: '',
    height: '',
    weight: '',
    universityId: '',
    sportId: '',
    teamId: '', // Players stored in root 'players' collection with team reference
    avatar: '',
    bodyFat: 0,
    status: 'active',
    injuryNote: '',
    joinedAt: '',
    kitNumber: 0,
    bio: '',
    socialLinks: { instagram: '', twitter: '' },
    social: { level: 0, xp: 0, nextLevelXp: 0, followers: 0, following: 0, badges: [] },
    stats: { gamesPlayed: 0, points: 0 }
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
    dispatch(fetchPlayers());
    dispatch(fetchUniversities());
    dispatch(fetchTeams());
    dispatch(fetchPlayerAvatars());
  }, [dispatch]);

  const handleCreatePlayer = async () => {
    try {
      await dispatch(createPlayerT(formData));
      dispatch(fetchPlayers());
      setShowCreateModal(false);
      resetForm();
      success('Player created successfully', `${formData.name} has been added to the roster`, 'Add another player or manage existing ones');
    } catch (error) {
      showError('Failed to create player', (error as Error).message);
    }
  };

  const handleEditPlayer = async () => {
    if (!selectedPlayer) return;
    try {
      await dispatch(savePlayerT({ id: selectedPlayer.id, data: formData }));
      dispatch(fetchPlayers());
      setShowEditModal(false);
      setSelectedPlayer(null);
      resetForm();
      success('Player updated successfully', `${formData.name}'s information has been updated`, 'View player profile or continue managing');
    } catch (error) {
      showError('Failed to update player', (error as Error).message);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    const player = players.find((p: any) => p.id === id);
    const confirmed = await confirmDelete(`Are you sure you want to delete ${player?.name || 'this player'}?`);
    if (confirmed) {
      try {
        await dispatch(removePlayerT(id));
        dispatch(fetchPlayers());
        success('Player deleted', 'The player has been removed from the roster', 'Add a new player if needed');
      } catch (error) {
        showError('Failed to delete player', (error as Error).message);
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
      await dispatch(addPlayerHighlightT({ playerId: selectedPlayer.id, highlight }));
      setShowHighlightsModal(false);
      setSelectedPlayer(null);
      resetHighlightsForm();
      success('Highlights updated', `${selectedPlayer.name}'s career highlights have been saved`, 'View player stats or add more');
    } catch (error) {
      showError('Failed to update highlights', (error as Error).message);
    }
  };

  const handleCreateAvatar = async () => {
    try {
      await dispatch(createPlayerAvatarT(avatarData));
      setShowAvatarModal(false);
      resetAvatarForm();
      success('Avatar created', 'Player avatar has been generated', 'View avatar or create another');
    } catch (error) {
      showError('Failed to create avatar', (error as Error).message);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarData.id) return;
    try {
      await dispatch(savePlayerAvatarT({ id: avatarData.id, data: avatarData }));
      setShowAvatarModal(false);
      resetAvatarForm();
      success('Avatar updated', 'Player avatar changes have been saved', 'View avatar or continue editing');
    } catch (error) {
      showError('Failed to update avatar', (error as Error).message);
    }
  };

  const handleDeleteAvatar = async (id: string) => {
    const confirmed = await confirmDelete('Are you sure you want to delete this avatar?');
    if (confirmed) {
      try {
        await dispatch(removePlayerAvatarT(id));
        success('Avatar deleted', 'The avatar has been removed', 'Create a new avatar if needed');
      } catch (error) {
        showError('Failed to delete avatar', (error as Error).message);
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
      universityId: '',
      sportId: '',
      teamId: '',
      avatar: '',
      bodyFat: 0,
      status: 'active',
      injuryNote: '',
      joinedAt: '',
      kitNumber: 0,
      bio: '',
      socialLinks: { instagram: '', twitter: '' },
      social: { level: 0, xp: 0, nextLevelXp: 0, followers: 0, following: 0, badges: [] },
      stats: { gamesPlayed: 0, points: 0 }
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
      number: player.number.toString(),
      height: player.height,
      weight: player.weight,
      universityId: player.universityId,
      sportId: player.sportId,
      teamId: player.teamId || '',
      avatar: player.avatar,
      bodyFat: player.bodyFat || 0,
      status: player.status || 'active',
      injuryNote: player.injuryNote || '',
      joinedAt: player.joinedAt || '',
      kitNumber: player.kitNumber || 0,
      bio: player.bio || '',
      socialLinks: player.socialLinks || { instagram: '', twitter: '' },
      social: player.social || { level: 0, xp: 0, nextLevelXp: 0, followers: 0, following: 0, badges: [] },
      stats: player.stats || { gamesPlayed: 0, points: 0 }
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-6 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
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
              {players.map((player: any) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">
                    {teams.find((t: any) => t.id === player.teamId)?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{player.university}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{player.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => openAvatarModal(player, playerAvatars.find((a: any) => a.playerId === player.id))}
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
      <Modal isOpen={showCreateModal} title="Add New Player" onClose={() => { setShowCreateModal(false); resetForm(); }} fullScreen={true}>
        <PlayerForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreatePlayer}
          submitLabel="Add Player"
          universities={universities}
          teams={teams}
        />
      </Modal>

      {/* Edit Player Modal */}
      <Modal isOpen={showEditModal && !!selectedPlayer} title="Edit Player" onClose={() => { setShowEditModal(false); setSelectedPlayer(null); resetForm(); }} fullScreen={true}>
        <PlayerForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditPlayer}
          submitLabel="Update Player"
          universities={universities}
          teams={teams}
        />
      </Modal>

      {/* Highlights Modal */}
      <Modal isOpen={showHighlightsModal && !!selectedPlayer} title={selectedPlayer ? `Update Highlights - ${selectedPlayer.name}` : "Update Highlights"} onClose={() => { setShowHighlightsModal(false); setSelectedPlayer(null); resetHighlightsForm(); }} fullScreen={true}>
        <HighlightsForm
          highlightsData={highlightsData}
          setHighlightsData={setHighlightsData}
          onSubmit={handleUpdateHighlights}
        />
      </Modal>

      {/* Avatar Modal */}
      <Modal isOpen={showAvatarModal && !!selectedPlayer} title={selectedPlayer ? `${avatarData.id ? 'Edit' : 'Create'} Avatar - ${selectedPlayer.name}` : "Avatar Management"} onClose={() => { setShowAvatarModal(false); setSelectedPlayer(null); resetAvatarForm(); }} fullScreen={true}>
        <AvatarForm
          avatarData={avatarData}
          setAvatarData={setAvatarData}
          onSubmit={avatarData.id ? handleUpdateAvatar : handleCreateAvatar}
          onDelete={avatarData.id ? () => handleDeleteAvatar(avatarData.id) : undefined}
          submitLabel={avatarData.id ? 'Update Avatar' : 'Create Avatar'}
        />
      </Modal>
    </div>
  );
}

// Player Form Component
function PlayerForm({ formData, setFormData, onSubmit, submitLabel, universities, teams }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputWrapper label="Name">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
            placeholder="e.g. John Doe"
          />
        </InputWrapper>

        <InputWrapper label="Position">
          <input
            type="text"
            required
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
            placeholder="e.g. Quarterback"
          />
        </InputWrapper>

        <InputWrapper label="Year">
          <select
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none transition-all"
          >
            <option value="">Select Year</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
          </select>
        </InputWrapper>

        <InputWrapper label="Number">
          <input
            type="text"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
            placeholder="e.g. 10"
          />
        </InputWrapper>

        <InputWrapper label="Height">
          <input
            type="text"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
            placeholder="e.g. 6'2\"
          />
        </InputWrapper>

        <InputWrapper label="Weight">
          <input
            type="text"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
            placeholder="e.g. 210 lbs"
          />
        </InputWrapper>

        <InputWrapper label="Sport">
          <select
            value={formData.sportId}
            onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none transition-all"
          >
            <option value="">Select Sport</option>
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
          </select>
        </InputWrapper>

        <InputWrapper label="University">
          <select
            value={formData.universityId}
            onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none transition-all"
          >
            <option value="">Select University</option>
            {universities.map((university: any) => (
              <option key={university.id} value={university.id}>{university.name}</option>
            ))}
          </select>
        </InputWrapper>

        <InputWrapper label="Team">
          <select
            value={formData.teamId}
            onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none transition-all"
          >
            <option value="">Select Team</option>
            {teams.map((team: any) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </InputWrapper>

        <InputWrapper label="Avatar (Initials)">
          <input
            type="text"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
            placeholder="e.g. JD"
          />
        </InputWrapper>

        <InputWrapper label="Body Fat (%)">
          <input
            type="number"
            step="0.1"
            value={formData.bodyFat || ''}
            onChange={(e) => setFormData({ ...formData, bodyFat: +e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold transition-all"
          />
        </InputWrapper>

        <InputWrapper label="Status">
          <select
            value={formData.status || 'active'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none transition-all"
          >
            <option value="active">Active</option>
            <option value="injured">Injured</option>
            <option value="suspended">Suspended</option>
          </select>
        </InputWrapper>

        <div className="col-span-2">
          <InputWrapper label="Bio">
            <textarea
              rows={3}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
              placeholder="Player biography..."
            />
          </InputWrapper>
        </div>
      </div>

      <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiCheckCircle className="w-5 h-5" />
          )}
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}

// Highlights Form Component
function HighlightsForm({ highlightsData, setHighlightsData, onSubmit }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputWrapper label="Season">
          <input
            type="text"
            required
            placeholder="e.g., 2023-2024"
            value={highlightsData.season}
            onChange={(e) => setHighlightsData({ ...highlightsData, season: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
          />
        </InputWrapper>
        <InputWrapper label="Age">
          <input
            type="number"
            required
            value={highlightsData.age}
            onChange={(e) => setHighlightsData({ ...highlightsData, age: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-gray-900 dark:text-white font-bold transition-all"
          />
        </InputWrapper>
      </div>

      <InputWrapper label="Achievements (comma-separated)">
        <input
          type="text"
          placeholder="e.g., Top Scorer, Player of the Month"
          value={highlightsData.achievements}
          onChange={(e) => setHighlightsData({ ...highlightsData, achievements: e.target.value })}
          className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
        />
      </InputWrapper>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InputWrapper label="Goals">
          <input
            type="number"
            value={highlightsData.goals}
            onChange={(e) => setHighlightsData({ ...highlightsData, goals: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-gray-900 dark:text-white font-bold transition-all"
          />
        </InputWrapper>
        <InputWrapper label="Assists">
          <input
            type="number"
            value={highlightsData.assists}
            onChange={(e) => setHighlightsData({ ...highlightsData, assists: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-gray-900 dark:text-white font-bold transition-all"
          />
        </InputWrapper>
        <InputWrapper label="Matches">
          <input
            type="number"
            value={highlightsData.matches}
            onChange={(e) => setHighlightsData({ ...highlightsData, matches: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-gray-900 dark:text-white font-bold transition-all"
          />
        </InputWrapper>
        <InputWrapper label="Rating">
          <input
            type="number"
            step="0.1"
            value={highlightsData.rating}
            onChange={(e) => setHighlightsData({ ...highlightsData, rating: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-gray-900 dark:text-white font-bold transition-all"
          />
        </InputWrapper>
      </div>

      <InputWrapper label="Key Highlights (one per line)">
        <textarea
          rows={4}
          placeholder="Enter key highlights, one per line"
          value={highlightsData.highlights}
          onChange={(e) => setHighlightsData({ ...highlightsData, highlights: e.target.value })}
          className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
        />
      </InputWrapper>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-lg shadow-purple-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiCheckCircle className="w-5 h-5" />
          )}
          <span>Update Highlights</span>
        </button>
      </div>
    </form>
  );
}

// Avatar Form Component
function AvatarForm({ avatarData, setAvatarData, onSubmit, onDelete, submitLabel }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputWrapper label="Base64 Image">
        <textarea
          rows={4}
          placeholder="Paste base64 encoded image"
          value={avatarData.base64Image}
          onChange={(e) => setAvatarData({ ...avatarData, base64Image: e.target.value })}
          className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
        />
      </InputWrapper>

      <InputWrapper label="Full Size Image URL">
        <input
          type="text"
          placeholder="URL to full size image"
          value={avatarData.fullSizeImage}
          onChange={(e) => setAvatarData({ ...avatarData, fullSizeImage: e.target.value })}
          className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
        />
      </InputWrapper>

      <InputWrapper label="3D Assets (JSON)">
        <textarea
          rows={4}
          placeholder="JSON data for 3D assets"
          value={avatarData.threeDAssets}
          onChange={(e) => setAvatarData({ ...avatarData, threeDAssets: e.target.value })}
          className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
        />
      </InputWrapper>

      <InputWrapper label="Movement Details (JSON)">
        <textarea
          rows={4}
          placeholder="JSON data for Three.js movement details"
          value={avatarData.movementDetails}
          onChange={(e) => setAvatarData({ ...avatarData, movementDetails: e.target.value })}
          className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
        />
      </InputWrapper>

      <div className="flex justify-between space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-6 py-4 text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
          >
            Delete Avatar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiCheckCircle className="w-5 h-5" />
          )}
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}

