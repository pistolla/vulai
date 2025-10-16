import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import AdminGuard from '@/guards/AdminGuard';
import UserHeader from '@/components/UserHeader';
import { apiService, AdminData } from '../../services/apiService';

// Import all tab components
import DashboardTab from '../../components/admin/DashboardTab';
import UsersTab from '../../components/admin/UsersTab';
import UniversitiesTab from '../../components/admin/UniversitiesTab';
import TeamsTab from '../../components/admin/TeamsTab';
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
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Redux state ---------- */
  const { stats }   = useAppSelector(s => s.admin);
  const users       = useAppSelector(s => s.users.rows);
  const merch       = useAppSelector(s => s.merch.items);
  const reviews     = useAppSelector(s => s.review.rows);
  const { live, upcoming } = useAppSelector(s => s.games);

  /* ---------- Local UI state ---------- */
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'universities' | 'teams' | 'sports' | 'merchandise' | 'review' | 'games'>('dashboard');
  const [modals, setModals] = useState({
    addUser: false,
    gameDetails: null as null | { id: string; teams: string; score: string; details: string; location: string },
  });

  /* ---------- Hydrate once ---------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiService.getAdminData();
        setAdminData(data);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    dispatch(fetchDashboard());
    dispatch(fetchUsers());
    dispatch(fetchMerch());
    dispatch(fetchReviews());
    dispatch(fetchGames());
  }, [dispatch]);

  /* ---------- Helpers ---------- */
  const open = (k: keyof typeof modals, v: any = true) => setModals(p => ({ ...p, [k]: v }));
  const close = (k: keyof typeof modals) => setModals(p => ({ ...p, [k]: k === 'gameDetails' ? null : false }));

  /* ---------- Tab content ---------- */
  const renderContent = () => {
    if (loading || !adminData) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin data...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
       case 'dashboard': return <DashboardTab stats={stats} live={live} users={users} upcoming={upcoming} openGame={(g: any) => open('gameDetails', g)} adminData={adminData} />;
       case 'users':     return <UsersTab rows={users} approve={(uid: any) => dispatch(approveUserT(uid))} deleteU={(uid: any) => dispatch(deleteUserT(uid))} openAdd={() => open('addUser')} adminData={adminData} />;
       case 'universities': return <UniversitiesTab adminData={adminData} />;
       case 'teams':     return <TeamsTab adminData={adminData} />;
       case 'sports':    return <SportsTab adminData={adminData} />;
       case 'merchandise': return <MerchTab items={merch} create={(item: any) => dispatch(createMerchT(item))} remove={(id: any) => dispatch(removeMerchT(id))} adminData={adminData} />;
       case 'review':    return <ReviewTab rows={reviews} approve={(id: any) => dispatch(approveReviewT(id))} reject={(id: any) => dispatch(rejectReviewT(id))} adminData={adminData} />;
       case 'games':     return <GamesTab live={live} upcoming={upcoming} updateScore={(id: any,h: any,a: any)=>dispatch(updateScoreT({id,home:h,away:a}))} startG={(id: any)=>dispatch(startGameT(id))} endG={(id: any)=>dispatch(endGameT(id))} />;
       default:          return null;
     }
  };

  return (
    <AdminGuard>
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ------- TABS ------- */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['dashboard','users','universities','teams','sports','merchandise','review','games'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`tab-button flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200
                ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 shadow-sm'}`}>
              <TabIcon tab={tab} />
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* ------- CONTENT ------- */}
        {renderContent()}
      </div>

      {/* ------- MODALS ------- */}
      {modals.addUser && <AddUserModal close={() => close('addUser')} />}
      {modals.gameDetails && <GameDetailsModal data={modals.gameDetails} close={() => close('gameDetails')} />}
    </AdminGuard>
  );
}

/* --------------------------------------------------
    Icon helper
-------------------------------------------------- */
function TabIcon({ tab }: { tab: string }) {
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
    ),
    universities: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l-9-5" /></svg>
    ),
    teams: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ),
    sports: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    merchandise: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7H6l-1-7z" /></svg>
    ),
    review: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    ),
    games: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    ),
  };
  return icons[tab] || null;
}

/* --------------------------------------------------
    Modals
-------------------------------------------------- */
function AddUserModal({ close }: any) {
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
      alert('User created successfully!');
      close();
    } catch (error) {
      alert('Failed to create user: ' + (error as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 modal-backdrop">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform scale-95 transition-transform duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Add New User</h3>
            <button onClick={close} className="text-gray-400 hover:text-gray-600"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="correspondent">Correspondent</option>
                <option value="fan">Fan</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">University</label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({...formData, university: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={close} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Add User</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function GameDetailsModal({ data, close }: any) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 modal-backdrop">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 transform scale-95 transition-transform duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900">{data.teams}</h3>
            <button onClick={close} className="text-gray-400 hover:text-gray-600"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 mb-4"><span className="text-5xl font-extrabold text-blue-600">{data.score}</span><p className="text-lg text-gray-600">{data.details}</p><p className="text-sm text-gray-500">{data.location}</p></div>
          <hr className="my-4" /><p className="text-sm text-gray-700 text-center mb-4">Follow the live action with play-by-play commentary.</p>
          <a href="#" target="_blank" className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">Go to Live Commentary</a>
        </div>
      </div>
    </div>
  );
}