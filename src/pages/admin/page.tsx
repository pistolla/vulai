import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import AdminGuard from '@/guards/AdminGuard';
import UserHeader from '@/components/UserHeader';
import { apiService, AdminData } from '../../services/apiService';
import { FiGrid, FiUsers, FiMap, FiAward, FiTarget, FiBox, FiCheckCircle, FiCalendar, FiPlus, FiX } from 'react-icons/fi';

// Import all tab components
import DashboardTab from '../../components/admin/DashboardTab';
import UsersTab from '../../components/admin/UsersTab';
import UniversitiesTab from '../../components/admin/UniversitiesTab';
import TeamsTab from '../../components/admin/TeamsTab';
import PlayersTab from '../../components/admin/PlayersTab';
import SportsTab from '../../components/admin/SportsTab';
import MerchTab from '../../components/admin/MerchTab';
import ReviewTab from '../../components/admin/ReviewTab';
import GamesTab from '../../components/admin/GamesTab';
import {
  fetchDashboard,
  fetchUsers,
  fetchMerch,
  fetchReviews,
  fetchGames,
  approveUserT,
  deleteUserT,
  createMerchT,
  removeMerchT,
  approveReviewT,
  rejectReviewT,
  updateScoreT,
  startGameT,
  endGameT,
} from '@/store/adminThunk';

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const [adminData, setAdminData] = useState<AdminData | null>({} as AdminData);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /* ---------- Redux state ---------- */
  const { stats } = useAppSelector(s => s.admin);
  const users = useAppSelector(s => s.users.rows);
  const merch = useAppSelector(s => s.merch.items);
  const reviews = useAppSelector(s => s.review.rows);
  const { live, upcoming } = useAppSelector(s => s.games);

  /* ---------- Local UI state ---------- */
  type TabId = 'dashboard' | 'users' | 'universities' | 'teams' | 'players' | 'sports' | 'merchandise' | 'review' | 'games';
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [modals, setModals] = useState({
    addUser: false,
    gameDetails: null as null | { id: string; teams: string; score: string; details: string; location: string },
  });

  /* ---------- Notification helper ---------- */
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /* ---------- Hydrate once ---------- */
  useEffect(() => {
    apiService.getAdminData()
      .then(data => setAdminData(data))
      .catch(error => {
        console.error('Failed to load admin data:', error);
        showNotification('Failed to load admin data', 'error');
      });

    dispatch(fetchDashboard());
    dispatch(fetchUsers());
    dispatch(fetchMerch());
    dispatch(fetchReviews());
    dispatch(fetchGames());
  }, []);

  /* ---------- Async CRUD handlers ---------- */
  const approveUser = async (uid: any) => {
    try {
      await dispatch(approveUserT(uid)).unwrap();
      showNotification('User approved successfully', 'success');
    } catch {
      showNotification('Failed to approve user', 'error');
    }
  };

  const deleteUser = async (uid: any) => {
    try {
      await dispatch(deleteUserT(uid)).unwrap();
      showNotification('User deleted successfully', 'success');
    } catch {
      showNotification('Failed to delete user', 'error');
    }
  };

  const createMerch = async (item: any) => {
    try {
      await dispatch(createMerchT(item)).unwrap();
      showNotification('Merchandise created successfully', 'success');
    } catch {
      showNotification('Failed to create merchandise', 'error');
    }
  };

  const removeMerch = async (id: any) => {
    try {
      await dispatch(removeMerchT(id)).unwrap();
      showNotification('Merchandise removed successfully', 'success');
    } catch {
      showNotification('Failed to remove merchandise', 'error');
    }
  };

  const approveReview = async (id: any) => {
    try {
      await dispatch(approveReviewT(id)).unwrap();
      showNotification('Review approved successfully', 'success');
    } catch {
      showNotification('Failed to approve review', 'error');
    }
  };

  const rejectReview = async (id: any) => {
    try {
      await dispatch(rejectReviewT(id)).unwrap();
      showNotification('Review rejected successfully', 'success');
    } catch {
      showNotification('Failed to reject review', 'error');
    }
  };

  const updateScore = async (id: any, home: any, away: any) => {
    try {
      await dispatch(updateScoreT({ id, home, away })).unwrap();
      showNotification('Score updated successfully', 'success');
    } catch {
      showNotification('Failed to update score', 'error');
    }
  };

  const startGame = async (id: any) => {
    try {
      await dispatch(startGameT(id)).unwrap();
      showNotification('Game started successfully', 'success');
    } catch {
      showNotification('Failed to start game', 'error');
    }
  };

  const endGame = async (id: any) => {
    try {
      await dispatch(endGameT(id)).unwrap();
      showNotification('Game ended successfully', 'success');
    } catch {
      showNotification('Failed to end game', 'error');
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
    { id: 'review', label: 'Reviews', icon: FiCheckCircle },
    { id: 'games', label: 'Live Games', icon: FiCalendar },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab stats={stats} live={live} users={users} upcoming={upcoming} openGame={(g: any) => open('gameDetails', g)} adminData={adminData} />;
      case 'users': return <UsersTab rows={users} approve={approveUser} deleteU={deleteUser} openAdd={() => open('addUser')} adminData={adminData} />;
      case 'universities': return <UniversitiesTab adminData={adminData} />;
      case 'teams': return <TeamsTab adminData={adminData} />;
      case 'players': return <PlayersTab adminData={adminData} />;
      case 'sports': return <SportsTab adminData={adminData} />;
      case 'merchandise': return <MerchTab items={merch} create={createMerch} remove={removeMerch} adminData={adminData} />;
      case 'review': return <ReviewTab rows={reviews} approve={approveReview} reject={rejectReview} adminData={adminData} />;
      case 'games': return <GamesTab live={live} upcoming={upcoming} updateScore={updateScore} startG={startGame} endG={endGame} />;
      default: return null;
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
        <UserHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Notification Overlay */}
          {notification && (
            <div className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-2xl transform transition-all animate-in slide-in-from-right duration-300 ${notification.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
              }`}>
              <div className="flex items-center space-x-3">
                {notification.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                <p className="font-bold">{notification.message}</p>
              </div>
            </div>
          )}

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

          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 min-h-[600px] shadow-sm">
            {renderContent()}
          </div>
        </main>
      </div>

      {modals.addUser && <AddUserModal close={() => close('addUser')} showNotification={showNotification} />}
      {modals.gameDetails && <GameDetailsModal data={modals.gameDetails} close={() => close('gameDetails')} />}
    </AdminGuard>
  );
}

function FiAlertCircle() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function AddUserModal({ close, showNotification }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'fan',
    university: ''
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await apiService.createUser({
        displayName: formData.name,
        email: formData.email,
        role: formData.role,
        universityId: formData.university
      });
      showNotification('User created successfully!', 'success');
      close();
    } catch (error) {
      showNotification('Failed to create user: ' + (error as Error).message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Add New User</h3>
          <button onClick={close} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><FiX className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
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
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
              placeholder="name@university.edu"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Role</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold appearance-none"
              >
                <option value="fan">Fan</option>
                <option value="correspondent">Correspondent</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">University ID</label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold"
                placeholder="UNILL-001"
              />
            </div>
          </div>
          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={close} className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95">Create User</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GameDetailsModal({ data, close }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="relative h-48 bg-blue-600 flex items-center justify-center">
          <button onClick={close} className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"><FiX className="w-6 h-6" /></button>
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
    </div>
  );
}
