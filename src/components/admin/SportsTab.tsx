import { useEffect, useState } from 'react';
import { apiService } from '@/services/apiService';

export default function SportsTab({ adminData }: any) {
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
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
      setNewSport({ name: '', category: 'team', description: '', image: '', players: 11, season: 'Fall', positions: [] });
      setShowAddForm(false);
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
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Sport</button>
      </div>

      {(showAddForm || editingSport) && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingSport ? 'Edit Sport' : 'Add New Sport'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Sport Name"
              value={editingSport ? editingSport.name : newSport.name}
              onChange={(e) => editingSport ? setEditingSport({...editingSport, name: e.target.value}) : setNewSport({...newSport, name: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <select
              value={editingSport ? editingSport.category : newSport.category}
              onChange={(e) => editingSport ? setEditingSport({...editingSport, category: e.target.value}) : setNewSport({...newSport, category: e.target.value})}
              className="px-3 py-2 border rounded"
            >
              <option value="team">Team Sport</option>
              <option value="individual">Individual Sport</option>
            </select>
            <input
              type="text"
              placeholder="Image URL"
              value={editingSport ? editingSport.image : newSport.image}
              onChange={(e) => editingSport ? setEditingSport({...editingSport, image: e.target.value}) : setNewSport({...newSport, image: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="number"
              placeholder="Players per Team"
              value={editingSport ? editingSport.players : newSport.players}
              onChange={(e) => editingSport ? setEditingSport({...editingSport, players: +e.target.value}) : setNewSport({...newSport, players: +e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <select
              value={editingSport ? editingSport.season : newSport.season}
              onChange={(e) => editingSport ? setEditingSport({...editingSport, season: e.target.value}) : setNewSport({...newSport, season: e.target.value})}
              className="px-3 py-2 border rounded"
            >
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
              <option value="Spring">Spring</option>
              <option value="Year-round">Year-round</option>
            </select>
            <textarea
              placeholder="Description"
              value={editingSport ? editingSport.description : newSport.description}
              onChange={(e) => editingSport ? setEditingSport({...editingSport, description: e.target.value}) : setNewSport({...newSport, description: e.target.value})}
              className="px-3 py-2 border rounded col-span-2"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={editingSport ? handleEditSport : handleAddSport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">{editingSport ? 'Update' : 'Add'} Sport</button>
            <button onClick={() => { setShowAddForm(false); setEditingSport(null); }} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
          </div>
        </div>
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
                    <button onClick={() => setEditingSport(sport)} className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
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