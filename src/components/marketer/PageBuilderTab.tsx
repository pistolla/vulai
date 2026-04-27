import React, { useState, useEffect } from 'react';
import { FiLayout, FiType, FiImage, FiMousePointer, FiSave, FiEye, FiMove, FiTrash2, FiPlus } from 'react-icons/fi';
import { marketerService, MarketingPage } from '@/services/marketerService';
import { useToast } from '../common/ToastProvider';

export const PageBuilderTab = () => {
  const [sections, setSections] = useState([
    { id: 1, type: 'hero', title: 'Featured Sport: Soccer Finals', subtitle: 'Experience the hype of the century' },
    { id: 2, type: 'content', body: 'Get exclusive access to pre-match interviews and live statistics.' },
    { id: 3, type: 'cta', label: 'Register Now' },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: showError } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await marketerService.savePage({
        slug: 'feature-showcase',
        title: 'Feature Showcase Page',
        sections,
        status: 'draft'
      });
      success('Draft saved to Cloud');
    } catch (e) {
      showError('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      {/* Sidebar: Components */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h5 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Components</h5>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FiLayout, label: 'Hero' },
              { icon: FiType, label: 'Text' },
              { icon: FiImage, label: 'Media' },
              { icon: FiMousePointer, label: 'Button' },
              { icon: FiActivity, label: 'Feature' },
              { icon: FiPlus, label: 'Grid' },
            ].map((comp, i) => (
              <button key={i} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all group">
                <comp.icon className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 mb-2" />
                <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-indigo-600">{comp.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-500/30 text-white">
          <h5 className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">Pro Tip</h5>
          <p className="text-sm font-medium leading-relaxed">
            Personalized landing pages increase conversion by up to 45%. Try using university-specific imagery.
          </p>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="flex gap-2">
            <span className="text-xs font-black px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">Draft: Soccer_Hype_Page_v1</span>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">
              <FiEye /> Preview
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm font-black rounded-xl transition-all hover:bg-indigo-700 shadow-md disabled:opacity-50"
            >
              <FiSave /> {isSaving ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 min-h-[600px] rounded-3xl border-4 border-dashed border-gray-200 dark:border-gray-800 p-8 space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="group relative bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-sm border border-transparent hover:border-indigo-500 transition-all cursor-move">
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg"><FiMove /></button>
                <button className="p-2 bg-red-600 text-white rounded-lg shadow-lg"><FiTrash2 /></button>
              </div>

              {section.type === 'hero' && (
                <div className="text-center max-w-xl mx-auto">
                  <h1 className="text-4xl font-black mb-4 tracking-tight leading-tight">{section.title}</h1>
                  <p className="text-gray-500 font-medium">{section.subtitle}</p>
                </div>
              )}

              {section.type === 'content' && (
                <div className="max-w-2xl">
                  <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 font-medium">{section.body}</p>
                </div>
              )}

              {section.type === 'cta' && (
                <div className="flex justify-center">
                  <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/40">
                    {section.label}
                  </button>
                </div>
              )}
            </div>
          ))}
          
          <button className="w-full py-10 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-white/50 dark:hover:bg-white/5 transition-all group">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <FiPlus className="w-6 h-6" />
            </div>
            <span className="text-sm font-black uppercase text-gray-400 group-hover:text-gray-600 tracking-widest">Add Section</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock icon missing in components
const FiActivity = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
