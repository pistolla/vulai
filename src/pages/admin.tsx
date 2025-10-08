import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import AdminGuard from '@/guards/AdminGuard';
import UserHeader from '@/components/UserHeader';
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

  /* ---------- Redux state ---------- */
  const { stats }   = useAppSelector(s => s.admin);
  const users       = useAppSelector(s => s.users.rows);
  const merch       = useAppSelector(s => s.merch.items);
  const reviews     = useAppSelector(s => s.review.rows);
  const { live, upcoming } = useAppSelector(s => s.games);

  /* ---------- Local UI state ---------- */
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'merchandise' | 'review' | 'games'>('dashboard');
  const [modals, setModals] = useState({
    addUser: false,
    gameDetails: null as null | { id: string; teams: string; score: string; details: string; location: string },
  });

  /* ---------- Hydrate once ---------- */
  useEffect(() => {
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
    switch (activeTab) {
      case 'dashboard': return <DashboardTab stats={stats} live={live} users={users} upcoming={upcoming} openGame={(g: any) => open('gameDetails', g)} />;
      case 'users':     return <UsersTab rows={users} approve={(uid: any) => dispatch(approveUserT(uid))} deleteU={(uid: any) => dispatch(deleteUserT(uid))} openAdd={() => open('addUser')} />;
      case 'merchandise': return <MerchTab items={merch} create={(item: any) => dispatch(createMerchT(item))} remove={(id: any) => dispatch(removeMerchT(id))} />;
      case 'review':    return <ReviewTab rows={reviews} approve={(id: any) => dispatch(approveReviewT(id))} reject={(id: any) => dispatch(rejectReviewT(id))} />;
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
          {(['dashboard','users','merchandise','review','games'] as const).map(tab => (
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
   Tab panels (identical HTML → JSX)
-------------------------------------------------- */
function DashboardTab({ stats, live, users, upcoming, openGame }: any) {
  return (
    <div id="content-dashboard" className="slide-in-left">
      {/* stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard color="blue"  value={stats.users}      label="Total Users"     change="+12%" />
        <StatCard color="green" value={stats.liveGames}  label="Live Games"      change="+3"   />
        <StatCard color="purple"value={`KSh ${stats.merchSales}`} label="Merchandise Sales" change="+8%" />
        <StatCard color="orange"value={stats.pendingReviews} label="Pending Reviews" change="-2"   />
      </div>

      {/* map */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Live Games Across Kenya</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><span>Live</span>
            <div className="w-2 h-2 bg-yellow-500 rounded-full ml-4" /><span>Upcoming</span>
          </div>
        </div>
        <KenyaMap live={live} upcoming={upcoming} onPin={openGame} />
        <p className="text-gray-600 mt-4 text-center italic">Click on the pins to view live game details and commentary</p>
      </div>

      {/* bottom grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityFeed users={users} />
        <Schedule upcoming={upcoming} />
      </div>
    </div>
  );
}

function StatCard({ color, value, label, change }: any) {
  const grad = `bg-gradient-to-br from-${color}-500 to-${color}-600`;
  return (
    <div className={`p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200 float ${grad}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-100 text-sm`}>{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className={`text-${color}-200 text-xs mt-1`}>↗ {change}</p>
        </div>
        <svg className={`w-10 h-10 text-${color}-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      </div>
    </div>
  );
}

function KenyaMap({ live, upcoming, onPin }: any) {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500">
      <svg viewBox="0 0 800 600" className="w-full h-full">
        <defs>
          <linearGradient id="kenyaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
          </linearGradient>
          <filter id="shadow"><feDropShadow dx="3" dy="3" stdDeviation="3" floodOpacity="0.3" /></filter>
        </defs>
        <path d="M150 100 L650 120 L680 200 L650 350 L600 450 L400 480 L200 460 L120 350 L100 200 Z" fill="url(#kenyaGradient)" stroke="#059669" strokeWidth="3" filter="url(#shadow)" />
        <circle cx="400" cy="280" r="3" fill="#374151" opacity="0.6" /><text x="405" y="275" className="fill-gray-700 text-xs font-medium">Nairobi</text>
        <circle cx="280" cy="400" r="2" fill="#374151" opacity="0.6" /><text x="285" y="395" className="fill-gray-700 text-xs">Mombasa</text>
        <circle cx="320" cy="200" r="2" fill="#374151" opacity="0.6" /><text x="325" y="195" className="fill-gray-700 text-xs">Nakuru</text>
        <text x="400" y="320" textAnchor="middle" className="fill-green-800 font-bold text-2xl opacity-20">KENYA</text>

        {live.map((g: any) => (
          <g key={g.id} className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onPin({ id: g.id, teams: `${g.homeTeamName} vs ${g.awayTeamName}`, score: `${g.score?.home ?? 0} - ${g.score?.away ?? 0}`, details: `Football • ${g.minute}'`, location: g.venue })}>
            <circle cx={350} cy={220} r="25" fill="#dc2626" className="animate-pulse" opacity="0.8" />
            <circle cx={350} cy={220} r="20" fill="#ef4444" /><circle cx={350} cy={220} r="15" fill="#fca5a5" />
            <text x={350} y={225} textAnchor="middle" className="fill-white font-bold text-xs">LIVE</text>
            <rect x={280} y={160} width="140" height="35" fill="white" rx="5" className="shadow-lg" stroke="#e5e7eb" />
            <text x={350} y={175} textAnchor="middle" className="fill-gray-800 font-bold text-xs">{g.homeTeamName} vs {g.awayTeamName}</text>
            <text x={350} y={187} textAnchor="middle" className="fill-blue-600 text-xs">{g.score?.home ?? 0} - {g.score?.away ?? 0} • {g.minute}' • Football</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ActivityFeed({ users }: any) {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Recent User Activity</h3>
      <div className="space-y-3">
        {users.slice(0, 3).map((u: any) => (
          <div key={u.uid} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center"><span className="text-white font-bold text-sm">{u.name.slice(0, 2).toUpperCase()}</span></div>
            <div className="flex-1"><p className="font-semibold text-gray-900">{u.name}</p><p className="text-sm text-gray-600">{u.role} • {u.university || '—'}</p><p className="text-xs text-gray-500">Registered recently</p></div>
            <div className="flex flex-col items-end"><span className={`px-2 py-1 rounded-full text-xs ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{u.status}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Schedule({ upcoming }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h3>
      <div className="space-y-4">
        {upcoming.slice(0, 3).map((g: any) => (
          <div key={g.id} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded"><p className="font-semibold text-gray-900 text-sm">{g.homeTeamName} vs {g.awayTeamName}</p><p className="text-sm text-gray-600">{g.sport} • {new Date(g.scheduledAt).toLocaleTimeString()}</p></div>
        ))}
      </div>
      <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">View Full Schedule</button>
    </div>
  );
}

/* --------------------------------------------------
   Other tabs (simplified JSX)
-------------------------------------------------- */
function UsersTab({ rows, approve, deleteU, openAdd }: any) {
  return (
    <div id="content-users" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">User Management</h2><p className="text-gray-600">Manage correspondents, fans, and their permissions</p></div>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>Add New User</button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr></thead><tbody className="bg-white divide-y divide-gray-200">
          {rows.map((u: any) => (
            <tr key={u.uid}>
              <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center"><span className="text-purple-700 font-medium">{u.name.slice(0,2).toUpperCase()}</span></div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{u.name}</div><div className="text-sm text-gray-500">{u.university||'—'}</div></div></div></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status==='active'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{u.status}</span></td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {u.status==='pending' && <button onClick={() => approve(u.uid)} className="text-green-600 hover:text-green-900 mr-2">Approve</button>}
                <button onClick={() => deleteU(u.uid)} className="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}

function MerchTab({ items, remove }: any) {
  return (
    <div id="content-merchandise" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Merchandise Management</h2><p className="text-gray-600">Create team themes, designs, and manage merchandise.</p></div>
        <button onClick={() => alert('Add merchandise form here')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Merchandise</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((m: any) => (
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

function ReviewTab({ rows, approve, reject }: any) {
  return (
    <div id="content-review" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Correspondent Data Review</h2><p className="text-gray-600">Review and approve or reject data submitted by correspondents.</p></div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correspondent</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr></thead><tbody className="bg-white divide-y divide-gray-200">
          {rows.map((r: any) => (
            <tr key={r.id}>
              <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{r.title}</div><div className="text-sm text-gray-500">{r.type}</div></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.correspondent}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(r.submittedAt).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => approve(r.id)} className="text-green-600 hover:text-green-900 mr-2">Approve</button><button onClick={() => reject(r.id)} className="text-red-600 hover:text-red-900">Reject</button></td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}

function GamesTab({ live, upcoming, updateScore, startG, endG }: any) {
  return (
    <div id="content-games" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Game Schedule</h2><p className="text-gray-600">Update upcoming and live game information.</p></div>
        <button onClick={() => alert('Add game form here')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Add New Game</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6"><h3 className="text-xl font-bold text-gray-900 mb-4">Live Games</h3>
          {live.map((g: any) => (
            <div key={g.id} className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 mb-4">
              <div className="flex items-center justify-between"><p className="font-semibold text-red-700">{g.homeTeamName} vs {g.awayTeamName}</p><span className="text-red-500 font-bold text-lg">{g.score?.home ?? 0} - {g.score?.away ?? 0}</span></div>
              <p className="text-sm text-gray-600">Football • {g.minute}'</p>
              <div className="flex justify-end space-x-2 mt-2"><button onClick={() => { const h = prompt('Home score'); const a = prompt('Away score'); if (h !== null && a !== null) updateScore(g.id, +h, +a); }} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700">Update Score</button><button onClick={() => endG(g.id)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-xs hover:bg-gray-300">End Game</button></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6"><h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Games</h3>
          {upcoming.map((g: any) => (
            <div key={g.id} className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 mb-4">
              <div className="flex items-center justify-between"><p className="font-semibold text-yellow-700">{g.homeTeamName} vs {g.awayTeamName}</p><span className="text-yellow-600 text-sm">{new Date(g.scheduledAt).toLocaleTimeString()}</span></div>
              <p className="text-sm text-gray-600">{g.sport} • Starts in {Math.round((new Date(g.scheduledAt).getTime() - Date.now()) / 60000)} min</p>
              <div className="flex justify-end space-x-2 mt-2"><button onClick={() => startG(g.id)} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700">Start Game</button><button className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-xs hover:bg-gray-300">Edit</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   Modals
-------------------------------------------------- */
function AddUserModal({ close }: any) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 modal-backdrop">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform scale-95 transition-transform duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Add New User</h3>
            <button onClick={close} className="text-gray-400 hover:text-gray-600"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <form onSubmit={e => { e.preventDefault(); alert('Hook to createUser thunk'); close(); }}>
            <div className="mb-4"><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
            <div className="mb-4"><label className="block text-sm font-medium text-gray-700">Email Address</label><input type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
            <div className="mb-4"><label className="block text-sm font-medium text-gray-700">Role</label><select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"><option value="correspondent">Correspondent</option><option value="fan">Fan</option></select></div>
            <div className="flex justify-end"><button type="button" onClick={close} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button><button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Add User</button></div>
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
