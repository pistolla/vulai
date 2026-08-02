import { useState, useEffect } from 'react';
import { FiActivity, FiServer, FiCpu, FiDatabase, FiPlay, FiCheckCircle, FiAlertCircle, FiLoader, FiTerminal, FiSettings, FiBarChart2 } from 'react-icons/fi';
import { db } from '@/services/firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

export function MissionControlTab() {
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineResult, setTimelineResult] = useState<any>(null);

  const [automationsLoading, setAutomationsLoading] = useState(false);
  const [automationsResult, setAutomationsResult] = useState<any>(null);

  const [dataSyncLoading, setDataSyncLoading] = useState(false);
  const [dataSyncResult, setDataSyncResult] = useState<any>(null);

  // Metrics State
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeCards: 0,
    archivedCards: 0,
    totalEngagement: 0,
  });

  // Config State
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [config, setConfig] = useState({
    llmProvider: 'gemini-1.5-flash',
    cardsPerCycle: 6,
    cronFrequency: '15m',
  });

  // Fetch Metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [cardsSnap, archiveSnap] = await Promise.all([
          getDocs(collection(db, 'timeline_cards')),
          getDocs(collection(db, 'timeline_cards_archive'))
        ]);
        
        let engagement = 0;
        
        cardsSnap.forEach(d => {
          const reactions = d.data().reactions || {};
          engagement += (reactions.fire || 0) + (reactions.clap || 0) + (reactions.heart || 0) + (reactions.wow || 0) + (reactions.trophy || 0);
        });

        archiveSnap.forEach(d => {
          engagement += d.data().totalEngagement || 0;
        });

        setMetrics({
          activeCards: cardsSnap.size,
          archivedCards: archiveSnap.size,
          totalEngagement: engagement,
        });
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setMetricsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Fetch Config
  useEffect(() => {
    const fetchConfig = async () => {
      setConfigLoading(true);
      try {
        const configDoc = await getDoc(doc(db, 'admin', 'system_config'));
        if (configDoc.exists()) {
          setConfig(prev => ({ ...prev, ...configDoc.data() }));
        }
      } catch (err) {
        console.error("Failed to load system config", err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    setConfigSaving(true);
    try {
      await setDoc(doc(db, 'admin', 'system_config'), config, { merge: true });
    } catch (err) {
      console.error("Failed to save config", err);
    } finally {
      setConfigSaving(false);
    }
  };

  const triggerTimeline = async () => {
    setTimelineLoading(true);
    setTimelineResult(null);
    try {
      const res = await fetch('/api/timeline/generate?force=true', { method: 'POST' });
      const data = await res.json();
      setTimelineResult({ success: res.ok, data });
      // Refresh metrics after run
      setTimeout(() => setMetricsLoading(true), 1000);
    } catch (e: any) {
      setTimelineResult({ success: false, data: { message: e.message } });
    } finally {
      setTimelineLoading(false);
    }
  };

  const triggerAutomations = async () => {
    setAutomationsLoading(true);
    setAutomationsResult(null);
    try {
      const res = await fetch('/api/automations/run', { method: 'POST' });
      const data = await res.json();
      setAutomationsResult({ success: data.success, data });
    } catch (e: any) {
      setAutomationsResult({ success: false, data: { message: e.message } });
    } finally {
      setAutomationsLoading(false);
    }
  };

  const triggerDataSync = async () => {
    setDataSyncLoading(true);
    setDataSyncResult(null);
    try {
      const res = await fetch('/api/admin/data-sync', { method: 'POST' });
      const data = await res.json();
      setDataSyncResult({ success: data.success, data });
    } catch (e: any) {
      setDataSyncResult({ success: false, data: { message: e.message } });
    } finally {
      setDataSyncLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiTerminal className="text-blue-600 w-6 h-6" />
            Mission Control
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Centralized orchestration for AI agents, automations, and external data pipelines.
          </p>
        </div>
      </div>

      {/* Analytics & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Active Timeline Cards', value: metrics.activeCards, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Archived (Viral) Cards', value: metrics.archivedCards, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Engagement', value: metrics.totalEngagement, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
             <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              {metricsLoading ? (
                <FiLoader className={`w-5 h-5 animate-spin ${stat.color}`} />
              ) : (
                <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Service 1: AI Timeline Agent */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <FiCpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">AI Timeline Agent</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gemini Autonomous Content</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-grow">
            Forces a full regeneration of the social timeline. The AI agent will query Firestore for live sports data and generate new engagement cards.
          </p>
          <div className="mt-auto space-y-4">
            <button
              onClick={triggerTimeline}
              disabled={timelineLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all disabled:opacity-60"
            >
              {timelineLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiPlay className="w-4 h-4" />}
              Trigger AI Agent
            </button>
            {timelineResult && (
              <div className={`p-3 rounded-xl text-xs font-mono break-all ${timelineResult.success ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                {JSON.stringify(timelineResult.data, null, 2)}
              </div>
            )}
          </div>
        </div>

        {/* Service 2: Fixture Automations */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <FiActivity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Fixture Lifecycle</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">State Machine Automations</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-grow">
            Manually triggers the cron-job equivalent to advance matches from 'Scheduled' to 'Live' to 'Completed' based on their elapsed durations.
          </p>
          <div className="mt-auto space-y-4">
            <button
              onClick={triggerAutomations}
              disabled={automationsLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-60"
            >
              {automationsLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiPlay className="w-4 h-4" />}
              Run State Sync
            </button>
            {automationsResult && (
              <div className={`p-3 rounded-xl text-xs font-mono break-all ${automationsResult.success ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                {JSON.stringify(automationsResult.data, null, 2)}
              </div>
            )}
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
                <FiSettings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">AI Config</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Settings & Throughput</p>
              </div>
            </div>
            {configSaving && <FiLoader className="w-4 h-4 text-orange-500 animate-spin" />}
          </div>
          
          <div className="space-y-4 flex-grow mt-2">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">LLM Provider</label>
              <select 
                value={config.llmProvider}
                onChange={(e) => setConfig({ ...config, llmProvider: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Cards per Cycle: {config.cardsPerCycle}
              </label>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={config.cardsPerCycle}
                onChange={(e) => setConfig({ ...config, cardsPerCycle: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Generation Cron Frequency</label>
              <select 
                value={config.cronFrequency}
                onChange={(e) => setConfig({ ...config, cronFrequency: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="5m">Every 5 minutes</option>
                <option value="15m">Every 15 minutes</option>
                <option value="30m">Every 30 minutes</option>
                <option value="1h">Every 1 hour</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={saveConfig}
              disabled={configLoading || configSaving}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 dark:text-orange-400 font-bold transition-all disabled:opacity-50"
            >
              {configSaving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheckCircle className="w-4 h-4" />}
              Save Configuration
            </button>
          </div>
        </div>

      </div>

      {/* Backend Infrastructure Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-widest flex items-center gap-2">
            <FiServer className="w-4 h-4" /> Cloud Functions Status
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Environment', value: 'production (europe-west1)' },
              { label: 'Runtime', value: 'Node.js 20' },
              { label: 'Admin Auth', value: 'Enabled (Strict)' },
              { label: 'CORS', value: 'Active' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">{stat.label}</p>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{stat.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center font-mono">
            Functions Base URL: {process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL || 'http://127.0.0.1:5001/unill-20c41/europe-west1'}
          </p>
        </div>
      </div>
    </div>
  );
}
