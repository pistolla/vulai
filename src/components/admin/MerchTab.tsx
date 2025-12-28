import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMerch, fetchUniversities, fetchTeams, createMerchT, saveMerchT, removeMerchT } from '@/store/adminThunk';
import { RootState } from '@/store';

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

// Merchandise Form Component
function MerchandiseForm({ formData, setFormData, universities, teams, selectedUniversity, setSelectedUniversity, selectedTeam, setSelectedTeam, onSubmit, submitLabel }: any) {
  const filteredTeams = teams.filter((team: any) => !selectedUniversity || team.university === selectedUniversity);

  const handleUniversityChange = (universityId: string) => {
    setSelectedUniversity(universityId);
    setFormData({...formData, university: universityId, team: ''});
    setSelectedTeam('');
  };

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId);
    setFormData({...formData, team: teamId});
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Price</label>
          <input
            type="number"
            required
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Description</label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Additional Images (comma-separated URLs or base64)</label>
          <textarea
            rows={3}
            value={formData.images.join(', ')}
            onChange={(e) => setFormData({...formData, images: e.target.value.split(',').map(s => s.trim())})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Catalog</label>
          <input
            type="text"
            value={formData.catalog}
            onChange={(e) => setFormData({...formData, catalog: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">University</label>
          <select
            value={selectedUniversity}
            onChange={(e) => handleUniversityChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select University</option>
            {universities.map((uni: any) => (
              <option key={uni.id} value={uni.id}>{uni.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Team</label>
          <select
            value={selectedTeam}
            onChange={(e) => handleTeamChange(e.target.value)}
            disabled={!selectedUniversity}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Team</option>
            {filteredTeams.map((team: any) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
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

function ShimmerCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center animate-pulse">
      <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-16 mb-4"></div>
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-200 rounded w-12"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
}

export default function MerchTab({ adminData }: any) {
  const dispatch = useDispatch();
  const { merchItems, universities, teams, loading } = useSelector((state: RootState) => ({
    merchItems: state.merch.items,
    universities: state.admin.universities,
    teams: state.admin.teams,
    loading: state.merch.loading,
  }));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    images: [] as string[],
    category: '',
    catalog: '',
    university: '',
    team: ''
  });

  useEffect(() => {
    dispatch(fetchMerch() as any);
    dispatch(fetchUniversities() as any);
    dispatch(fetchTeams() as any);
  }, [dispatch]);

  const filteredTeams = teams.filter(team => !selectedUniversity || team.universityId === selectedUniversity);

  const handleAddMerch = async () => {
    await dispatch(createMerchT({
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      image: newItem.image || '/images/default-merch.jpg',
      images: newItem.images,
      category: newItem.category,
      catalog: newItem.catalog,
      university: newItem.university,
      team: newItem.team
    }) as any);
    resetNewItem();
    setShowAddModal(false);
  };

  const resetNewItem = () => {
    setNewItem({
      name: '',
      description: '',
      price: '',
      image: '',
      images: [],
      category: '',
      catalog: '',
      university: '',
      team: ''
    });
    setSelectedUniversity('');
    setSelectedTeam('');
  };

  const handleUniversityChange = (universityId: string) => {
    setSelectedUniversity(universityId);
    setNewItem({...newItem, university: universityId, team: ''});
    setSelectedTeam('');
  };

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId);
    setNewItem({...newItem, team: teamId});
  };

  const handleEditMerch = async () => {
    if (!editingItem) return;
    await dispatch(saveMerchT({ id: editingItem.id, data: editingItem }) as any);
    setEditingItem(null);
    setShowEditModal(false);
  };

  const displayItems = merchItems;
  const hasItems = displayItems.length > 0;
  const isLoading = loading;

  return (
    <>
      <div id="content-merchandise" className="slide-in-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Merchandise Management</h2><p className="text-gray-600 dark:text-gray-400">Create team themes, designs, and manage merchandise.</p></div>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Merchandise</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </>
        ) : hasItems ? displayItems.map((m: any) => (
          <div key={m.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <img src={m.image} alt={m.name} className="rounded-lg mb-4" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{m.name}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{m.description}</p>
            <div className="flex items-center space-x-2 mt-2"><span className="text-2xl font-bold text-green-600 dark:text-green-400">KSh {m.price}</span></div>
            <div className="flex space-x-2 mt-4"><button onClick={() => { setEditingItem(m); setShowEditModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">Edit</button><button onClick={() => dispatch(removeMerchT(m.id) as any)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">Delete</button></div>
          </div>
        )) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No merchandise found</p>
          </div>
        )}
      </div>
    </div>

    {/* Add Merchandise Modal */}
    {showAddModal && (
      <Modal title="Add New Merchandise" onClose={() => { setShowAddModal(false); resetNewItem(); }}>
          <MerchandiseForm
            formData={newItem}
            setFormData={setNewItem}
            universities={universities}
            teams={teams}
            selectedUniversity={selectedUniversity}
            setSelectedUniversity={setSelectedUniversity}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            onSubmit={handleAddMerch}
            submitLabel="Add Merchandise"
          />
      </Modal>
    )}

    {/* Edit Merchandise Modal */}
    {showEditModal && editingItem && (
      <Modal title="Edit Merchandise" onClose={() => { setShowEditModal(false); setEditingItem(null); }}>
          <MerchandiseForm
            formData={editingItem}
            setFormData={setEditingItem}
            universities={universities}
            teams={teams}
            selectedUniversity={editingItem.university || ''}
            setSelectedUniversity={() => {}}
            selectedTeam={editingItem.team || ''}
            setSelectedTeam={() => {}}
            onSubmit={handleEditMerch}
            submitLabel="Update Merchandise"
          />
      </Modal>
    )}
  </>
  );
}