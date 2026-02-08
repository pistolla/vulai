import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSports, createSportT, saveSportT, removeSportT, fetchSeasons, createSeasonT, updateSeasonT, removeSeasonT } from '@/store/adminThunk';
import { RootState } from '@/store';
import Pagination from './Pagination';
import ExportButtons from './ExportButtons';
import { Modal } from '@/components/common/Modal';
import { FiPlus, FiCalendar, FiEdit2, FiTrash2, FiClock, FiChevronRight, FiLoader, FiInfo, FiChevronDown, FiChevronUp, FiPower } from 'react-icons/fi';

// Season Card Component with timeline visualization and active toggle
function SeasonCard({ 
  season, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: { 
  season: any; 
  onEdit: () => void; 
  onDelete: () => void; 
  onToggleActive: () => void;
}) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysRemaining = () => {
    if (!season.endDate) return null;
    const end = new Date(season.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();
  const isPast = daysRemaining !== null && daysRemaining < 0;
  const isActive = season.isActive && !isPast;

  return (
    <div className={`group relative bg-white dark:bg-gray-800 border rounded-xl p-4 transition-all duration-200 ${
      isActive 
        ? 'border-unill-purple-300 dark:border-unill-purple-600 shadow-md shadow-unill-purple-100 dark:shadow-unill-purple-900/20' 
        : 'border-gray-200 dark:border-gray-700 hover:border-unill-purple-300 dark:hover:border-unill-purple-600'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-lg font-bold text-gray-900 dark:text-white truncate">{season.name}</span>
            {isActive && (
              <span className="inline-flex items-center px-2 py-0.5 bg-unill-purple-100 dark:bg-unill-purple-900/30 text-unill-purple-700 dark:text-unill-purple-400 text-xs font-bold rounded-full">
                <span className="w-1.5 h-1.5 bg-unill-purple-500 rounded-full mr-1.5 animate-pulse"></span>
                Active
              </span>
            )}
            {isPast && !isActive && (
              <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full">
                Completed
              </span>
            )}
          </div>
          
          {season.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{season.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4" />
              <span>{formatDate(season.startDate)}</span>
              <FiChevronRight className="w-3 h-3 mx-1" />
              <span>{formatDate(season.endDate)}</span>
            </div>
            {daysRemaining !== null && !isPast && (
              <span className="flex items-center gap-1.5 text-unill-purple-600 dark:text-unill-purple-400">
                <FiClock className="w-4 h-4" />
                <span>{daysRemaining} days remaining</span>
              </span>
            )}
          </div>

          {/* Timeline visualization */}
          <div className="mt-3 relative h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-unill-purple-400 to-unill-purple-600 rounded-full transition-all duration-500" 
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-4">
          {/* Active Toggle Button */}
          <button
            onClick={onToggleActive}
            className={`p-2 rounded-lg transition-all ${
              isActive 
                ? 'text-unill-purple-600 bg-unill-purple-50 dark:bg-unill-purple-900/30' 
                : 'text-gray-400 hover:text-unill-purple-600 hover:bg-unill-purple-50 dark:hover:bg-unill-purple-900/20'
            }`}
            title={isActive ? 'Deactivate season' : 'Activate season'}
          >
            <FiPower className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
          </button>
          
          {/* Edit Button */}
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit season"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          
          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete season"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Season Form Component with improved UX and theming
function SeasonForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  submitLabel, 
  sports, 
  selectedSport,
  isEditing = false,
  onCancel
}: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing && formData.sportId && formData.startDate && formData.endDate) {
      const sportName = sports.find((s: any) => s.id === formData.sportId)?.name || '';
      const yearStart = new Date(formData.startDate).getFullYear();
      const yearEnd = new Date(formData.endDate).getFullYear();
      if (sportName && !isNaN(yearStart) && !isNaN(yearEnd)) {
        setFormData((prev: any) => ({ ...prev, name: `${sportName} ${yearStart}-${yearEnd}` }));
      }
    }
  }, [formData.sportId, formData.startDate, formData.endDate, sports, setFormData, isEditing]);

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sport Selector - Only show if not editing and no selected sport */}
      {!isEditing && !selectedSport && (
        <div>
          <label htmlFor="season-sport" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Select Sport
          </label>
          <select
            id="season-sport"
            required
            value={formData.sportId}
            onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500"
          >
            <option value="" disabled>Choose a sport</option>
            {sports.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Selected sport indicator */}
      {selectedSport && (
        <div className="flex items-center gap-3 p-3 bg-unill-purple-50 dark:bg-unill-purple-900/20 rounded-lg border border-unill-purple-100 dark:border-unill-purple-800">
          <img src={selectedSport.image} alt={selectedSport.name} className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-sm font-medium text-unill-purple-700 dark:text-unill-purple-300">
            Creating season for <strong>{selectedSport.name}</strong>
          </span>
        </div>
      )}

      {/* Sport ID hidden field if selectedSport is provided */}
      {selectedSport && (
        <input type="hidden" value={formData.sportId} />
      )}

      <div>
        <label htmlFor="season-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Season Name
        </label>
        <div className="relative">
          <input
            id="season-name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={!isEditing ? "Auto-generated from dates" : "Edit season name"}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500 pr-20"
          />
          {!isEditing && formData.startDate && formData.endDate && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
              Auto-generated
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <FiInfo className="w-3 h-3" />
          {isEditing ? 'Edit the name as needed' : 'Name is automatically generated from sport and dates'}
        </p>
      </div>

      <div>
        <label htmlFor="season-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="season-description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the season, goals, or highlights"
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="season-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Start Date
          </label>
          <div className="relative">
            <input
              id="season-start"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500 pl-10"
            />
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div>
          <label htmlFor="season-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            End Date
          </label>
          <div className="relative">
            <input
              id="season-end"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500 pl-10"
            />
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <input
          type="checkbox"
          id="season-active"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-5 h-5 text-unill-purple-600 rounded border-gray-300 dark:border-gray-600 focus:ring-unill-purple-500"
        />
        <label htmlFor="season-active" className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Set as Active Season</strong>
          <span className="block text-gray-500 dark:text-gray-400 text-xs mt-0.5">
            Only one season can be active at a time
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-unill-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-unill-purple-700 focus:outline-none focus:ring-2 focus:ring-unill-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiPlus className="w-4 h-4" />
              {submitLabel}
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// Sport Form Component (updated with theme colors)
function SportForm({ formData, setFormData, onSubmit, submitLabel }: any) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sport Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500"
          >
            <option value="team">Team Sport</option>
            <option value="individual">Individual Sport</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Image URL</label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Base64 Image</label>
          <textarea
            rows={4}
            placeholder="Paste base64 encoded image"
            value={formData.base64Image}
            onChange={(e) => setFormData({ ...formData, base64Image: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Players per Team</label>
          <input
            type="number"
            value={formData.players}
            onChange={(e) => setFormData({ ...formData, players: +e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500 resize-none"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Positions (comma-separated)</label>
          <textarea
            rows={2}
            value={formData.positions ? formData.positions.join(', ') : ''}
            onChange={(e) => setFormData({ ...formData, positions: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Wins</label>
          <input
            type="number"
            value={formData.stats?.wins || ''}
            onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, wins: +e.target.value } })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Losses</label>
          <input
            type="number"
            value={formData.stats?.losses || ''}
            onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, losses: +e.target.value } })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Championships</label>
          <input
            type="number"
            value={formData.stats?.championships || ''}
            onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, championships: +e.target.value } })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-unill-purple-500 focus:ring-unill-purple-500"
          />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="bg-unill-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-unill-purple-700 flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function SportsTab({ adminData }: any) {
  const dispatch = useDispatch();
  const { sports, loading } = useSelector((state: RootState) => ({
    sports: state.admin.sports,
    loading: false,
  }));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showEditSeasonModal, setShowEditSeasonModal] = useState(false);
  const [showSeasonForm, setShowSeasonForm] = useState(false); // Collapsible form state
  const [selectedSportForSeasons, setSelectedSportForSeasons] = useState<any>(null);
  const [sportSeasons, setSportSeasons] = useState<any[]>([]);
  const [editingSport, setEditingSport] = useState<any>(null);
  const [editingSeason, setEditingSeason] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newSport, setNewSport] = useState({
    name: '',
    category: 'team' as 'team' | 'individual',
    description: '',
    image: '',
    base64Image: '',
    players: 11,
    positions: [] as string[],
    stats: { wins: 0, losses: 0, championships: 0 }
  });

  const [newSeason, setNewSeason] = useState({
    sportId: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  const resetNewSport = () => {
    setNewSport({
      name: '',
      category: 'team',
      description: '',
      image: '',
      base64Image: '',
      players: 11,
      positions: [],
      stats: { wins: 0, losses: 0, championships: 0 }
    });
  };

  useEffect(() => {
    dispatch(fetchSports() as any);
  }, [dispatch]);

  const handleAddSport = async () => {
    try {
      await dispatch(createSportT(newSport) as any);
      resetNewSport();
      setShowAddModal(false);
    } catch (error) {
      alert('Failed to add sport: ' + (error as Error).message);
    }
  };

  const handleEditSport = async () => {
    if (!editingSport) return;
    try {
      await dispatch(saveSportT({ id: editingSport.id, data: editingSport }) as any);
      setEditingSport(null);
      setShowEditModal(false);
    } catch (error) {
      alert('Failed to edit sport: ' + (error as Error).message);
    }
  };

  const handleDeleteSport = async (id: string) => {
    if (confirm('Are you sure you want to delete this sport? This will also delete all associated seasons.')) {
      try {
        await dispatch(removeSportT(id) as any);
      } catch (error) {
        alert('Failed to delete sport: ' + (error as Error).message);
      }
    }
  };

  const handleManageSeasons = async (sport: any) => {
    setSelectedSportForSeasons(sport);
    setNewSeason(prev => ({ ...prev, sportId: sport.id, name: '', description: '', startDate: '', endDate: '', isActive: true }));
    setShowSeasonForm(false); // Form starts hidden
    setShowSeasonModal(true);
    try {
      const res = await dispatch(fetchSeasons(sport.id) as any);
      setSportSeasons(res.payload || []);
    } catch (error) {
      console.error('Failed to fetch seasons:', error);
      setSportSeasons([]);
    }
  };

  const toggleSeasonActive = async (seasonId: string, currentStatus: boolean) => {
    const sportId = selectedSportForSeasons?.id;
    if (!sportId) return;

    // If we're activating a season, we need to deactivate all others first
    if (!currentStatus) {
      const updates = sportSeasons
        .filter(s => s.isActive)
        .map(s => dispatch(updateSeasonT({ sportId, seasonId: s.id, data: { ...s, isActive: false } }) as any));
      await Promise.all(updates);
    }

    // Toggle the selected season
    const seasonToUpdate = sportSeasons.find(s => s.id === seasonId);
    if (seasonToUpdate) {
      try {
        await dispatch(updateSeasonT({ sportId, seasonId, data: { ...seasonToUpdate, isActive: !currentStatus } }) as any);
        // Refresh the list
        const res = await dispatch(fetchSeasons(sportId) as any);
        setSportSeasons(res.payload || []);
      } catch (error) {
        alert('Failed to update season status');
      }
    }
  };

  const handleAddSeason = async () => {
    if (!newSeason.sportId) return alert('Please select a sport');

    const isDuplicate = sportSeasons.some(s => s.name === newSeason.name);
    if (isDuplicate) return alert('A season with this name already exists for this sport');

    try {
      await dispatch(createSeasonT({ sportId: newSeason.sportId, season: newSeason }) as any);
      const res = await dispatch(fetchSeasons(newSeason.sportId) as any);
      setSportSeasons(res.payload || []);
      setNewSeason({ sportId: newSeason.sportId, name: '', description: '', startDate: '', endDate: '', isActive: true });
    } catch (error) {
      alert('Failed to add season');
    }
  };

  const handleEditSeason = async () => {
    if (!editingSeason || !editingSeason.id) return;
    const sportId = editingSeason.sportId || selectedSportForSeasons?.id;
    if (!sportId) return;

    try {
      await dispatch(updateSeasonT({ sportId, seasonId: editingSeason.id, data: editingSeason }) as any);
      const res = await dispatch(fetchSeasons(sportId) as any);
      setSportSeasons(res.payload || []);
      setEditingSeason(null);
      setShowEditSeasonModal(false);
    } catch (error) {
      alert('Failed to update season');
    }
  };

  const handleDeleteSeason = async (seasonId: string) => {
    const sportId = selectedSportForSeasons?.id;
    if (!sportId) return;
    if (confirm('Are you sure you want to delete this season? This will also delete all associated matches and fixtures.')) {
      try {
        await dispatch(removeSeasonT({ sportId, seasonId }) as any);
        setSportSeasons(prev => prev.filter(s => s.id !== seasonId));
      } catch (error) {
        alert('Failed to delete season');
      }
    }
  };

  const openEditSeason = (season: any) => {
    setEditingSeason({ ...season });
    setShowEditSeasonModal(true);
  };

  const totalPages = Math.ceil(sports.length / itemsPerPage);
  const paginatedSports = sports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Export data
  const exportData = sports.map((sport: any) => ({
    name: sport.name,
    category: sport.category,
    players: sport.players,
    season: sport.season,
    championships: sport.stats?.championships || 0
  }));
  const exportHeaders = ['name', 'category', 'players', 'season', 'championships'];

  return (
    <div id="content-sports" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sports Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage sports categories and their configurations.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="bg-unill-purple-600 text-white px-4 py-2 rounded-lg hover:bg-unill-purple-700 flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Sport
        </button>
      </div>

      {/* Add Sport Modal */}
      {showAddModal && (
        <Modal 
          isOpen={showAddModal} 
          title="Add New Sport" 
          onClose={() => { setShowAddModal(false); resetNewSport(); }} 
          fullScreen={true}
        >
          <SportForm
            formData={newSport}
            setFormData={setNewSport}
            onSubmit={handleAddSport}
            submitLabel="Add Sport"
          />
        </Modal>
      )}

      {/* Edit Sport Modal */}
      {showEditModal && editingSport && (
        <Modal 
          isOpen={showEditModal} 
          title="Edit Sport" 
          onClose={() => { setShowEditModal(false); setEditingSport(null); }} 
          fullScreen={true}
        >
          <SportForm
            formData={editingSport}
            setFormData={setEditingSport}
            onSubmit={handleEditSport}
            submitLabel="Update Sport"
          />
        </Modal>
      )}

      {/* Manage Seasons Modal */}
      {showSeasonModal && selectedSportForSeasons && (
        <Modal 
          isOpen={showSeasonModal} 
          title={`Manage Seasons - ${selectedSportForSeasons.name}`} 
          onClose={() => {
            setShowSeasonModal(false);
            setSelectedSportForSeasons(null);
          }}
        >
          <div className="space-y-6">
            {/* Sport Header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <img 
                src={selectedSportForSeasons.image} 
                alt={selectedSportForSeasons.name} 
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedSportForSeasons.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {selectedSportForSeasons.category} Sport • {sportSeasons.length} season{sportSeasons.length !== 1 ? 's' : ''}
                </p>
              </div>
              {/* Collapsible Form Toggle */}
              <button
                onClick={() => setShowSeasonForm(!showSeasonForm)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  showSeasonForm 
                    ? 'bg-unill-purple-100 dark:bg-unill-purple-900/30 text-unill-purple-700 dark:text-unill-purple-300' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-unill-purple-100 dark:hover:bg-unill-purple-900/30'
                }`}
              >
                {showSeasonForm ? (
                  <>
                    <FiChevronUp className="w-4 h-4" />
                    Hide Form
                  </>
                ) : (
                  <>
                    <FiPlus className="w-4 h-4" />
                    Add Season
                  </>
                )}
              </button>
            </div>

            {/* Collapsible Season Form */}
            {showSeasonForm && (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiPlus className="w-5 h-5 text-unill-purple-600" />
                  Create New Season
                </h4>
                <SeasonForm
                  formData={newSeason}
                  setFormData={setNewSeason}
                  onSubmit={handleAddSeason}
                  submitLabel="Add Season"
                  sports={sports}
                  selectedSport={selectedSportForSeasons}
                />
              </div>
            )}

            {/* Existing Seasons */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-unill-purple-600" />
                Existing Seasons
              </h4>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {sportSeasons.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <FiCalendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No seasons defined yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Add Season" to create one</p>
                  </div>
                ) : (
                  sportSeasons.map((s: any) => (
                    <SeasonCard
                      key={s.id}
                      season={s}
                      onEdit={() => openEditSeason(s)}
                      onDelete={() => handleDeleteSeason(s.id)}
                      onToggleActive={() => toggleSeasonActive(s.id, s.isActive)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Season Modal */}
      {showEditSeasonModal && editingSeason && (
        <Modal
          isOpen={showEditSeasonModal}
          title="Edit Season"
          onClose={() => {
            setShowEditSeasonModal(false);
            setEditingSeason(null);
          }}
        >
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <SeasonForm
              formData={editingSeason}
              setFormData={setEditingSeason}
              onSubmit={handleEditSeason}
              submitLabel="Save Changes"
              sports={sports}
              selectedSport={selectedSportForSeasons}
              isEditing={true}
              onCancel={() => {
                setShowEditSeasonModal(false);
                setEditingSeason(null);
              }}
            />
          </div>
        </Modal>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-6">
        {sports.length > 0 && <ExportButtons data={exportData} headers={exportHeaders} filename="sports" />}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-unill-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sports...</p>
            </div>
          </div>
        ) : sports.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
              <FiCalendar className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No sports found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-1">Get started by adding your first sport</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-unill-purple-600 text-white px-4 py-2 rounded-lg hover:bg-unill-purple-700 flex items-center gap-2 mx-auto"
            >
              <FiPlus className="w-4 h-4" />
              Add Sport
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Players</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Season</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Championships</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedSports.map((sport: any) => (
                    <tr key={sport.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {sport.image && (
                            <img src={sport.image} alt={sport.name} className="w-8 h-8 rounded-lg mr-3 object-cover" />
                          )}
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{sport.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{sport.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sport.players}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sport.season || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sport.stats?.championships || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleManageSeasons(sport)} 
                          className="text-unill-purple-600 dark:text-unill-purple-400 hover:text-unill-purple-900 dark:hover:text-unill-purple-300 mr-3 flex items-center gap-1"
                        >
                          <FiCalendar className="w-4 h-4" />
                          Seasons
                        </button>
                        <button 
                          onClick={() => { setEditingSport(sport); setShowEditModal(true); }} 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteSport(sport.id)} 
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
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}
