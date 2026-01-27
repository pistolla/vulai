import { useEffect, useState } from 'react';
import { apiService } from '@/services/apiService';
import Pagination from './Pagination';
import ExportButtons from './ExportButtons';
import { University, League } from '@/models';
import { firebaseLeagueService } from '@/services/firebaseCorrespondence';

import { Modal } from '@/components/common/Modal';

// Team Form Component
function TeamForm({ formData, setFormData, onSubmit, submitLabel, user }: any) {
  const [universities, setUniversities] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);

  const [leagues, setLeagues] = useState<League[]>([]);
  const [filteredLeagues, setFilteredLeagues] = useState<League[]>([]);

  useEffect(() => {
    // Load universities, sports, and leagues
    apiService.getUniversities().then(setUniversities).catch(console.error);
    apiService.getSports().then(setSports).catch(console.error);
    firebaseLeagueService.listLeagues().then(setLeagues).catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.sport) {
      // Filter leagues by sport name match (assuming league.sportType or league.sportName matches sport.name)
      // Adjusting matching logic: league.sportType stores sport name (e.g. 'Football')
      const filtered = leagues.filter(l => l.sportType?.toLowerCase() === formData.sport.toLowerCase());
      setFilteredLeagues(filtered);
    } else {
      setFilteredLeagues([]);
    }
  }, [formData.sport, leagues]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, logoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Optional chaining check for correspondent
  const isCorrespondent = user?.role === 'correspondent';

  useEffect(() => {
    if (isCorrespondent && user?.universityId) {
      setFormData((prev: any) => ({ ...prev, universityId: user.universityId }));
    }
  }, [isCorrespondent, user?.universityId, setFormData]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Team Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. Eagles FC"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Sport</label>
          <select
            value={formData.sport}
            onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none"
          >
            <option value="">Select Sport</option>
            {sports.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">University</label>
          <select
            value={formData.universityId}
            onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
            className={`w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none ${isCorrespondent ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isCorrespondent}
          >
            <option value="">Select University</option>
            {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Coach</label>
          <input
            type="text"
            value={formData.coach}
            onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. John Smith"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Founded Year</label>
          <input
            type="number"
            value={formData.foundedYear}
            onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. 2020"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">League</label>
          <select
            value={formData.league}
            onChange={(e) => setFormData({ ...formData, league: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none"
            disabled={!formData.sport}
          >
            <option value="">Select League</option>
            {filteredLeagues.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>
          {!formData.sport && <p className="text-xs text-red-400 mt-1">Select a sport first</p>}
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Record</label>
          <input
            type="text"
            value={formData.record}
            onChange={(e) => setFormData({ ...formData, record: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. 11-0-1"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Championships</label>
          <input
            type="text"
            value={formData.championships}
            onChange={(e) => setFormData({ ...formData, championships: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. Count or list"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Season</label>
          <input
            type="text"
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. 2024/25"
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

import { useAppSelector } from '@/hooks/redux';

export default function TeamsTab({ adminData, create, update, deleteU, addPlayer, updatePlayer, deletePlayer }: any) {
  const user = useAppSelector(state => state.auth.user);
  const teams = useAppSelector(state => state.admin.teams);
  const universities = useAppSelector(state => state.admin.universities);

  // Local state for modals and selection
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newTeam, setNewTeam] = useState({
    name: '',
    sport: 'football',
    universityId: '',
    coach: '',
    foundedYear: '',
    league: '',
    logoURL: '',
    record: '',
    championships: '',
    season: '',
    stats: {}
  });
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    year: '',
    number: '',
    height: '',
    weight: '',
    team: '',
    university: '',
    avatar: ''
  });

  const resetNewTeam = () => {
    setNewTeam({
      name: '',
      sport: 'football',
      universityId: '',
      coach: '',
      foundedYear: '',
      league: '',
      logoURL: '',
      record: '',
      championships: '',
      season: '',
      stats: {}
    });
  };

  const resetNewPlayer = () => {
    setNewPlayer({
      name: '',
      position: '',
      year: '',
      number: '',
      height: '',
      weight: '',
      team: '',
      university: '',
      avatar: ''
    });
  };

  const handleAddTeam = async () => {
    await create({
      name: newTeam.name,
      sport: newTeam.sport,
      universityId: newTeam.universityId,
      coach: newTeam.coach,
      foundedYear: newTeam.foundedYear ? parseInt(newTeam.foundedYear) : undefined,
      league: newTeam.league,
      logoURL: newTeam.logoURL,
      record: newTeam.record,
      championships: newTeam.championships,
      season: newTeam.season,
      stats: newTeam.stats,
    });
    resetNewTeam();
    setShowAddModal(false);
  };

  const handleEditTeam = async () => {
    await update(editingTeam.id, {
      name: editingTeam.name,
      sport: editingTeam.sport,
      universityId: editingTeam.universityId,
      coach: editingTeam.coach,
      foundedYear: editingTeam.foundedYear,
      league: editingTeam.league,
      logoURL: editingTeam.logoURL,
      record: editingTeam.record,
      championships: editingTeam.championships,
      season: editingTeam.season,
      stats: editingTeam.stats,
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
      await addPlayer(selectedTeam.id, newPlayer);
      resetNewPlayer();
      setShowAddPlayerModal(false);
    } catch (error) {
      alert('Failed to add player: ' + (error as Error).message);
    }
  };

  const handleEditPlayer = async () => {
    try {
      await updatePlayer(selectedTeam.id, editingPlayer.id, editingPlayer);
      setEditingPlayer(null);
      setShowEditPlayerModal(false);
    } catch (error) {
      alert('Failed to update player: ' + (error as Error).message);
    }
  };

  const handleDeletePlayer = async (teamId: string, playerId: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      try {
        await deletePlayer(teamId, playerId);
      } catch (error) {
        alert('Failed to delete player: ' + (error as Error).message);
      }
    }
  };

  const totalPages = Math.ceil(teams.length / itemsPerPage);
  const paginatedTeams = teams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Export data
  const exportData = teams.map((team: any) => ({
    name: team.name,
    sport: team.sport,
    university: universities.find((u: University) => u.id === team.universityId)?.name || 'N/A',
    coach: team.coach,
    players: team.players?.length || 0
  }));
  const exportHeaders = ['name', 'sport', 'university', 'coach', 'players'];

  return (
    <>
      <div id="content-teams" className="slide-in-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teams Management</h2><p className="text-gray-600 dark:text-gray-400">Manage teams and their players.</p></div>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Team</button>
        </div>

        {showPlayersModal && selectedTeam && (
          <div className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Players for {selectedTeam.name}</h3>
              <button onClick={() => setShowPlayersModal(false)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Close</button>
            </div>

            <div className="mb-4">
              <button onClick={() => setShowAddPlayerModal(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add New Player</button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Position</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Year</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Number</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Height</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Weight</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedTeam.players && selectedTeam.players.map((player: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{player.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.position || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.year || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.number || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.height || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.weight || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => { setEditingPlayer(player); setShowEditPlayerModal(true); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-2">Edit</button>
                        <button onClick={() => handleDeletePlayer(selectedTeam.id, player.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-6">
          {teams.length > 0 && <ExportButtons data={exportData} headers={exportHeaders} filename="teams" />}
          {teams.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-gray-400">No teams found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto custom-scrollbar">
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
                    {paginatedTeams.map((team: any) => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{universities.find((u: University) => u.id === team.universityId)?.name || 'N/A'}</td>
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
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>

      {/* Add Team Modal */}
      <Modal isOpen={showAddModal} title="Add New Team" onClose={() => { setShowAddModal(false); resetNewTeam(); }} fullScreen={true}>
        <TeamForm
          formData={newTeam}
          setFormData={setNewTeam}
          onSubmit={handleAddTeam}
          submitLabel="Add Team"
          user={user}
        />
      </Modal>

      {/* Edit Team Modal */}
      <Modal isOpen={showEditModal && !!editingTeam} title="Edit Team" onClose={() => { setShowEditModal(false); setEditingTeam(null); }} fullScreen={true}>
        {editingTeam && (
          <TeamForm
            formData={editingTeam}
            setFormData={setEditingTeam}
            onSubmit={handleEditTeam}
            submitLabel="Update Team"
            user={user}
          />
        )}
      </Modal>

      {/* Add Player Modal */}
      <Modal isOpen={showAddPlayerModal} title="Add New Player" onClose={() => { setShowAddPlayerModal(false); resetNewPlayer(); }} fullScreen={true}>
        <form onSubmit={(e) => { e.preventDefault(); handleAddPlayer(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                required
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
              <input
                type="text"
                required
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
              <select
                value={newPlayer.year}
                onChange={(e) => setNewPlayer({ ...newPlayer, year: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number</label>
              <input
                type="text"
                value={newPlayer.number}
                onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height</label>
              <input
                type="text"
                value={newPlayer.height}
                onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight</label>
              <input
                type="text"
                value={newPlayer.weight}
                onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Team</label>
              <select
                value={newPlayer.team || selectedTeam?.name || ''}
                onChange={(e) => setNewPlayer({ ...newPlayer, team: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Team</option>
                {teams.map((team: any) => (
                  <option key={team.id} value={team.name}>{team.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">University</label>
              <select
                value={newPlayer.university || universities.find((u: University) => u.id === selectedTeam?.universityId)?.name || ''}
                onChange={(e) => setNewPlayer({ ...newPlayer, university: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select University</option>
                {universities.map((university: any) => (
                  <option key={university.id} value={university.name}>{university.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar</label>
              <input
                type="text"
                value={newPlayer.avatar}
                onChange={(e) => setNewPlayer({ ...newPlayer, avatar: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Add Player
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Player Modal */}
      <Modal isOpen={showEditPlayerModal && !!editingPlayer} title="Edit Player" onClose={() => { setShowEditPlayerModal(false); setEditingPlayer(null); }} fullScreen={true}>
        {editingPlayer && (
          <form onSubmit={(e) => { e.preventDefault(); handleEditPlayer(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  required
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
                <input
                  type="text"
                  required
                  value={editingPlayer.position}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, position: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                <select
                  value={editingPlayer.year}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, year: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Year</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number</label>
                <input
                  type="text"
                  value={editingPlayer.number}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height</label>
                <input
                  type="text"
                  value={editingPlayer.height}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, height: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight</label>
                <input
                  type="text"
                  value={editingPlayer.weight}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, weight: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Team</label>
                <select
                  value={editingPlayer.team || selectedTeam?.name || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, team: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Team</option>
                  {teams.map((team: any) => (
                    <option key={team.id} value={team.name}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">University</label>
                <select
                  value={editingPlayer.university || universities.find((u: University) => u.id === selectedTeam?.universityId)?.name || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, university: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select University</option>
                  {universities.map((university: any) => (
                    <option key={university.id} value={university.name}>{university.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar</label>
                <input
                  type="text"
                  value={editingPlayer.avatar}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, avatar: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Update Player
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}