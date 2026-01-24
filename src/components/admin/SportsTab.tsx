import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSports, createSportT, saveSportT, removeSportT, fetchSeasons, createSeasonT } from '@/store/adminThunk';
import { RootState } from '@/store';
import Pagination from './Pagination';
import ExportButtons from './ExportButtons';

import { Modal } from '@/components/common/Modal';

// Season Form Component
function SeasonForm({ formData, setFormData, onSubmit, submitLabel, sports }: any) {
  useEffect(() => {
    if (formData.sportId && formData.startDate && formData.endDate) {
      const sportName = sports.find((s: any) => s.id === formData.sportId)?.name || '';
      const yearStart = new Date(formData.startDate).getFullYear();
      const yearEnd = new Date(formData.endDate).getFullYear();
      if (sportName && !isNaN(yearStart) && !isNaN(yearEnd)) {
        setFormData((prev: any) => ({ ...prev, name: `${sportName}${yearStart}-${yearEnd}` }));
      }
    }
  }, [formData.sportId, formData.startDate, formData.endDate, sports, setFormData]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Sport</label>
          <select
            required
            value={formData.sportId}
            onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>Select a sport</option>
            {sports.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Season Name (Auto-generated)</label>
          <input
            type="text"
            readOnly
            placeholder="SportNameYear-Year"
            value={formData.name}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            placeholder="Brief description of the season"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Set as Active Season</label>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">{submitLabel}</button>
      </div>
    </form>
  );
}

// Sport Form Component
function SportForm({ formData, setFormData, onSubmit, submitLabel }: any) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Sport Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="team">Team Sport</option>
            <option value="individual">Individual Sport</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Image URL</label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Base64 Image</label>
          <textarea
            rows={4}
            placeholder="Paste base64 encoded image"
            value={formData.base64Image}
            onChange={(e) => setFormData({ ...formData, base64Image: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Players per Team</label>
          <input
            type="number"
            value={formData.players}
            onChange={(e) => setFormData({ ...formData, players: +e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        {/* Season field removed from sport directly, now use seasons collection */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Positions (comma-separated)</label>
          <textarea
            rows={2}
            value={formData.positions ? formData.positions.join(', ') : ''}
            onChange={(e) => setFormData({ ...formData, positions: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Wins</label>
          <input
            type="number"
            value={formData.stats?.wins || ''}
            onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, wins: +e.target.value } })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Losses</label>
          <input
            type="number"
            value={formData.stats?.losses || ''}
            onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, losses: +e.target.value } })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Championships</label>
          <input
            type="number"
            value={formData.stats?.championships || ''}
            onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, championships: +e.target.value } })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
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

export default function SportsTab({ adminData }: any) {
  const dispatch = useDispatch();
  const { sports, loading } = useSelector((state: RootState) => ({
    sports: state.admin.sports,
    loading: false, // Since we don't have loading state for sports yet
  }));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [selectedSportForSeasons, setSelectedSportForSeasons] = useState<any>(null);
  const [sportSeasons, setSportSeasons] = useState<any[]>([]);
  const [editingSport, setEditingSport] = useState<any>(null);
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
    if (confirm('Are you sure you want to delete this sport?')) {
      try {
        await dispatch(removeSportT(id) as any);
      } catch (error) {
        alert('Failed to delete sport: ' + (error as Error).message);
      }
    }
  };

  const handleManageSeasons = async (sport: any) => {
    setSelectedSportForSeasons(sport);
    setNewSeason(prev => ({ ...prev, sportId: sport.id }));
    setShowSeasonModal(true);
    try {
      const res = await dispatch(fetchSeasons(sport.id) as any);
      setSportSeasons(res.payload);
    } catch (error) {
      console.error('Failed to fetch seasons:', error);
    }
  };

  const handleAddSeason = async () => {
    if (!newSeason.sportId) return alert('Please select a sport');

    // Uniqueness check
    const isDuplicate = sportSeasons.some(s => s.name === newSeason.name);
    if (isDuplicate) return alert('A season with this name already exists for this sport');

    try {
      await dispatch(createSeasonT({ sportId: newSeason.sportId, season: newSeason }) as any);
      // Refresh
      const res = await dispatch(fetchSeasons(newSeason.sportId) as any);
      setSportSeasons(res.payload);
      setNewSeason({ sportId: newSeason.sportId, name: '', description: '', startDate: '', endDate: '', isActive: true });
    } catch (error) {
      alert('Failed to add season');
    }
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
        <div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sports Management</h2><p className="text-gray-600 dark:text-gray-400">Manage sports categories and their configurations.</p></div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Sport</button>
      </div>

      {/* Add Sport Modal */}
      {showAddModal && (
        <Modal isOpen={showAddModal} title="Add New Sport" onClose={() => { setShowAddModal(false); resetNewSport(); }} fullScreen={true}>
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
        <Modal isOpen={showEditModal} title="Edit Sport" onClose={() => { setShowEditModal(false); setEditingSport(null); }} fullScreen={true}>
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
        <Modal isOpen={showSeasonModal} title={`Manage Seasons - ${selectedSportForSeasons.name}`} onClose={() => setShowSeasonModal(false)}>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Create New Season</h3>
              <SeasonForm
                formData={newSeason}
                setFormData={setNewSeason}
                onSubmit={handleAddSeason}
                submitLabel="Add Season"
                sports={sports}
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Existing Seasons</h3>
              <div className="space-y-2">
                {sportSeasons.length === 0 ? (
                  <p className="text-gray-500 italic">No seasons defined yet.</p>
                ) : (
                  sportSeasons.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div>
                        <div className="font-bold">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.startDate} to {s.endDate}</div>
                      </div>
                      {s.isActive && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-6">
        {sports.length > 0 && <ExportButtons data={exportData} headers={exportHeaders} filename="sports" />}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sports...</p>
            </div>
          </div>
        ) : sports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">No sports found.</p>
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
                    <tr key={sport.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={sport.image} alt={sport.name} className="w-8 h-8 rounded mr-3" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{sport.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{sport.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sport.players}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sport.season}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sport.stats?.championships || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleManageSeasons(sport)} className="text-green-600 hover:text-green-900 mr-2">Seasons</button>
                        <button onClick={() => { setEditingSport(sport); setShowEditModal(true); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-2">Edit</button>
                        <button onClick={() => handleDeleteSport(sport.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
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