import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import CorrespondentGuard from '@/guards/CorrespondentGuard';
import UserHeader from '@/components/UserHeader';
import { ProfileTab } from '@/components/correspondent/ProfileTab';
import { UploadTeamExcelTab } from '@/components/correspondent/UploadTeamExcelTab';
import { UploadTeamVideoTab } from '@/components/correspondent/UploadTeamVideoTab';
import { GameLiveCommentaryTab } from '@/components/correspondent/GameLiveCommentaryTab';
import { ManageLeagueTab } from '@/components/correspondent/ManageLeagueTab';
import { useClientSideLibs } from '@/utils/clientLibs';

type TabType = 'profile' | 'excel' | 'video' | 'commentary' | 'league';

export default function CorrespondentDashboardPage() {
  const user = useAppSelector(s => s.auth.user);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(true);

  /* ---------- feather + AOS ---------- */
  const mounted = useClientSideLibs();

  useEffect(() => {
    // Simulate initial loading for dashboard data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    {
      id: 'profile' as TabType,
      name: 'Profile',
      icon: 'user',
      description: 'Manage your correspondent account'
    },
    {
      id: 'excel' as TabType,
      name: 'Upload Team Excel',
      icon: 'file-text',
      description: 'Upload Excel files with team data'
    },
    {
      id: 'video' as TabType,
      name: 'Upload Team Video',
      icon: 'video',
      description: 'Upload game videos to Google Drive'
    },
    {
      id: 'commentary' as TabType,
      name: 'Game Live Commentary',
      icon: 'radio',
      description: 'Provide live commentary for games'
    },
    {
      id: 'league' as TabType,
      name: 'Manage League',
      icon: 'trophy',
      description: 'Manage leagues, groups, and matches'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'excel':
        return <UploadTeamExcelTab />;
      case 'video':
        return <UploadTeamVideoTab />;
      case 'commentary':
        return <GameLiveCommentaryTab />;
      case 'league':
        return <ManageLeagueTab />;
      default:
        return <ProfileTab />;
    }
  };

  if (loading) {
    return (
      <CorrespondentGuard>
        <UserHeader />
        
        {/* ------- HEADER ------- */}
        <section className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Correspondent Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.displayName || 'Correspondent'}! Manage your sports coverage and content.
            </p>
          </div>
        </section>

        {/* ------- LOADING STATE ------- */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </section>
      </CorrespondentGuard>
    );
  }

  return (
    <CorrespondentGuard>
      <UserHeader />
      
      {/* ------- HEADER ------- */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Correspondent Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.displayName || 'Correspondent'}! Manage your sports coverage and content.
          </p>
        </div>
      </section>

      {/* ------- MAIN CONTENT ------- */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i data-feather={tab.icon} className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div data-aos="fade-up" key={activeTab}>
            {renderTabContent()}
          </div>

          {/* Quick Actions Cards - Only show on profile tab */}
          {activeTab === 'profile' && (
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tabs.slice(1).map((tab, index) => (
                  <div
                    key={tab.id}
                    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        tab.id === 'excel' ? 'bg-green-100' :
                        tab.id === 'video' ? 'bg-red-100' :
                        tab.id === 'commentary' ? 'bg-purple-100' :
                        'bg-yellow-100'
                      }`}>
                        <i
                          data-feather={tab.icon}
                          className={`w-6 h-6 ${
                            tab.id === 'excel' ? 'text-green-600' :
                            tab.id === 'video' ? 'text-red-600' :
                            tab.id === 'commentary' ? 'text-purple-600' :
                            'text-yellow-600'
                          }`}
                        />
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{tab.name}</h4>
                    <p className="text-gray-600 text-sm">{tab.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </CorrespondentGuard>
  );
}