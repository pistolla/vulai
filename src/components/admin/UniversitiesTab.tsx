import { useEffect, useState } from 'react';
import { apiService } from '@/services/apiService';

export default function UniversitiesTab({ adminData }: any) {
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<any>(null);
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    location: '',
    established: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        // Try to load from Firebase API first
        const firebaseData = await apiService.getUniversities();
        if (firebaseData && firebaseData.length > 0) {
          setUniversities(firebaseData);
        } else {
          throw new Error('Empty Firebase data');
        }
      } catch (error) {
        console.error('Failed to load universities from Firebase:', error);
        // Fallback to local JSON file
        try {
          const response = await fetch('/data/universities.json');
          if (!response.ok) {
            throw new Error('Failed to load universities data');
          }
          const data = await response.json();
          setUniversities(data.universities || []);
        } catch (localError) {
          console.error('Failed to load local universities data:', localError);
          setUniversities([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUniversities();
  }, []);

  const handleAddUniversity = async () => {
    try {
      // This would need to be implemented in the API service
      alert('Add university functionality would be implemented here');
      setNewUniversity({ name: '', location: '', established: '', website: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      alert('Failed to add university: ' + (error as Error).message);
    }
  };

  const handleEditUniversity = async () => {
    try {
      // This would need to be implemented in the API service
      alert('Edit university functionality would be implemented here');
      setEditingUniversity(null);
    } catch (error) {
      alert('Failed to edit university: ' + (error as Error).message);
    }
  };

  const handleDeleteUniversity = async (id: string) => {
    if (confirm('Are you sure you want to delete this university?')) {
      try {
        // This would need to be implemented in the API service
        alert('Delete university functionality would be implemented here');
      } catch (error) {
        alert('Failed to delete university: ' + (error as Error).message);
      }
    }
  };

  return (
    <div id="content-universities" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Universities Management</h2><p className="text-gray-600">Manage university information and details.</p></div>
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add University</button>
      </div>

      {(showAddForm || editingUniversity) && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingUniversity ? 'Edit University' : 'Add New University'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="University Name"
              value={editingUniversity ? editingUniversity.name : newUniversity.name}
              onChange={(e) => editingUniversity ? setEditingUniversity({...editingUniversity, name: e.target.value}) : setNewUniversity({...newUniversity, name: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Location"
              value={editingUniversity ? editingUniversity.location : newUniversity.location}
              onChange={(e) => editingUniversity ? setEditingUniversity({...editingUniversity, location: e.target.value}) : setNewUniversity({...newUniversity, location: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="number"
              placeholder="Established Year"
              value={editingUniversity ? editingUniversity.established : newUniversity.established}
              onChange={(e) => editingUniversity ? setEditingUniversity({...editingUniversity, established: e.target.value}) : setNewUniversity({...newUniversity, established: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="url"
              placeholder="Website URL"
              value={editingUniversity ? editingUniversity.website : newUniversity.website}
              onChange={(e) => editingUniversity ? setEditingUniversity({...editingUniversity, website: e.target.value}) : setNewUniversity({...newUniversity, website: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={editingUniversity ? editingUniversity.description : newUniversity.description}
              onChange={(e) => editingUniversity ? setEditingUniversity({...editingUniversity, description: e.target.value}) : setNewUniversity({...newUniversity, description: e.target.value})}
              className="px-3 py-2 border rounded col-span-2"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={editingUniversity ? handleEditUniversity : handleAddUniversity} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">{editingUniversity ? 'Update' : 'Add'} University</button>
            <button onClick={() => { setShowAddForm(false); setEditingUniversity(null); }} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading universities...</p>
            </div>
          </div>
        ) : universities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No universities found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Established</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {universities.map((university) => (
                <tr key={university.id}>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{university.name}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{university.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{university.established}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><a href={`https://${university.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">{university.website}</a></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setEditingUniversity(university)} className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                    <button onClick={() => handleDeleteUniversity(university.id)} className="text-red-600 hover:text-red-900">Delete</button>
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