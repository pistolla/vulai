import React, { useEffect, useState } from 'react';
import { FiAward, FiDollarSign, FiDroplet, FiType, FiUpload, FiDownload, FiCheckCircle, FiSave } from 'react-icons/fi';
import { marketerService, BrandingSettings } from '@/services/marketerService';
import { useToast } from '../common/ToastProvider';

export const BrandingTab = () => {
  const [settings, setSettings] = useState<BrandingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const data = await marketerService.getBranding();
        setSettings(data);
      } catch (e) {
        showError('Failed to load branding');
      } finally {
        setIsLoading(false);
      }
    };
    loadBranding();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await marketerService.updateBranding(settings);
      success('Branding updated');
    } catch (e) {
      showError('Failed to update branding');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branding Assets */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center">
                <FiAward className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-black">Brand Identity</h4>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black shadow-lg disabled:opacity-50"
            >
              <FiSave /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Official Logos</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-8 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col items-center gap-2 group cursor-pointer hover:border-purple-500 transition-all">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <FiUpload />
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-purple-600">Primary Logo</span>
                </div>
                <div className="p-8 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col items-center gap-2 group cursor-pointer hover:border-purple-500 transition-all">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <FiUpload />
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-purple-600">Symbol Only</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Brand Colors</p>
              <div className="flex gap-4">
                {[
                  { color: '#4F46E5', label: 'Indigo' },
                  { color: '#9333EA', label: 'Purple' },
                  { color: '#F59E0B', label: 'Amber' },
                  { color: '#10B981', label: 'Emerald' },
                ].map((c, i) => (
                  <div key={i} className="group relative">
                    <div className="w-12 h-12 rounded-xl shadow-inner cursor-pointer" style={{ backgroundColor: c.color }} />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                      <span className="text-[10px] font-black text-gray-400 uppercase">{c.label}</span>
                    </div>
                  </div>
                ))}
                <button className="w-12 h-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-all">
                  <FiPlus />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Typography</p>
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-sm font-black mb-1">Heading Font: Redwing</p>
                  <p className="text-xs text-gray-500">Body Font: Inter / System UI</p>
                </div>
                <button className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"><FiEdit2 /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Analysis */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center">
                <FiDollarSign className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-black">Marketing Budget</h4>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Monthly Cap: $25,000</span>
          </div>

          <div className="space-y-8">
            <div className="relative h-64 flex items-center justify-center">
              {/* Circular Budget Chart Mock */}
              <div className="w-48 h-48 rounded-full border-[16px] border-indigo-600 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-[16px] border-amber-500 border-l-transparent border-b-transparent rotate-45" />
                <div className="text-center">
                  <p className="text-3xl font-black">$18,450</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Spent This Month</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Paid Social Ads', spent: 12400, color: 'bg-indigo-600' },
                { label: 'Content Creation', spent: 3200, color: 'bg-amber-500' },
                { label: 'Email Tools', spent: 1200, color: 'bg-purple-500' },
                { label: 'Others', spent: 1650, color: 'bg-gray-300' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{item.label}</span>
                  </div>
                  <span className="text-sm font-black">${item.spent.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-4 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl font-black transition-all">
              Download Financial Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FiPlus = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const FiEdit2 = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
