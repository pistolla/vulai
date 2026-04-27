import React, { useState, useEffect } from 'react';
import { FiPlus, FiTarget, FiMail, FiShare2, FiMoreVertical, FiPlay, FiPause, FiEdit2, FiX, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { CloudinaryUpload } from '../common/CloudinaryUpload';
import { marketerService, MarketingCampaign } from '@/services/marketerService';
import { Modal } from '../common/Modal';
import { useToast } from '../common/ToastProvider';

export const CampaignsTab = () => {
  const [filter, setFilter] = useState('active');
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState<Partial<MarketingCampaign>>({
    name: '',
    type: 'Social',
    status: 'pending_approval',
    message: '',
    renderUrl: '',
    reach: 0,
    clicks: 0,
    conversion: 0,
    budget: 0,
    spent: 0
  });

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await marketerService.getCampaigns();
      setCampaigns(data);
    } catch (e) {
      showError('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleToggleStatus = async (campaign: MarketingCampaign) => {
    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      await marketerService.saveCampaign({ ...campaign, status: newStatus });
      success(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}`);
      loadCampaigns();
    } catch (e) {
      showError('Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await marketerService.saveCampaign(formData as MarketingCampaign);
      success(formData.id ? 'Campaign updated' : 'Campaign submitted for approval');
      setIsModalOpen(false);
      loadCampaigns();
      setFormData({ name: '', type: 'Social', status: 'pending_approval', message: '', renderUrl: '', reach: 0, clicks: 0, conversion: 0, budget: 0, spent: 0 });
    } catch (e) {
      showError('Failed to save campaign');
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
          {['pending_approval', 'active', 'paused', 'rejected', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${filter === f ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
        >
          <FiPlus className="w-5 h-5" />
          Create Campaign
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Marketing Campaign">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Campaign Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 dark:text-white font-bold"
                placeholder="e.g. Summer Sports Fest"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ad Copy / Message</label>
              <textarea
                required
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 dark:text-white font-bold min-h-[100px]"
                placeholder="Enter the primary message for this campaign..."
              />
            </div>
            <div>
              <CloudinaryUpload 
                label="Campaign Render / Asset"
                value={formData.renderUrl}
                onChange={(url) => setFormData({ ...formData, renderUrl: url })}
              />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/30 active:scale-95 transition-all">
            {formData.id ? 'Update Campaign' : 'Submit for Approval'}
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 gap-6">
        {campaigns.filter(c => c.status === filter).map((campaign) => (
          <div key={campaign.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                campaign.type === 'Social' ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600' :
                campaign.type === 'Email' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' :
                'bg-green-50 dark:bg-green-900/30 text-green-600'
              }`}>
                {campaign.type === 'Social' ? <FiShare2 className="w-6 h-6" /> :
                 campaign.type === 'Email' ? <FiMail className="w-6 h-6" /> :
                 <FiTarget className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-lg font-black">{campaign.name}</h5>
                  {campaign.status === 'pending_approval' && <FiClock className="text-amber-500" title="Pending Approval" />}
                  {campaign.status === 'approved' && <FiCheckCircle className="text-green-500" title="Approved" />}
                  {campaign.status === 'rejected' && <FiAlertCircle className="text-red-500" title="Rejected" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500">{campaign.type}</span>
                  <span className="text-xs text-gray-400 font-bold tracking-tight">Budget: ${campaign.budget}</span>
                </div>
              </div>
            </div>

            {campaign.renderUrl && (
              <div className="hidden xl:block w-32 h-20 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <img src={campaign.renderUrl} alt="Campaign Asset" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-3 gap-8 px-6 lg:border-x border-gray-100 dark:border-gray-700 flex-1">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reach</p>
                <p className="text-xl font-black">{campaign.reach?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Clicks</p>
                <p className="text-xl font-black">{campaign.clicks?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Conversion</p>
                <p className="text-xl font-black text-green-500">{campaign.conversion}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
                <FiEdit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleToggleStatus(campaign)}
                className={`p-3 rounded-xl transition-all ${
                  campaign.status === 'active' 
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-100' 
                  : 'bg-green-50 dark:bg-green-900/30 text-green-600 hover:bg-green-100'
                }`}
              >
                {campaign.status === 'active' ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
              </button>
              <button className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-400 hover:text-gray-600 transition-all">
                <FiMoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
