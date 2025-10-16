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

// Team Form Component
function TeamForm({ formData, setFormData, onSubmit, submitLabel }: any) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Team Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sport</label>
          <select
            value={formData.sport}
            onChange={(e) => setFormData({...formData, sport: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="volleyball">Volleyball</option>
            <option value="rugby">Rugby</option>
            <option value="hockey">Hockey</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">University</label>
          <input
            type="text"
            value={formData.university}
            onChange={(e) => setFormData({...formData, university: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coach</label>
          <input
            type="text"
            value={formData.coach}
            onChange={(e) => setFormData({...formData, coach: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Founded Year</label>
          <input
            type="number"
            value={formData.founded}
            onChange={(e) => setFormData({...formData, founded: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">League</label>
          <input
            type="text"
            value={formData.league}
            onChange={(e) => setFormData({...formData, league: e.target.value})}
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

export default function TeamsTab({ adminData }: any) {
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
    league: ''
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
      league: ''
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
    try {
      // This would need to be implemented in the API service
      alert('Add team functionality would be implemented here');
      setNewTeam({ name: '', sport: 'football', university: '', coach: '', founded: '', league: '' });
      setShowAddModal(false);
    } catch (error) {
      alert('Failed to add team: ' + (error as Error).message);
    }
  };

  const handleEditTeam = async () => {
    try {
      // This would need to be implemented in the API service
      alert('Edit team functionality would be implemented here');
      setEditingTeam(null);
    } catch (error) {
      alert('Failed to edit team: ' + (error as Error).message);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      try {
        // This would need to be implemented in the API service
        alert('Delete team functionality would be implemented here');
      } catch (error) {
        alert('Failed to delete team: ' + (error as Error).message);
      }
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
    <div id="content-teams" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Teams Management</h2><p className="text-gray-600">Manage teams and their players.</p></div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Team</button>
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

      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading teams...</p>
            </div>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No teams found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{team.name}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.sport}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{universities.find(u => u.id === team.university)?.name || team.university}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.coach}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.players?.length || 0} players</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => { setSelectedTeam(team); setShowPlayersModal(true); }} className="text-green-600 hover:text-green-900 mr-2">Players</button>
                    <button onClick={() => { setEditingTeam(team); setShowEditModal(true); }} className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                    <button onClick={() => handleDeleteTeam(team.id)} className="text-red-600 hover:text-red-900">Delete</button>
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