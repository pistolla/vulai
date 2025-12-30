import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSports, createSportT, saveSportT, removeSportT } from '@/store/adminThunk';
import { RootState } from '@/store';
import Pagination from './Pagination';
import ExportButtons from './ExportButtons';

// Modal Component
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-md">
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
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
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
            onChange={(e) => setFormData({...formData, image: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Base64 Image</label>
          <textarea
            rows={4}
            placeholder="Paste base64 encoded image"
            value={formData.base64Image}
            onChange={(e) => setFormData({...formData, base64Image: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Players per Team</label>
          <input
            type="number"
            value={formData.players}
            onChange={(e) => setFormData({...formData, players: +e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Season</label>
          <select
            value={formData.season}
            onChange={(e) => setFormData({...formData, season: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
            <option value="Spring">Spring</option>
            <option value="Year-round">Year-round</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Positions (comma-separated)</label>
          <textarea
            rows={2}
            value={formData.positions ? formData.positions.join(', ') : ''}
            onChange={(e) => setFormData({...formData, positions: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Wins</label>
          <input
            type="number"
            value={formData.stats?.wins || ''}
            onChange={(e) => setFormData({...formData, stats: {...formData.stats, wins: +e.target.value}})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Losses</label>
          <input
            type="number"
            value={formData.stats?.losses || ''}
            onChange={(e) => setFormData({...formData, stats: {...formData.stats, losses: +e.target.value}})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Championships</label>
          <input
            type="number"
            value={formData.stats?.championships || ''}
            onChange={(e) => setFormData({...formData, stats: {...formData.stats, championships: +e.target.value}})}
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
    season: 'Fall',
    positions: [] as string[],
    stats: { wins: 0, losses: 0, championships: 0 }
  });

  const resetNewSport = () => {
    setNewSport({
      name: '',
      category: 'team',
      description: '',
      image: '',
      base64Image: '',
      players: 11,
      season: 'Fall',
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
        <Modal title="Add New Sport" onClose={() => { setShowAddModal(false); resetNewSport(); }}>
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
        <Modal title="Edit Sport" onClose={() => { setShowEditModal(false); setEditingSport(null); }}>
          <SportForm
            formData={editingSport}
            setFormData={setEditingSport}
            onSubmit={handleEditSport}
            submitLabel="Update Sport"
          />
        </Modal>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
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
                    <button onClick={() => { setEditingSport(sport); setShowEditModal(true); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-2">Edit</button>
                    <button onClick={() => handleDeleteSport(sport.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}