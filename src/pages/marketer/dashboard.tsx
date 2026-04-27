import React, { useState } from 'react';
import Head from 'next/head';
import MarketerGuard from '@/guards/MarketerGuard';
import { useAppSelector } from '@/hooks/redux';
import { 
  FiPieChart, FiTrendingUp, FiLayers, FiAward, 
  FiSettings, FiLogOut, FiMenu, FiX, FiActivity,
  FiTarget, FiSmartphone, FiLayout, FiBriefcase
} from 'react-icons/fi';
import { CampaignsTab } from '@/components/marketer/CampaignsTab';
import { AnalyticsTab } from '@/components/marketer/AnalyticsTab';
import { PageBuilderTab } from '@/components/marketer/PageBuilderTab';
import { BrandingTab } from '@/components/marketer/BrandingTab';

type Tab = 'analytics' | 'campaigns' | 'page-builder' | 'branding' | 'settings';

export default function MarketerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const user = useAppSelector(s => s.auth.user);

  const menuItems = [
    { id: 'analytics', label: 'Growth Analytics', icon: FiTrendingUp },
    { id: 'campaigns', label: 'Campaigns', icon: FiTarget },
    { id: 'page-builder', label: 'Page Builder', icon: FiLayout },
    { id: 'branding', label: 'Brand & Budget', icon: FiAward },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics': return <AnalyticsTab />;
      case 'campaigns': return <CampaignsTab />;
      case 'page-builder': return <PageBuilderTab />;
      case 'branding': return <BrandingTab />;
      default: return <AnalyticsTab />;
    }
  };

  return (
    <MarketerGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex text-gray-900 dark:text-gray-100">
        <Head>
          <title>Marketer Dashboard | Unill Sports</title>
        </Head>

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiBriefcase className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-black tracking-tight uppercase">Market<span className="text-indigo-600">Hub</span></h1>
            </div>

            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as Tab); setSidebarOpen(false); }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all
                      ${isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">{user?.displayName || 'Marketer'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <FiLogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col relative h-screen overflow-hidden">
          {/* Header */}
          <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FiMenu className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black tracking-tight">{menuItems.find(i => i.id === activeTab)?.label}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full text-xs font-black uppercase tracking-widest border border-green-200 dark:border-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Campaigns: 12
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </MarketerGuard>
  );
}
