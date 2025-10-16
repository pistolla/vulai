import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

export default function MerchTab({ items, remove, adminData }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', image: '', university: '', team: '' });

  const [universities, setUniversities] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load universities from Firebase API first
        const universitiesData = await apiService.getUniversities();
        if (universitiesData && universitiesData.length > 0) {
          setUniversities(universitiesData);
        } else {
          throw new Error('Empty Firebase universities data');
        }

        // Load teams for dropdowns
        const teamsData = await apiService.getTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to load data from Firebase:', error);
        // Fallback to local JSON files
        try {
          const universitiesResponse = await fetch('/data/universities.json');
          const teamsResponse = await fetch('/data/teams.json');
          if (universitiesResponse.ok) {
            const universitiesData = await universitiesResponse.json();
            setUniversities(universitiesData.universities || []);
          }
          if (teamsResponse.ok) {
            const teamsData = await teamsResponse.json();
            setTeams(teamsData.teams || []);
          }
        } catch (localError) {
          console.error('Failed to load local data:', localError);
          setUniversities([]);
          setTeams([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredTeams = teams.filter(team => !selectedUniversity || team.university === selectedUniversity);

  const handleAddMerch = async () => {
    try {
      await apiService.createMerchandise({
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        image: newItem.image || '/images/default-merch.jpg',
        university: newItem.university,
        team: newItem.team
      });
      alert('Merchandise added successfully!');
      setNewItem({ name: '', description: '', price: '', image: '', university: '', team: '' });
      setSelectedUniversity('');
      setSelectedTeam('');
      setShowAddForm(false);
    } catch (error) {
      alert('Failed to add merchandise: ' + (error as Error).message);
    }
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

  return (
    <div id="content-merchandise" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Merchandise Management</h2><p className="text-gray-600">Create team themes, designs, and manage merchandise.</p></div>
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Merchandise</button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Merchandise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newItem.image}
              onChange={(e) => setNewItem({...newItem, image: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <select
              value={selectedUniversity}
              onChange={(e) => handleUniversityChange(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">Select University</option>
              {universities.map(uni => (
                <option key={uni.id} value={uni.id}>{uni.name}</option>
              ))}
            </select>
            <select
              value={selectedTeam}
              onChange={(e) => handleTeamChange(e.target.value)}
              className="px-3 py-2 border rounded"
              disabled={!selectedUniversity}
            >
              <option value="">Select Team</option>
              {filteredTeams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddMerch} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add</button>
            <button onClick={() => setShowAddForm(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(items.length > 0 ? items : adminData.merchandise).map((m: any) => (
          <div key={m.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <img src={m.image} alt={m.name} className="rounded-lg mb-4" />
            <h3 className="font-bold text-lg text-gray-900">{m.name}</h3><p className="text-sm text-gray-600">{m.description}</p>
            <div className="flex items-center space-x-2 mt-2"><span className="text-2xl font-bold text-green-600">KSh {m.price}</span></div>
            <div className="flex space-x-2 mt-4"><button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">Edit</button><button onClick={() => remove(m.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}