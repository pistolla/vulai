import { useEffect, useState } from 'react';
import { apiService } from '@/services/apiService';
import Pagination from './Pagination';
import ExportButtons from './ExportButtons';
import { University, League } from '@/models';
import { firebaseLeagueService } from '@/services/firebaseCorrespondence';
import { useToast } from '@/components/common/ToastProvider';
import { Modal } from '@/components/common/Modal';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addPlayerToSquadT } from '@/store/adminThunk';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiAward, FiCalendar, FiCheckCircle, FiAlertCircle, FiUploadCloud, FiSearch, FiX } from 'react-icons/fi';
import { generateTeamSlug } from '@/utils/slugUtils';

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
    if (formData.sport && leagues.length > 0 && sports.length > 0) {
      // formData.sport contains the sport name (from the select option value)
      const selectedSportName = formData.sport.toLowerCase();
      
      // Find the sport to get its ID for matching
      const selectedSport = sports.find(s => s.name.toLowerCase() === selectedSportName);
      
      const filtered = leagues.filter(l => {
        // First try: match by sportId (most reliable)
        if (selectedSport && l.sportId && l.sportId === selectedSport.id) {
          return true;
        }
        // Second try: match by sportName
        if (l.sportName?.toLowerCase() === selectedSportName) {
          return true;
        }
        // Third try: partial match on sportName
        if (l.sportName?.toLowerCase().includes(selectedSportName) || 
            selectedSportName.includes(l.sportName?.toLowerCase() || '')) {
          return true;
        }
        return false;
      });
      setFilteredLeagues(filtered);
    } else {
      setFilteredLeagues([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.sport, leagues.length, sports.length]); // Use .length to prevent object reference changes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleChange('logoURL', reader.result as string);
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

  // Validation only happens on submit - removed blur validation

  const handleChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const isCorrespondent = user?.role === 'correspondent';

  // Initialize universityId only once when form first loads
  useEffect(() => {
    if (isCorrespondent && user?.universityId && !formData.universityId) {
      setFormData((prev: any) => ({ ...prev, universityId: user.universityId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCorrespondent, user?.universityId]); // Intentionally exclude formData to prevent re-renders

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
              className={`w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 transition-all ${
                errors.name 
                  ? 'border-red-300 dark:border-red-600 focus:ring-4 focus:ring-red-500/20' 
                  : 'border-transparent focus:border-unill-purple-500 focus:ring-4 focus:ring-unill-purple-500/20'
              } text-gray-900 dark:text-white font-bold placeholder-gray-400`}
              placeholder="e.g. Eagles FC"
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
              className={`w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 transition-all appearance-none ${
                errors.sport
                  ? 'border-red-300 dark:border-red-600 focus:ring-4 focus:ring-red-500/20'
                  : 'border-transparent focus:border-unill-purple-500 focus:ring-4 focus:ring-unill-purple-500/20'
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
              className={`w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 transition-all appearance-none ${
                errors.universityId
                  ? 'border-red-300 dark:border-red-600 focus:ring-4 focus:ring-red-500/20'
                  : 'border-transparent focus:border-unill-purple-500 focus:ring-4 focus:ring-unill-purple-500/20'
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
            className={`w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 transition-all ${
              errors.coach
                ? 'border-red-300 dark:border-red-600 focus:ring-4 focus:ring-red-500/20'
                : 'border-transparent focus:border-unill-purple-500 focus:ring-4 focus:ring-unill-purple-500/20'
            } text-gray-900 dark:text-white font-bold placeholder-gray-400`}
            placeholder="e.g. John Smith"
          />
        </InputWrapper>

        <InputWrapper label="Founded Year" error={errors.foundedYear}>
          <input
            type="number"
            value={formData.foundedYear}
            onChange={(e) => handleChange('foundedYear', e.target.value)}
            className={`w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 transition-all ${
              errors.foundedYear
                ? 'border-red-300 dark:border-red-600 focus:ring-4 focus:ring-red-500/20'
                : 'border-transparent focus:border-unill-purple-500 focus:ring-4 focus:ring-unill-purple-500/20'
            } text-gray-900 dark:text-white font-bold placeholder-gray-400`}
            placeholder="e.g. 2020"
          />
        </InputWrapper>

        <InputWrapper label="League">
          <div className="relative">
            <select
              value={formData.league}
              onChange={(e) => handleChange('league', e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-unill-purple-500 focus:ring-4 focus:ring-unill-purple-500/20 text-gray-900 dark:text-white font-bold appearance-none"
            >
              <option value="">Select League (Optional)</option>
              {filteredLeagues.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
              {filteredLeagues.length === 0 && (
                <option value="" disabled>No leagues available for selected sport</option>
              )}
            </select>
            {!formData.sport && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Select a sport to see available leagues, or leave empty
              </p>
            )}
          </div>
        </InputWrapper>

        <InputWrapper label="Record">
          <input
            type="text"
            value={formData.record}
            onChange={(e) => handleChange('record', e.target.value)}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-unill-purple-500 focus:ring-4 focus:ring-unill-purple-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400"
            placeholder="e.g. 11-0-1"
          />
        </InputWrapper>

        <InputWrapper label="Championships">
          <input
            type="text"
            value={formData.championships}
            onChange={(e) => handleChange('championships', e.target.value)}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-unill-purple-500 focus:ring-4 focus:ring-unill-purple-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400"
            placeholder="e.g. Count or list"
          />
        </InputWrapper>

        <InputWrapper label="Season">
          <input
            type="text"
            value={formData.season}
            onChange={(e) => handleChange('season', e.target.value)}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-unill-purple-500 focus:ring-4 focus:ring-unill-purple-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400"
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
                    onClick={() => handleChange('logoURL', '')}
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
          className="flex-[2] py-4 bg-unill-purple-600 hover:bg-unill-purple-700 text-white rounded-2xl font-black shadow-lg shadow-unill-purple-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
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

export default function TeamsTab({ adminData, create, update, deleteU }: any) {
  const user = useAppSelector(state => state.auth.user);
  const teams = useAppSelector(state => state.admin.teams);
  const universities = useAppSelector(state => state.admin.universities);
  const players = useAppSelector(state => state.admin.players);
  const dispatch = useAppDispatch();
  const { success, error: showError, warning } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [editingTeam, setEditingTeam] = useState<any>(null);
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

  // Player assignment state
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [selectedSquadType, setSelectedSquadType] = useState<'current_squad' | 'bench_squad' | 'retired_squad' | 'current_formation'>('current_squad');
  const [assigningPlayer, setAssigningPlayer] = useState(false);

  // Filter players based on search
  const filteredPlayers = players.filter((player: any) =>
    player.name?.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
    player.position?.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
    player.number?.toString().includes(playerSearchQuery)
  );

  // Squad type labels
  const squadTypeLabels: Record<string, string> = {
    current_squad: 'Current Squad',
    bench_squad: 'Bench Squad',
    retired_squad: 'Retired Squad',
    current_formation: 'Current Formation'
  };

  const squadTypeColors: Record<string, string> = {
    current_squad: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    bench_squad: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    retired_squad: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    current_formation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  };

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

  const openSquadManager = (team: any) => {
    setSelectedTeam(team);
    setPlayerSearchQuery('');
    setSelectedPlayer(null);
    setSelectedSquadType('current_squad');
    setShowSquadModal(true);
  };

  const handleAssignPlayerToSquad = async () => {
    if (!selectedTeam || !selectedPlayer) {
      warning('Select a player', 'Please search and select a player first');
      return;
    }

    setAssigningPlayer(true);
    try {
      await dispatch(addPlayerToSquadT({
        teamId: selectedTeam.id,
        playerId: selectedPlayer.id,
        squadType: selectedSquadType,
        addedBy: user?.uid
      })).unwrap();

      success('Player assigned', `${selectedPlayer.name} added to ${squadTypeLabels[selectedSquadType]}`);
      setSelectedPlayer(null);
      setPlayerSearchQuery('');
    } catch (err) {
      showError('Failed to assign player', 'Please try again');
    } finally {
      setAssigningPlayer(false);
    }
  };

  const handleAddTeam = async () => {
    try {
      await create({
        name: newTeam.name,
        slug: generateTeamSlug(newTeam.name), // Generate human-readable slug
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
        slug: generateTeamSlug(editingTeam.name), // Update slug if name changes
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

  const totalPages = Math.ceil(teams.length / itemsPerPage);
  const paginatedTeams = teams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Export data - players are now managed in root 'players' collection
  const exportData = teams.map((team: any) => ({
    name: team.name,
    sport: team.sport,
    university: universities.find((u: University) => u.id === team.universityId)?.name || 'N/A',
    coach: team.coach
  }));
  const exportHeaders = ['name', 'sport', 'university', 'coach'];

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
            className="flex items-center gap-2 bg-unill-purple-600 hover:bg-unill-purple-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-unill-purple-500/30 transition-all active:scale-95"
          >
            <FiPlus className="w-5 h-5" />
            Add Team
          </button>
        </div>

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
                className="inline-flex items-center gap-2 px-6 py-3 bg-unill-purple-600 hover:bg-unill-purple-700 text-white rounded-xl font-bold shadow-lg shadow-unill-purple-500/30 transition-all active:scale-95"
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

      {/* Edit Team Modal - uses separate state for isOpen to prevent re-renders during typing */}
      <Modal isOpen={showEditModal} title="Edit Team" onClose={() => { setShowEditModal(false); setEditingTeam(null); }} fullScreen={true}>
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
    </>
  );
}
