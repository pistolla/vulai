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

// University Form Component
function UniversityForm({ formData, setFormData, onSubmit, submitLabel }: any) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">University Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Location</label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Established Year</label>
          <input
            type="number"
            value={formData.established}
            onChange={(e) => setFormData({...formData, established: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Website URL</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
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

export default function UniversitiesTab({ adminData, create, update, deleteU }: any) {
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<any>(null);
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    location: '',
    established: '',
    website: '',
    description: ''
  });

  const resetNewUniversity = () => {
    setNewUniversity({
      name: '',
      location: '',
      established: '',
      website: '',
      description: ''
    });
  };

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
    await create({
      name: newUniversity.name,
      location: newUniversity.location,
      established: newUniversity.established ? parseInt(newUniversity.established) : undefined,
      website: newUniversity.website,
      description: newUniversity.description,
    });
    resetNewUniversity();
    setShowAddModal(false);
  };

  const handleEditUniversity = async () => {
    await update(editingUniversity.id, {
      name: editingUniversity.name,
      location: editingUniversity.location,
      established: editingUniversity.established,
      website: editingUniversity.website,
      description: editingUniversity.description,
    });
    setEditingUniversity(null);
    setShowEditModal(false);
  };

  const handleDeleteUniversity = async (id: string) => {
    if (confirm('Are you sure you want to delete this university?')) {
      await deleteU(id);
    }
  };

  return (
    <div id="content-universities" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Universities Management</h2><p className="text-gray-600">Manage university information and details.</p></div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add University</button>
      </div>

      {/* Add University Modal */}
      {showAddModal && (
        <Modal title="Add New University" onClose={() => { setShowAddModal(false); resetNewUniversity(); }}>
          <UniversityForm
            formData={newUniversity}
            setFormData={setNewUniversity}
            onSubmit={handleAddUniversity}
            submitLabel="Add University"
          />
        </Modal>
      )}

      {/* Edit University Modal */}
      {showEditModal && editingUniversity && (
        <Modal title="Edit University" onClose={() => { setShowEditModal(false); setEditingUniversity(null); }}>
          <UniversityForm
            formData={editingUniversity}
            setFormData={setEditingUniversity}
            onSubmit={handleEditUniversity}
            submitLabel="Update University"
          />
        </Modal>
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
                    <button onClick={() => { setEditingUniversity(university); setShowEditModal(true); }} className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
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