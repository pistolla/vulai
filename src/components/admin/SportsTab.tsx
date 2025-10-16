import { useEffect, useState } from 'react';
import { apiService } from '@/services/apiService';

// Modal Component
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-50 dark:bg-opacity-70">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sport Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) => setFormData({...formData, image: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Players per Team</label>
          <input
            type="number"
            value={formData.players}
            onChange={(e) => setFormData({...formData, players: +e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Season</label>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
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
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSport, setEditingSport] = useState<any>(null);
  const [newSport, setNewSport] = useState({
    name: '',
    category: 'team',
    description: '',
    image: '',
    players: 11,
    season: 'Fall',
    positions: [] as string[]
  });

  const resetNewSport = () => {
    setNewSport({
      name: '',
      category: 'team',
      description: '',
      image: '',
      players: 11,
      season: 'Fall',
      positions: []
    });
  };

  useEffect(() => {
    const loadSports = async () => {
      try {
        // Try to load from Firebase API first
        const sportsData = await apiService.getSports();
        if (sportsData && sportsData.length > 0) {
          setSports(sportsData);
        } else {
          throw new Error('Empty Firebase sports data');
        }
      } catch (error) {
        console.error('Failed to load sports from Firebase:', error);
        // Fallback to local JSON file
        try {
          const response = await fetch('/data/sports.json');
          if (!response.ok) {
            throw new Error('Failed to load sports data');
          }
          const data = await response.json();
          setSports(data.sports || []);
        } catch (localError) {
          console.error('Failed to load local sports data:', localError);
          setSports([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSports();
  }, []);

  const handleAddSport = async () => {
    try {
      // This would need to be implemented in the API service
      alert('Add sport functionality would be implemented here');
      resetNewSport();
      setShowAddModal(false);
    } catch (error) {
      alert('Failed to add sport: ' + (error as Error).message);
    }
  };

  const handleEditSport = async () => {
    try {
      // This would need to be implemented in the API service
      alert('Edit sport functionality would be implemented here');
      setEditingSport(null);
    } catch (error) {
      alert('Failed to edit sport: ' + (error as Error).message);
    }
  };

  const handleDeleteSport = async (id: string) => {
    if (confirm('Are you sure you want to delete this sport?')) {
      try {
        // This would need to be implemented in the API service
        alert('Delete sport functionality would be implemented here');
      } catch (error) {
        alert('Failed to delete sport: ' + (error as Error).message);
      }
    }
  };

  return (
    <div id="content-sports" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Sports Management</h2><p className="text-gray-600">Manage sports categories and their configurations.</p></div>
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

      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sports...</p>
            </div>
          </div>
        ) : sports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No sports found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Season</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Championships</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sports.map((sport) => (
                <tr key={sport.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img src={sport.image} alt={sport.name} className="w-8 h-8 rounded mr-3" />
                      <div className="text-sm font-medium text-gray-900">{sport.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{sport.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sport.players}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sport.season}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sport.stats?.championships || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => { setEditingSport(sport); setShowEditModal(true); }} className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                    <button onClick={() => handleDeleteSport(sport.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}