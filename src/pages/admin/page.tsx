import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import AdminGuard from '@/guards/AdminGuard';
import UserHeader from '@/components/UserHeader';
import { apiService, AdminData } from '../../services/apiService';
import { ToastProvider, useToast } from '@/components/common/ToastProvider';
import { FiGrid, FiUsers, FiMap, FiAward, FiTarget, FiBox, FiCheckCircle, FiCalendar, FiPlus, FiX, FiPackage, FiUser } from 'react-icons/fi';
import { Modal } from '@/components/common/Modal';
import DashboardTab from '../../components/admin/DashboardTab';
import UsersTab from '../../components/admin/UsersTab';
import UniversitiesTab from '../../components/admin/UniversitiesTab';
import TeamsTab from '../../components/admin/TeamsTab';
import PlayersTab from '../../components/admin/PlayersTab';
import SportsTab from '../../components/admin/SportsTab';
import MerchTab from '../../components/admin/MerchTab';
import StoreTab from '../../components/admin/StoreTab';
import ManagerTab from '../../components/admin/ManagerTab';
import ReviewTab from '../../components/admin/ReviewTab';
import GamesTab from '../../components/admin/GamesTab';
import { ImportedDataTab } from '../../components/admin/ImportedDataTab';
import {
  fetchDashboard,
  fetchUsers,
  fetchMerch,
  fetchReviews,
  fetchGames,
  fetchUniversities,
  fetchPlayers,
  approveUserT,
  disapproveUserT,
  deleteUserT,
  createMerchT,
  removeMerchT,
  approveReviewT,
  rejectReviewT,
  updateScoreT,
  startGameT,
  endGameT,
  createUniversityT,
  saveUniversityT,
  removeUniversityT,
  fetchTeams,
  createTeamT,
  saveTeamT,
  removeTeamT,
  addPlayerToTeamT,
  updatePlayerInTeamT,
  deletePlayerFromTeamT,
  fetchImportedData,
} from '@/store/adminThunk';

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const [adminData, setAdminData] = useState<AdminData | null>({} as AdminData);
  const { success, error: showError } = useToast();

  /* ---------- Redux state ---------- */
  const { stats, universities } = useAppSelector(s => s.admin);
  const users = useAppSelector(s => s.users.rows);
  const merch = useAppSelector(s => s.merch.items);
  const reviews = useAppSelector(s => s.review.rows);
  const { live, upcoming } = useAppSelector(s => s.games);

  /* ---------- Local UI state ---------- */
  type TabId = 'dashboard' | 'users' | 'universities' | 'teams' | 'players' | 'sports' | 'merchandise' | 'store' | 'manager' | 'review' | 'games' | 'importedData';
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [modals, setModals] = useState({
    addUser: false,
    gameDetails: null as null | { id: string; teams: string; score: string; details: string; location: string },
    profileModal: null as null | { uid: string; user: any },
  });

  /* ---------- Notification helper (legacy, use toast instead) ---------- */
  const showNotification = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      success(message, 'Action completed', 'Continue managing users');
    } else {
      showError(message, 'Please try again or contact support');
    }
  };

  /* ---------- Hydrate once ---------- */
  useEffect(() => {
    apiService.getAdminData()
      .then(data => setAdminData(data))
      .catch(error => {
        console.error('Failed to load admin data:', error);
        showError('Failed to load admin data', 'Please refresh the page to try again');
      });

    dispatch(fetchDashboard());
    dispatch(fetchUsers());
    dispatch(fetchMerch());
    dispatch(fetchReviews());
    dispatch(fetchGames());
    dispatch(fetchUniversities());
    dispatch(fetchPlayers());
    dispatch(fetchTeams());
    dispatch(fetchImportedData());
  }, []);

  /* ---------- Async CRUD handlers ---------- */
  const approveUser = async (uid: any) => {
    try {
      await dispatch(approveUserT(uid)).unwrap();
      dispatch(fetchUsers());
      success('User approved successfully', 'The user can now access correspondent features', 'View user details or manage permissions');
    } catch {
      showError('Failed to approve user', 'Please try again or contact support');
    }
  };

  const disapproveUser = async (uid: any) => {
    try {
      await dispatch(disapproveUserT(uid)).unwrap();
      dispatch(fetchUsers());
      success('User disapproved successfully', 'The user has been restricted from correspondent features', 'Re-approve if needed');
    } catch {
      showError('Failed to disapprove user', 'Please try again or contact support');
    }
  };

  const deleteUser = async (uid: any) => {
    try {
      await dispatch(deleteUserT(uid)).unwrap();
      dispatch(fetchUsers());
      success('User deleted successfully', 'The user account has been removed', 'Add a new user if needed');
    } catch {
      showError('Failed to delete user', 'Please try again or contact support');
    }
  };

  const createMerch = async (item: any) => {
    try {
      await dispatch(createMerchT(item)).unwrap();
      success('Merchandise created successfully', 'The item is now available in your store', 'Add more items or manage inventory');
    } catch {
      showError('Failed to create merchandise', 'Please check your input and try again');
    }
  };

  const removeMerch = async (id: any) => {
    try {
      await dispatch(removeMerchT(id)).unwrap();
      success('Merchandise removed successfully', 'The item has been removed from your store', 'Add new items or view remaining inventory');
    } catch {
      showError('Failed to remove merchandise', 'Please try again or contact support');
    }
  };

  const approveReview = async (id: any) => {
    try {
      await dispatch(approveReviewT(id)).unwrap();
      success('Review approved successfully', 'The review is now visible publicly', 'View more reviews or manage settings');
    } catch {
      showError('Failed to approve review', 'Please try again or contact support');
    }
  };

  const rejectReview = async (id: any) => {
    try {
      await dispatch(rejectReviewT(id)).unwrap();
      success('Review rejected successfully', 'The review has been hidden from public view', 'View other reviews or take further action');
    } catch {
      showError('Failed to reject review', 'Please try again or contact support');
    }
  };

  const updateScore = async (id: any, home: any, away: any) => {
    try {
      await dispatch(updateScoreT({ id, home, away })).unwrap();
      success('Score updated successfully', 'The match score has been updated live', 'Continue updating or end the game');
    } catch {
      showError('Failed to update score', 'Please try again or refresh the page');
    }
  };

  const startGame = async (id: any) => {
    try {
      await dispatch(startGameT(id)).unwrap();
      success('Game started successfully', 'Live commentary and tracking are now active', 'Update the score or add commentary');
    } catch {
      showError('Failed to start game', 'Please try again or contact support');
    }
  };

  const endGame = async (id: any) => {
    try {
      await dispatch(endGameT(id)).unwrap();
      success('Game ended successfully', 'Final results have been recorded', 'View match stats or schedule next game');
    } catch {
      showError('Failed to end game', 'Please try again or contact support');
    }
  };

  const createUniversity = async (uni: any) => {
    try {
      await dispatch(createUniversityT(uni)).unwrap();
      dispatch(fetchUniversities());
      success('University created successfully', 'The university is now available for team registration', 'Add teams or create a league');
    } catch {
      showError('Failed to create university', 'Please check the input and try again');
    }
  };

  const updateUniversity = async (id: string, data: any) => {
    try {
      await dispatch(saveUniversityT({ id, data })).unwrap();
      dispatch(fetchUniversities());
      success('University updated successfully', 'Changes have been saved', 'Add more universities or manage existing ones');
    } catch {
      showError('Failed to update university', 'Please try again or contact support');
    }
  };

  const deleteUniversity = async (id: string) => {
    try {
      await dispatch(removeUniversityT(id)).unwrap();
      dispatch(fetchUniversities());
      success('University deleted successfully', 'The university has been removed', 'Add a new university if needed');
    } catch {
      showError('Failed to delete university', 'Please try again or contact support');
    }
  };

  const createTeam = async (team: any) => {
    try {
      await dispatch(createTeamT(team)).unwrap();
      dispatch(fetchTeams());
      success('Team created successfully', 'The team is now registered and can join leagues', 'Add players to the team or create more teams');
    } catch {
      showError('Failed to create team', 'Please check your input and try again');
    }
  };

  const updateTeam = async (id: string, data: any) => {
    try {
      await dispatch(saveTeamT({ id, data })).unwrap();
      dispatch(fetchTeams());
      success('Team updated successfully', 'Changes have been saved', 'Manage team details or add players');
    } catch {
      showError('Failed to update team', 'Please try again or contact support');
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      await dispatch(removeTeamT(id)).unwrap();
      dispatch(fetchTeams());
      success('Team deleted successfully', 'The team has been removed from the system', 'Create a new team or manage existing ones');
    } catch {
      showError('Failed to delete team', 'Please try again or contact support');
    }
  };

  const addPlayerToTeam = async (teamId: string, player: any) => {
    try {
      await dispatch(addPlayerToTeamT({ teamId, player })).unwrap();
      dispatch(fetchTeams());
      success('Player added successfully', 'The player is now part of the team', 'Add more players or update team roster');
    } catch {
      showError('Failed to add player', 'Please check the player details and try again');
    }
  };

  const updatePlayerInTeam = async (teamId: string, playerId: string, playerData: any) => {
    try {
      await dispatch(updatePlayerInTeamT({ teamId, playerId, playerData })).unwrap();
      dispatch(fetchTeams());
      success('Player updated successfully', 'Changes have been saved', 'Continue editing or view team roster');
    } catch {
      showError('Failed to update player', 'Please try again or contact support');
    }
  };

  const deletePlayerFromTeam = async (teamId: string, playerId: string) => {
    try {
      await dispatch(deletePlayerFromTeamT({ teamId, playerId })).unwrap();
      dispatch(fetchTeams());
      success('Player deleted successfully', 'The player has been removed from the team', 'Add new players if needed');
    } catch {
      showError('Failed to delete player', 'Please try again or contact support');
    }
  };

  const open = (k: keyof typeof modals, v: any = true) => setModals(p => ({ ...p, [k]: v }));
  const close = (k: keyof typeof modals) => setModals(p => ({ ...p, [k]: k === 'gameDetails' ? null : false }));

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Overview', icon: FiGrid },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'universities', label: 'Universities', icon: FiMap },
    { id: 'teams', label: 'Teams', icon: FiAward },
    { id: 'players', label: 'Players', icon: FiTarget },
    { id: 'sports', label: 'Sports', icon: FiGrid },
    { id: 'merchandise', label: 'Merchandise', icon: FiBox },
    { id: 'store', label: 'Store Stock', icon: FiPackage },
    { id: 'manager', label: 'Manager', icon: FiUser },
    { id: 'review', label: 'Reviews', icon: FiCheckCircle },
    { id: 'games', label: 'Live Games', icon: FiCalendar },
    { id: 'importedData', label: 'Data Imports', icon: FiBox },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab stats={stats} live={live} users={users} upcoming={upcoming} openGame={(g: any) => open('gameDetails', g)} adminData={adminData} />;
      case 'users': return <UsersTab rows={users} approve={approveUser} disapprove={disapproveUser} deleteU={deleteUser} openAdd={() => open('addUser')} adminData={adminData} viewProfile={(uid: string) => open('profileModal', { uid, user: users.find((u: any) => u.uid === uid) })} />;
      case 'universities': return <UniversitiesTab adminData={adminData} create={createUniversity} update={updateUniversity} deleteU={deleteUniversity} />;
      case 'teams': return <TeamsTab adminData={adminData} create={createTeam} update={updateTeam} deleteU={deleteTeam} addPlayer={addPlayerToTeam} updatePlayer={updatePlayerInTeam} deletePlayer={deletePlayerFromTeam} />;
      case 'players': return <PlayersTab adminData={adminData} />;
      case 'sports': return <SportsTab adminData={adminData} />;
      case 'merchandise': return <MerchTab items={merch} create={createMerch} remove={removeMerch} adminData={adminData} />;
      case 'store': return <StoreTab adminData={adminData} />;
      case 'manager': return <ManagerTab adminData={adminData} />;
      case 'review': return <ReviewTab rows={reviews} approve={approveReview} reject={rejectReview} adminData={adminData} />;
      case 'games': return <GamesTab live={live} upcoming={upcoming} updateScore={updateScore} startG={startGame} endG={endGame} />;
      case 'importedData': return <ImportedDataTab />;
      default: return null;
    }
  };

  return (
    <ToastProvider>
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
          <UserHeader />

          <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Admin Terminal</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">System management and content moderation portal</p>
            </div>

            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 active:scale-95'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <tab.icon className={activeTab === tab.id ? 'w-5 h-5' : 'w-5 h-5 opacity-70'} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-4 sm:p-8 min-h-[600px] shadow-sm">
            {renderContent()}
          </div>
        </main>
      </div>

      <Modal isOpen={modals.addUser} title="Add New User" onClose={() => close('addUser')} fullScreen={true}>
        <AddUserForm close={() => close('addUser')} universities={universities} dispatch={dispatch} />
      </Modal>

      <Modal isOpen={!!modals.gameDetails} title="Game Details" onClose={() => close('gameDetails')} fullScreen={true}>
        {modals.gameDetails && <GameDetailsContent data={modals.gameDetails} />}
      </Modal>

      <Modal isOpen={!!modals.profileModal} title="Correspondent Profile" onClose={() => close('profileModal')} fullScreen={true}>
        {modals.profileModal && <ProfileContent data={modals.profileModal} />}
      </Modal>
      </AdminGuard>
    </ToastProvider>
  );
}

function AddUserForm({ close, universities, dispatch }: any) {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'fan',
    university: ''
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const { register } = await import('@/services/firebase');
      await register(formData.email, formData.password, formData.role as any, {
        displayName: formData.name,
        universityId: formData.university
      });
      dispatch(fetchUsers());
      success('User created successfully', 'The new user can now log in', 'Assign roles or manage permissions');
      close();
    } catch (error) {
      showError('Failed to create user: ' + (error as Error).message, 'Please check the input and try again');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="e.g. John Doe"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="name@university.edu"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
            placeholder="Enter a temporary password"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">Role</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none"
            >
              <option value="fan">Fan</option>
              <option value="correspondent">Correspondent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">University</label>
            <select
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none"
            >
              <option value="">Select University</option>
              {universities.map((uni: any) => (
                <option key={uni.id} value={uni.id}>{uni.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex space-x-4 pt-4">
          <button type="button" onClick={close} className="flex-1 py-4 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
          <button type="submit" className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95">Create User</button>
        </div>
      </form>
    </div>
  );
}

function GameDetailsContent({ data }: any) {
  return (
    <div className="w-full overflow-hidden">
      <div className="relative h-48 bg-blue-600 flex items-center justify-center -mx-6 -mt-6 mb-6">
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full mb-2 mx-auto" />
            <p className="text-white font-black uppercase tracking-widest text-xs">Home</p>
          </div>
          <div className="text-white text-6xl font-black">VS</div>
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full mb-2 mx-auto" />
            <p className="text-white font-black uppercase tracking-widest text-xs">Away</p>
          </div>
        </div>
      </div>
      <div className="p-10 text-center">
        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{data.teams}</h3>
        <p className="text-blue-600 dark:text-blue-400 font-black text-5xl my-6">{data.score}</p>
        <div className="inline-flex items-center space-x-4 text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800 px-6 py-3 rounded-full mb-8">
          <span>{data.details}</span>
          <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <span>{data.location}</span>
        </div>
        <a href="#" target="_blank" className="block w-full text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-5 rounded-[1.5rem] hover:scale-[1.02] transition-all font-black shadow-xl">Enter Commentary Booth</a>
      </div>
    </div>
  );
}

function ProfileContent({ data }: any) {
  const { uid } = data;
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          let universityName = 'N/A';
          if (userData.universityId) {
            const uniDoc = await getDoc(doc(db, 'universities', userData.universityId));
            if (uniDoc.exists()) {
              universityName = uniDoc.data().name;
            }
          }
          setProfileData({ ...userData, universityName });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
          {profileData.avatar ? (
            <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">{profileData.displayName?.slice(0, 2).toUpperCase() || 'CO'}</span>
          )}
        </div>
        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{profileData.displayName || 'N/A'}</h4>
        <p className="text-gray-500 dark:text-gray-400">{profileData.email}</p>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Role:</span>
          <span className="font-medium text-gray-900 dark:text-white">{profileData.role}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${profileData.status === true ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{profileData.status === true ? 'Active' : 'Pending'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">University:</span>
          <span className="font-medium text-gray-900 dark:text-white">{profileData.universityName}</span>
        </div>
        {profileData.lastLogin && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
            <span className="font-medium text-gray-900 dark:text-white">{new Date(profileData.lastLogin).toLocaleString()}</span>
          </div>
        )}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Consent Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Consent Signed:</span>
              <span className={`font-medium ${profileData.consentSigned ? 'text-green-600' : 'text-red-600'}`}>{profileData.consentSigned ? 'Yes' : 'No'}</span>
            </div>
            {profileData.consentData && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gmail:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{profileData.consentData.gmailAccount || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{profileData.consentData.phoneNumber || 'N/A'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
