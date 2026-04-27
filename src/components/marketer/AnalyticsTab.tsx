import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiArrowUpRight, FiArrowDownRight, FiActivity } from 'react-icons/fi';
import { marketerService } from '@/services/marketerService';

export const AnalyticsTab = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const growthData = await marketerService.getGrowthData();
        setData(growthData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = [
    { label: 'Total Reach', value: '124.5k', change: '+12.5%', isUp: true, icon: FiActivity },
    { label: 'Total Users', value: data?.totalUsers?.toLocaleString() || '0', change: '+18.2%', isUp: true, icon: FiUsers },
    { label: 'Avg. CAC', value: '$4.20', change: '-5.1%', isUp: true, icon: FiDollarSign },
    { label: 'Campaign ROI', value: '320%', change: '+2.4%', isUp: true, icon: FiTrendingUp },
  ];

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-black ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                  {stat.isUp ? <FiArrowUpRight /> : <FiArrowDownRight />}
                </div>
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Main Charts Mock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-96">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-black">User Acquisition Growth</h4>
            <select className="bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-4 py-2 text-sm font-bold">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="w-full h-64 flex items-end justify-between gap-2">
            {data?.growth?.map((g: any, i: number) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all hover:opacity-80 cursor-pointer group relative" style={{ height: `${(g.users / data.totalUsers) * 100}%` }}>
                <div className="absolute -top-10 left-1/2 -translate-y-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {g.users} Users
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {data?.growth?.map((g: any, i: number) => (
              <span key={i}>{g.month}</span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <h4 className="text-xl font-black mb-6">Traffic Sources</h4>
          <div className="flex-1 space-y-6">
            {[
              { label: 'Instagram Ads', percentage: 45, color: 'bg-pink-500' },
              { label: 'Google Search', percentage: 25, color: 'bg-blue-500' },
              { label: 'Referral Program', percentage: 20, color: 'bg-green-500' },
              { label: 'Direct Traffic', percentage: 10, color: 'bg-indigo-500' },
            ].map((source, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>{source.label}</span>
                  <span>{source.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${source.color}`} style={{ width: `${source.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
