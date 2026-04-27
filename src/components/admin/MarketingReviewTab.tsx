import React, { useState, useEffect } from 'react';
import { marketerService, MarketingCampaign } from '@/services/marketerService';
import { FiCheck, FiX, FiInfo, FiDollarSign, FiImage, FiMessageSquare } from 'react-icons/fi';
import { useToast } from '../common/ToastProvider';

export const MarketingReviewTab = () => {
  const [pendingCampaigns, setPendingCampaigns] = useState<MarketingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: showError } = useToast();

  const loadPending = async () => {
    setIsLoading(true);
    try {
      const all = await marketerService.getCampaigns();
      setPendingCampaigns(all.filter(c => c.status === 'pending_approval'));
    } catch (e) {
      showError('Failed to load pending campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleAction = async (campaign: MarketingCampaign, action: 'approved' | 'rejected') => {
    try {
      await marketerService.saveCampaign({
        ...campaign,
        status: action
      });
      success(`Campaign ${action === 'approved' ? 'approved' : 'rejected'}`);
      loadPending();
    } catch (e) {
      showError(`Failed to ${action} campaign`);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Marketing Queue</h3>
          <p className="text-sm text-gray-500 font-medium">Review and approve campaign renders, messaging, and budgets</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <span className="text-blue-600 dark:text-blue-400 font-black text-sm">{pendingCampaigns.length} Pending Review</span>
        </div>
      </div>

      {pendingCampaigns.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FiCheck className="w-8 h-8 text-green-500" />
          </div>
          <h4 className="text-xl font-black text-gray-900 dark:text-white">All Clear!</h4>
          <p className="text-gray-500 mt-2">No campaigns are currently waiting for your approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-800 overflow-hidden group hover:border-blue-200 dark:hover:border-blue-900 transition-all">
              <div className="flex flex-col lg:flex-row">
                {/* Render Preview */}
                <div className="lg:w-1/3 h-64 lg:h-auto bg-gray-100 dark:bg-gray-900 relative">
                  {campaign.renderUrl ? (
                    <img src={campaign.renderUrl} alt="Campaign Render" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <FiImage className="w-12 h-12 mb-2 opacity-20" />
                      <span className="text-xs font-black uppercase tracking-widest">No Asset Provided</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {campaign.type}
                  </div>
                </div>

                {/* Content Review */}
                <div className="flex-1 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{campaign.name}</h4>
                      <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                        <span className="flex items-center gap-1"><FiDollarSign className="text-blue-500" /> Budget: ${campaign.budget}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction(campaign, 'rejected')}
                        className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl hover:bg-red-100 transition-all active:scale-95"
                      >
                        <FiX className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => handleAction(campaign, 'approved')}
                        className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all active:scale-95 flex items-center gap-2"
                      >
                        <FiCheck className="w-6 h-6" />
                        Approve Campaign
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiMessageSquare /> Primary Message
                      </h5>
                      <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">
                          "{campaign.message || 'No message provided.'}"
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Proposed Reach</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">10k - 50k Est.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
                        <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">Target Audience</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">University Students</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
