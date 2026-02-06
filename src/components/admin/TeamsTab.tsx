import { useEffect, useState } from 'react';
import { apiService } from '@/services/apiService';
import Pagination from './Pagination';
import ExportButtons from './ExportButtons';
import { University, League } from '@/models';
import { firebaseLeagueService } from '@/services/firebaseCorrespondence';
import { useToast } from '@/components/common/ToastProvider';
import { Modal } from '@/components/common/Modal';
import { useAppSelector } from '@/hooks/redux';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiAward, FiCalendar, FiCheckCircle, FiAlertCircle, FiUploadCloud } from 'react-icons/fi';

// Team Form Component with Validation
function TeamForm({ formData, setFormData, onSubmit, submitLabel, user, onCancel }: any) {
  const [universities, setUniversities] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [filteredLeagues, setFilteredLeagues] = useState<League[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { warning } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [uniData, sportData, leagueData] = await Promise.all([
          apiService.getUniversities(),
          apiService.getSports(),
          firebaseLeagueService.listLeagues()
        ]);
        setUniversities(uniData);
        setSports(sportData);
        setLeagues(leagueData);
      } catch (error) {
        console.error('Failed to load form data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (formData.sport) {
      const selectedSport = formData.sport.toLowerCase();
      const filtered = leagues.filter(l =>
        (l.sportName?.toLowerCase() === selectedSport) ||
        (l.sportType?.toLowerCase() === selectedSport)
      );
      setFilteredLeagues(filtered);
    } else {
      setFilteredLeagues([]);
    }
  }, [formData.sport, leagues]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, logoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Team name is required';
        if (value.trim().length < 3) return 'Team name must be at least 3 characters';
        return '';
      case 'sport':
        if (!value) return 'Please select a sport';
        return '';
      case 'universityId':
        return ''; // Optional for some cases
      case 'coach':
        if (value && value.trim().length < 3) return 'Coach name must be at least 3 characters';
        return '';
      case 'foundedYear':
        if (value && (isNaN(parseInt(value)) || parseInt(value) < 1900 || parseInt(value) > new Date().getFullYear())) {
          return 'Please enter a valid year';
        }
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const isCorrespondent = user?.role === 'correspondent';

  useEffect(() => {
    if (isCorrespondent && user?.universityId) {
      setFormData((prev: any) => ({ ...prev, universityId: user.universityId }));
    }
  }, [isCorrespondent, user?.universityId, setFormData]);

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    newErrors.name = validateField('name', formData.name);
    newErrors.sport = validateField('sport', formData.sport);
    newErrors.universityId = validateField('universityId', formData.universityId);
    newErrors.coach = validateField('coach', formData.coach);
    newErrors.foundedYear = validateField('foundedYear', formData.foundedYear);
    setErrors(newErrors);
    setTouched({
      name: true,
      sport: true,
      universityId: true,
      coach: true,
      foundedYear: true
    });
    return !Object.values(newErrors).some(e => e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      warning('Please fix the errors', 'Check the highlighted fields below');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputWrapper = ({ children, error, label }: { children: React.ReactNode; error?: string; label: string }) => (
    <div className={`relative ${error ? 'mb-6' : 'mb-4'}`}>
      <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 mt-2 text-red-500 dark:text-red-400 text-xs animate-in slide-in-from-top-1">
          <FiAlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputWrapper label="Team Name" error={errors.name}>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 transition-all ${
                errors.name 
                  ? 'border-red-300 dark:border-red-600 focus:ring-4 focus:ring-red-500/20' 
                  : 'border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
              } text-gray-900 dark:text-white font-bold placeholder-gray-400`}
              placeholder="e.g. Eagles FC"
              autoFocus
            />
            {formData.name && !errors.name && (
              <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
        </InputWrapper>

        <InputWrapper label="Sport" error={errors.sport}>
          <div className="relative">
            <select
              value={formData.sport}
              onChange={(e) => handleChange('sport', e.target.value)}
              onBlur={() => handleBlur('sport')}
              className={`w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 transition-all appearance-none ${
                errors.sport
                  ? 'border-red-300 dark:border-red-600 focus:ring-4 focus:ring-red-500/20'
                  : 'border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
              } text-gray-900 dark:text-white font-bold`}
            >
              <option value="">Select Sport</option>
              {sports.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            {formData.sport && !errors.sport && (
              <FiCheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
        </InputWrapper>

        <InputWrapper label="University" error={errors.universityId}>
          <div className="relative">
            <select
              value={formData.universityId}
              onChange={(e) => handleChange('universityId', e.target.value)}
              onBlur={() => handleBlur('universityId')}
              className={`w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 transition-all appearance-none ${
                errors.universityId
                  ? 'border-red-300 dark:border-red-600 focus:ring-4 focus:ring-red-500/20'
                  : 'border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
              } text-gray-900 dark:text-white font-bold ${isCorrespondent ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isCorrespondent}
            >
              <option value="">Select University</option>
              {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            {formData.universityId && !errors.universityId && (
              <FiCheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
        </InputWrapper>

        <InputWrapper label="Coach" error={errors.coach}>
          <input
            type="text"
            value={formData.coach}
            onChange={(e) => handleChange('coach', e.target.value)}
            onBlur={() => handleBlur('coach')}
            className={`w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 transition-all ${
              errors.coach
                ? 'border-red-300 dark:border-red-600 focus:ring-4 focus:ring-red-500/20'
                : 'border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
            } text-gray-900 dark:text-white font-bold placeholder-gray-400`}
            placeholder="e.g. John Smith"
          />
        </InputWrapper>

        <InputWrapper label="Founded Year" error={errors.foundedYear}>
          <input
            type="number"
            value={formData.foundedYear}
            onChange={(e) => handleChange('foundedYear', e.target.value)}
            onBlur={() => handleBlur('foundedYear')}
            className={`w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 transition-all ${
              errors.foundedYear
                ? 'border-red-300 dark:border-red-600 focus:ring-4 focus:ring-red-500/20'
                : 'border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
            } text-gray-900 dark:text-white font-bold placeholder-gray-400`}
            placeholder="e.g. 2020"
          />
        </InputWrapper>

        <InputWrapper label="League">
          <div className="relative">
            <select
              value={formData.league}
              onChange={(e) => setFormData({ ...formData, league: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none"
              disabled={!formData.sport}
            >
              <option value="">Select League</option>
              {filteredLeagues.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>
            {!formData.sport && (
              <div className="flex items-center gap-1 mt-2 text-amber-500 dark:text-amber-400 text-xs">
                <FiAlertCircle className="w-3 h-3" />
                <span>Select a sport first</span>
              </div>
            )}
          </div>
        </InputWrapper>

        <InputWrapper label="Record">
          <input
            type="text"
            value={formData.record}
            onChange={(e) => setFormData({ ...formData, record: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400"
            placeholder="e.g. 11-0-1"
          />
        </InputWrapper>

        <InputWrapper label="Championships">
          <input
            type="text"
            value={formData.championships}
            onChange={(e) => setFormData({ ...formData, championships: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400"
            placeholder="e.g. Count or list"
          />
        </InputWrapper>

        <InputWrapper label="Season">
          <input
            type="text"
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400"
            placeholder="e.g. 2024/25"
          />
        </InputWrapper>

        <div className="col-span-2">
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Team Logo</label>
          <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            formData.logoURL 
              ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
          }`}>
            {formData.logoURL ? (
              <div className="flex items-center justify-center gap-4">
                <img src={formData.logoURL} alt="Logo preview" className="w-20 h-20 object-cover rounded-xl shadow-lg" />
                <div>
                  <p className="text-green-600 dark:text-green-400 font-bold text-sm">Logo uploaded</p>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoURL: '' })}
                    className="text-red-500 hover:text-red-700 text-xs font-medium mt-1"
                  >
                    Remove logo
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <FiUploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Click to upload team logo</p>
                  <p className="text-gray-400 text-sm mt-1">PNG, JPG up to 2MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiCheckCircle className="w-5 h-5" />
              <span>{submitLabel}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function TeamsTab({ adminData, create, update, deleteU, addPlayer, updatePlayer, deletePlayer }: any) {
  const user = useAppSelector(state => state.auth.user);
  const teams = useAppSelector(state => state.admin.teams);
  const universities = useAppSelector(state => state.admin.universities);
  const { success, error: showError, warning } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newTeam, setNewTeam] = useState({
    name: '',
    sport: '',
    universityId: '',
    coach: '',
    foundedYear: '',
    league: '',
    logoURL: '',
    record: '',
    championships: '',
    season: '',
    stats: {}
  });

  const [newPlayer, setNewPlayer] = useState({
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

  const resetNewTeam = () => {
    setNewTeam({
      name: '',
      sport: '',
      universityId: '',
      coach: '',
      foundedYear: '',
      league: '',
      logoURL: '',
      record: '',
      championships: '',
      season: '',
      stats: {}
    });
  };

  const resetNewPlayer = () => {
    setNewPlayer({
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

  const handleAddTeam = async () => {
    try {
      await create({
        name: newTeam.name,
        sport: newTeam.sport,
        universityId: newTeam.universityId,
        coach: newTeam.coach,
        foundedYear: newTeam.foundedYear ? parseInt(newTeam.foundedYear) : undefined,
        league: newTeam.league,
        logoURL: newTeam.logoURL,
        record: newTeam.record,
        championships: newTeam.championships,
        season: newTeam.season,
        stats: newTeam.stats,
      });
      resetNewTeam();
      setShowAddModal(false);
      success('Team created successfully', `"${newTeam.name}" has been added to the system`, 'Add players to the team or manage other teams');
    } catch (error) {
      console.error('Failed to create team:', error);
      showError('Failed to create team', 'Please check your input and try again');
    }
  };

  const handleEditTeam = async () => {
    try {
      await update(editingTeam.id, {
        name: editingTeam.name,
        sport: editingTeam.sport,
        universityId: editingTeam.universityId,
        coach: editingTeam.coach,
        foundedYear: editingTeam.foundedYear,
        league: editingTeam.league,
        logoURL: editingTeam.logoURL,
        record: editingTeam.record,
        championships: editingTeam.championships,
        season: editingTeam.season,
        stats: editingTeam.stats,
      });
      setEditingTeam(null);
      setShowEditModal(false);
      success('Team updated successfully', 'Changes have been saved', 'Continue editing or view team details');
    } catch (error) {
      console.error('Failed to update team:', error);
      showError('Failed to update team', 'Please try again');
    }
  };

  const handleDeleteTeam = async (id: string) => {
    const team = teams.find((t: any) => t.id === id);
    if (confirm(`Are you sure you want to delete "${team?.name}"? This action cannot be undone.`)) {
      try {
        await deleteU(id);
        success('Team deleted successfully', `"${team?.name}" has been removed`, 'Create a new team or manage existing ones');
      } catch (error) {
        console.error('Failed to delete team:', error);
        showError('Failed to delete team', 'Please try again');
      }
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name.trim()) {
      warning('Player name required', 'Please enter the player\'s name');
      return;
    }
    try {
      await addPlayer(selectedTeam.id, newPlayer);
      resetNewPlayer();
      setShowAddPlayerModal(false);
      success('Player added successfully', `${newPlayer.name} is now on the team roster`, 'Add more players or manage team');
    } catch (error) {
      console.error('Failed to add player:', error);
      showError('Failed to add player', 'Please check the player details and try again');
    }
  };

  const handleEditPlayer = async () => {
    try {
      await updatePlayer(selectedTeam.id, editingPlayer.id, editingPlayer);
      setEditingPlayer(null);
      setShowEditPlayerModal(false);
      success('Player updated successfully', 'Changes have been saved', 'Continue editing or view roster');
    } catch (error) {
      console.error('Failed to update player:', error);
      showError('Failed to update player', 'Please try again');
    }
  };

  const handleDeletePlayer = async (teamId: string, playerId: string) => {
    const player = selectedTeam?.players?.find((p: any) => p.id === playerId);
    if (confirm(`Are you sure you want to remove "${player?.name}" from the team?`)) {
      try {
        await deletePlayer(teamId, playerId);
        success('Player removed', `${player?.name} has been removed from the team`, 'Add new players if needed');
      } catch (error) {
        console.error('Failed to delete player:', error);
        showError('Failed to remove player', 'Please try again');
      }
    }
  };

  const totalPages = Math.ceil(teams.length / itemsPerPage);
  const paginatedTeams = teams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const exportData = teams.map((team: any) => ({
    name: team.name,
    sport: team.sport,
    university: universities.find((u: University) => u.id === team.universityId)?.name || 'N/A',
    coach: team.coach,
    players: team.players?.length || 0
  }));
  const exportHeaders = ['name', 'sport', 'university', 'coach', 'players'];

  return (
    <>
      <div id="content-teams" className="slide-in-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teams Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage teams and their players.</p>
          </div>
          <button
            onClick={() => { resetNewTeam(); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            <FiPlus className="w-5 h-5" />
            Add Team
          </button>
        </div>

        {showPlayersModal && selectedTeam && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-xl mb-6 animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {selectedTeam.logoURL && (
                  <img src={selectedTeam.logoURL} alt={selectedTeam.name} className="w-10 h-10 rounded-lg object-cover" />
                )}
                <div>
                  <h3 className="text-lg font-bold dark:text-white">{selectedTeam.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTeam.sport} • {universities.find((u: University) => u.id === selectedTeam.universityId)?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPlayersModal(false)}
                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold dark:text-white flex items-center gap-2">
                <FiUsers className="w-5 h-5" />
                Players ({selectedTeam.players?.length || 0})
              </h4>
              <button
                onClick={() => { resetNewPlayer(); setShowAddPlayerModal(true); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Add Player
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Number</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedTeam.players && selectedTeam.players.map((player: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{player.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.position || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.year || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.number || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => { setEditingPlayer(player); setShowEditPlayerModal(true); }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(selectedTeam.id, player.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!selectedTeam.players || selectedTeam.players.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <FiUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No players on this team yet</p>
                        <button
                          onClick={() => { resetNewPlayer(); setShowAddPlayerModal(true); }}
                          className="mt-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Add the first player
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-6">
          {teams.length > 0 && <ExportButtons data={exportData} headers={exportHeaders} filename="teams" />}
          
          {teams.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <FiAward className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No teams yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first team</p>
              <button
                onClick={() => { resetNewTeam(); setShowAddModal(true); }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
              >
                <FiPlus className="w-5 h-5" />
                Add First Team
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Logo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sport</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">University</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Coach</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Players</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedTeams.map((team: any) => (
                      <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {team.logoURL ? (
                            <img src={team.logoURL} alt={`${team.name} logo`} className="w-12 h-12 object-cover rounded-lg" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-bold">
                              {team.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{team.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            {team.sport}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {universities.find((u: University) => u.id === team.universityId)?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.coach || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <span className="flex items-center gap-1">
                            <FiUsers className="w-4 h-4" />
                            {team.players?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => { setSelectedTeam(team); setShowPlayersModal(true); }}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-3 inline-flex items-center gap-1"
                            title="View Players"
                          >
                            <FiUsers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditingTeam(team); setShowEditModal(true); }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Team Modal */}
      <Modal isOpen={showAddModal} title="Add New Team" onClose={() => { setShowAddModal(false); resetNewTeam(); }} fullScreen={true}>
        <TeamForm
          formData={newTeam}
          setFormData={setNewTeam}
          onSubmit={handleAddTeam}
          submitLabel="Create Team"
          user={user}
          onCancel={() => { setShowAddModal(false); resetNewTeam(); }}
        />
      </Modal>

      {/* Edit Team Modal */}
      <Modal isOpen={showEditModal && !!editingTeam} title="Edit Team" onClose={() => { setShowEditModal(false); setEditingTeam(null); }} fullScreen={true}>
        {editingTeam && (
          <TeamForm
            formData={editingTeam}
            setFormData={setEditingTeam}
            onSubmit={handleEditTeam}
            submitLabel="Update Team"
            user={user}
            onCancel={() => { setShowEditModal(false); setEditingTeam(null); }}
          />
        )}
      </Modal>

      {/* Add Player Modal */}
      <Modal isOpen={showAddPlayerModal} title="Add New Player" onClose={() => { setShowAddPlayerModal(false); resetNewPlayer(); }} fullScreen={true}>
        <form onSubmit={(e) => { e.preventDefault(); handleAddPlayer(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                required
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 text-gray-900 dark:text-white"
                placeholder="Player name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
              <input
                type="text"
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 text-gray-900 dark:text-white"
                placeholder="e.g. Forward, Goalkeeper"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
              <select
                value={newPlayer.year}
                onChange={(e) => setNewPlayer({ ...newPlayer, year: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 text-gray-900 dark:text-white appearance-none"
              >
                <option value="">Select Year</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number</label>
              <input
                type="text"
                value={newPlayer.number}
                onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 text-gray-900 dark:text-white"
                placeholder="Jersey number"
              />
            </div>
          </div>
          <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => { setShowAddPlayerModal(false); resetNewPlayer(); }}
              className="flex-1 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Player
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Player Modal */}
      <Modal isOpen={showEditPlayerModal && !!editingPlayer} title="Edit Player" onClose={() => { setShowEditPlayerModal(false); setEditingPlayer(null); }} fullScreen={true}>
        {editingPlayer && (
          <form onSubmit={(e) => { e.preventDefault(); handleEditPlayer(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                <input
                  type="text"
                  value={editingPlayer.position}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, position: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => { setShowEditPlayerModal(false); setEditingPlayer(null); }}
                className="flex-1 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FiCheckCircle className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
