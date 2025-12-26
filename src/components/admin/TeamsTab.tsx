import { useEffect, useState } from 'react';
import { apiService } from '@/services/apiService';

// Modal Component
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-8 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// Team Form Component
function TeamForm({ formData, setFormData, onSubmit, submitLabel }: any) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({...formData, logoURL: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Team Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. Eagles FC"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Sport</label>
          <select
            value={formData.sport}
            onChange={(e) => setFormData({...formData, sport: e.target.value})}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none"
          >
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="volleyball">Volleyball</option>
            <option value="rugby">Rugby</option>
            <option value="hockey">Hockey</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">University</label>
          <input
            type="text"
            value={formData.university}
            onChange={(e) => setFormData({...formData, university: e.target.value})}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. UNILL-001"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Coach</label>
          <input
            type="text"
            value={formData.coach}
            onChange={(e) => setFormData({...formData, coach: e.target.value})}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. John Smith"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Founded Year</label>
          <input
            type="number"
            value={formData.founded}
            onChange={(e) => setFormData({...formData, founded: e.target.value})}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. 2020"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">League</label>
          <input
            type="text"
            value={formData.league}
            onChange={(e) => setFormData({...formData, league: e.target.value})}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. Premier League"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-gray-900 dark:text-white"
          />
          {formData.logoURL && <img src={formData.logoURL} alt="Logo preview" className="mt-2 w-16 h-16 object-cover rounded" />}
        </div>
      </div>
      <div className="flex space-x-4 pt-4">
        <button type="button" className="flex-1 py-4 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
        <button type="submit" className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95">{submitLabel}</button>
      </div>
    </form>
  );
}

export default function TeamsTab({ adminData, create, update, deleteU }: any) {
  const [teams, setTeams] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    sport: 'football',
    university: '',
    coach: '',
    founded: '',
    league: '',
    logoURL: ''
  });
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    year: '',
    number: '',
    height: '',
    weight: ''
  });

  const resetNewTeam = () => {
    setNewTeam({
      name: '',
      sport: 'football',
      university: '',
      coach: '',
      founded: '',
      league: '',
      logoURL: ''
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load teams from Firebase API first
        const teamsData = await apiService.getTeams();
        if (teamsData && teamsData.length > 0) {
          setTeams(teamsData);
        } else {
          throw new Error('Empty Firebase teams data');
        }

        // Load universities for dropdown
        const universitiesData = await apiService.getUniversities();
        setUniversities(universitiesData);
      } catch (error) {
        console.error('Failed to load teams from Firebase:', error);
        // Fallback to local JSON files
        try {
          const teamsResponse = await fetch('/data/teams.json');
          const universitiesResponse = await fetch('/data/universities.json');
          if (teamsResponse.ok) {
            const teamsData = await teamsResponse.json();
            setTeams(teamsData.teams || []);
          }
          if (universitiesResponse.ok) {
            const universitiesData = await universitiesResponse.json();
            setUniversities(universitiesData.universities || []);
          }
        } catch (localError) {
          console.error('Failed to load local data:', localError);
          setTeams([]);
          setUniversities([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddTeam = async () => {
    await create({
      name: newTeam.name,
      sport: newTeam.sport,
      universityId: newTeam.university,
      coach: newTeam.coach,
      foundedYear: newTeam.founded ? parseInt(newTeam.founded) : undefined,
      league: newTeam.league,
      logoURL: newTeam.logoURL,
    });
    resetNewTeam();
    setShowAddModal(false);
  };

  const handleEditTeam = async () => {
    await update(editingTeam.id, {
      name: editingTeam.name,
      sport: editingTeam.sport,
      universityId: editingTeam.university,
      coach: editingTeam.coach,
      foundedYear: editingTeam.founded,
      league: editingTeam.league,
      logoURL: editingTeam.logoURL,
    });
    setEditingTeam(null);
    setShowEditModal(false);
  };

  const handleDeleteTeam = async (id: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      await deleteU(id);
    }
  };

  const handleAddPlayer = async () => {
    try {
      // This would need to be implemented in the API service
      alert('Add player functionality would be implemented here');
      setNewPlayer({ name: '', position: '', year: '', number: '', height: '', weight: '' });
    } catch (error) {
      alert('Failed to add player: ' + (error as Error).message);
    }
  };

  const handleDeletePlayer = async (teamId: string, playerName: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      try {
        // This would need to be implemented in the API service
        alert('Delete player functionality would be implemented here');
      } catch (error) {
        alert('Failed to delete player: ' + (error as Error).message);
      }
    }
  };

  return (
    <>
      <div id="content-teams" className="slide-in-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teams Management</h2><p className="text-gray-600 dark:text-gray-400">Manage teams and their players.</p></div>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Team</button>
        </div>

        {showPlayersModal && selectedTeam && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Players for {selectedTeam.name}</h3>
            <button onClick={() => setShowPlayersModal(false)} className="text-gray-600 hover:text-gray-900">Close</button>
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2">Add New Player</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Player Name"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Position"
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Year"
                value={newPlayer.year}
                onChange={(e) => setNewPlayer({...newPlayer, year: e.target.value})}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Number"
                value={newPlayer.number}
                onChange={(e) => setNewPlayer({...newPlayer, number: e.target.value})}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Height"
                value={newPlayer.height}
                onChange={(e) => setNewPlayer({...newPlayer, height: e.target.value})}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Weight"
                value={newPlayer.weight}
                onChange={(e) => setNewPlayer({...newPlayer, weight: e.target.value})}
                className="px-3 py-2 border rounded"
              />
            </div>
            <button onClick={handleAddPlayer} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Player</button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Height</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedTeam.players && selectedTeam.players.map((player: any, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{player.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{player.position || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{player.year || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{player.number || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{player.height || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{player.weight || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDeletePlayer(selectedTeam.id, player.name)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading teams...</p>
            </div>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">No teams found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Logo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sport</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">University</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Coach</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Players</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {team.logoURL ? (
                      <img src={team.logoURL} alt={`${team.name} logo`} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">No Logo</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 dark:text-white">{team.name}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.sport}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{universities.find(u => u.id === team.university)?.name || team.university}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.coach}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.players?.length || 0} players</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => { setSelectedTeam(team); setShowPlayersModal(true); }} className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-2">Players</button>
                    <button onClick={() => { setEditingTeam(team); setShowEditModal(true); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-2">Edit</button>
                    <button onClick={() => handleDeleteTeam(team.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>

    {/* Add Team Modal */}
    {showAddModal && (
      <Modal title="Add New Team" onClose={() => { setShowAddModal(false); resetNewTeam(); }}>
          <TeamForm
            formData={newTeam}
            setFormData={setNewTeam}
            onSubmit={handleAddTeam}
            submitLabel="Add Team"
          />
      </Modal>
    )}

    {/* Edit Team Modal */}
    {showEditModal && editingTeam && (
      <Modal title="Edit Team" onClose={() => { setShowEditModal(false); setEditingTeam(null); }}>
          <TeamForm
            formData={editingTeam}
            setFormData={setEditingTeam}
            onSubmit={handleEditTeam}
            submitLabel="Update Team"
          />
      </Modal>
    )}
  </>
  );
}