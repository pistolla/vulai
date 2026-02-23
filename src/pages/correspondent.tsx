import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import CorrespondentGuard from '@/guards/CorrespondentGuard';
import UserHeader from '@/components/UserHeader';
import { ToastProvider } from '@/components/common/ToastProvider';
import { ProfileTab } from '@/components/correspondent/ProfileTab';
import { UploadTeamExcelTab } from '@/components/correspondent/UploadTeamExcelTab';
import { UploadTeamVideoTab } from '@/components/correspondent/UploadTeamVideoTab';
import { GameLiveCommentaryTab } from '@/components/correspondent/GameLiveCommentaryTab';
import { ManageLeagueTab } from '@/components/correspondent/ManageLeagueTab';
import { ManageFixtureTab } from '@/components/correspondent/ManageFixtureTab';
import { TeamsCatalogTab } from '../components/correspondent/TeamsCatalogTab';
import { TeamBalanceSheet } from '../components/correspondent/TeamBalanceSheet';
import { QuickFixtureModal } from '../components/correspondent/QuickFixtureModal';
import { useClientSideLibs } from '@/utils/clientLibs';
import { fetchLeagues, fetchFixtures } from '@/store/correspondentThunk';
import { FiUser, FiFileText, FiVideo, FiRadio, FiAward, FiArrowRight, FiShoppingCart, FiPackage, FiDollarSign } from 'react-icons/fi';
import { League } from '@/models';

type TabType = 'profile' | 'excel' | 'video' | 'commentary' | 'league' | 'fixtures' | 'catalog' | 'balance';

export default function CorrespondentDashboardPage() {
  const user = useAppSelector(s => s.auth.user);
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showQuickFixture, setShowQuickFixture] = useState(false);
  const [selectedLeagueForQuick, setSelectedLeagueForQuick] = useState<League | null>(null);

  const defaultLeague = useAppSelector(s => s.correspondent.leagues[0]) || null;

  /* ---------- feather + AOS ---------- */
  const mounted = useClientSideLibs();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchLeagues()),
          dispatch(fetchFixtures())
        ]);
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load correspondent data:', error);
        setDataLoaded(true);
      }
    };
    loadData();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  const tabs = [
    {
      id: 'profile' as TabType,
      name: 'Profile',
      icon: FiUser,
      color: 'blue',
      description: 'Manage your correspondent account'
    },
    {
      id: 'excel' as TabType,
      name: 'Team Roster',
      icon: FiFileText,
      color: 'green',
      description: 'Upload Excel files with team data'
    },
    {
      id: 'video' as TabType,
      name: 'Data Import',
      icon: FiVideo,
      color: 'red',
      description: 'Import data files from Google Drive'
    },
    {
      id: 'commentary' as TabType,
      name: 'Live Booth',
      icon: FiRadio,
      color: 'purple',
      description: 'Provide live commentary for games'
    },
    {
      id: 'league' as TabType,
      name: 'League Manager',
      icon: FiAward,
      color: 'yellow',
      description: 'Manage leagues, groups, and matches'
    },
    {
      id: 'fixtures' as TabType,
      name: 'Fixture Manager',
      icon: FiAward,
      color: 'orange',
      description: 'Manage fixtures and match details'
    },
    {
      id: 'catalog' as TabType,
      name: 'Teams Catalog',
      icon: FiShoppingCart,
      color: 'indigo',
      description: 'Manage team merchandise orders'
    },
    {
      id: 'balance' as TabType,
      name: 'Balance Sheet',
      icon: FiDollarSign,
      color: 'emerald',
      description: 'View team merchandise financials'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'excel': return <UploadTeamExcelTab />;
      case 'video': return <UploadTeamVideoTab />;
      case 'commentary': return <GameLiveCommentaryTab />;
      case 'league': return <ManageLeagueTab />;
      case 'fixtures': return <ManageFixtureTab />;
      case 'catalog': return <TeamsCatalogTab />;
      case 'balance': return <TeamBalanceSheet correspondentId={user?.uid || ''} correspondentName={user?.displayName} />;
      default: return <ProfileTab />;
    }
  };

  if (loading || !dataLoaded) {
    return (
      <ToastProvider>
        <CorrespondentGuard>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <UserHeader />
            <div className="flex items-center justify-center py-40">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500 font-medium">Powering up your workspace...</p>
              </div>
            </div>
          </div>
        </CorrespondentGuard>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <CorrespondentGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
        <UserHeader />

        <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div data-aos="fade-right">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Reporter Central</h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Active coverage for <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-500/30 underline-offset-4">{user?.displayName || 'Correspondent'}</span>
                </p>
                <button
                  onClick={() => setShowQuickFixture(true)}
                  className="px-3 py-1 bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full hover:bg-blue-600 hover:text-white transition-all border border-blue-600/20"
                >
                  ⚡ Quick Fixture
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-1.5 rounded-[2rem] shadow-xl shadow-black/5 border border-white/20 dark:border-gray-700 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-[1.5rem] text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-950 dark:hover:text-white'
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-3xl rounded-[3rem] border border-gray-100/50 dark:border-gray-800/50 p-4 sm:p-8 shadow-2xl shadow-black/5 min-h-[500px]" data-aos="zoom-in-up">
            {renderTabContent()}
          </div>

          {activeTab === 'profile' && (
            <div className="mt-16 animate-in slide-in-from-bottom duration-700">
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-2xl font-black dark:text-white tracking-tight">Operational Modules</h3>
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-8" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tabs.slice(1).map((tab, index) => (
                  <button
                    key={tab.id}
                    className="group bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 text-left border border-gray-100 dark:border-gray-700 shadow-xl shadow-black/5 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-700/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full" />

                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6 ${tab.color === 'green' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                      tab.color === 'red' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                        tab.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                      <tab.icon className="w-7 h-7" />
                    </div>

                    <h4 className="text-lg font-black dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{tab.name}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6 leading-relaxed">{tab.description}</p>

                    <div className="flex items-center text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      Launch Module <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        <QuickFixtureModal
          isOpen={showQuickFixture}
          onClose={() => setShowQuickFixture(false)}
          league={defaultLeague}
        />
      </div>
    </CorrespondentGuard>
    </ToastProvider>
  );
}
