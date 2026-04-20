import { useEffect, useState, useCallback } from 'react';
import { db } from '@/services/firebase';
import {
  collection, getDocs, orderBy, query, limit, Timestamp
} from 'firebase/firestore';
import {
  FiActivity, FiRefreshCw, FiCheckCircle, FiClock, FiZap, FiAlertCircle, FiLoader
} from 'react-icons/fi';

interface AutomationLog {
  id: string;
  timestamp: Timestamp | string;
  fixtureId: string;
  sport: string;
  oldStatus: string;
  newStatus: string;
  reason: string;
}

const STATUS_COLORS: Record<string, string> = {
  live: 'bg-red-500/10 text-red-400 border-red-500/30',
  completed: 'bg-green-500/10 text-green-400 border-green-500/30',
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  postponed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  live: <FiZap className="w-3 h-3" />,
  completed: <FiCheckCircle className="w-3 h-3" />,
  scheduled: <FiClock className="w-3 h-3" />,
  postponed: <FiAlertCircle className="w-3 h-3" />,
};

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colorClass}`}>
      {STATUS_ICONS[status] || <FiActivity className="w-3 h-3" />}
      {status}
    </span>
  );
}

export default function AutomationsTab() {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<{ changes: number; ts: Date } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'automationLogs'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const snap = await getDocs(q);
      const items: AutomationLog[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as AutomationLog));
      setLogs(items);
    } catch (e: any) {
      setError(e.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleForceRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/automations/run', { method: 'GET' });
      const data = await res.json();
      if (data.success) {
        setLastResult({ changes: data.changes, ts: new Date() });
        await fetchLogs(); // Refresh logs
      } else {
        setError(data.message || 'Automation run failed');
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setRunning(false);
    }
  };

  const formatTimestamp = (ts: Timestamp | string): string => {
    try {
      if (ts && typeof (ts as any).toDate === 'function') {
        return (ts as Timestamp).toDate().toLocaleString();
      }
      return new Date(ts as string).toLocaleString();
    } catch {
      return 'Unknown time';
    }
  };

  // Stats
  const liveTransitions = logs.filter(l => l.newStatus === 'live').length;
  const completedTransitions = logs.filter(l => l.newStatus === 'completed').length;
  const uniqueFixtures = new Set(logs.map(l => l.fixtureId)).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiActivity className="text-blue-600 w-6 h-6" />
            Fixture Automations
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time fixture lifecycle engine — auto-transitions based on sport durations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm font-semibold"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
          <button
            onClick={handleForceRun}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all text-sm font-bold disabled:opacity-60"
          >
            {running ? (
              <><FiLoader className="w-4 h-4 animate-spin" /> Running...</>
            ) : (
              <><FiZap className="w-4 h-4" /> Force Global Sync</>
            )}
          </button>
        </div>
      </div>

      {/* Last run result */}
      {lastResult && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          lastResult.changes > 0
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">
            Sync completed at {lastResult.ts.toLocaleTimeString()} —{' '}
            {lastResult.changes > 0
              ? `${lastResult.changes} fixture status update(s) applied`
              : 'No status changes needed'}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Live Transitions', value: liveTransitions, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Completed Transitions', value: completedTransitions, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Unique Fixtures Tracked', value: uniqueFixtures, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
              <span className={`text-xl font-black ${color}`}>{value}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-widest">
            Automation Log Feed
          </h3>
          <span className="text-xs text-gray-400 font-semibold">Last 100 events</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FiActivity className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-bold text-sm uppercase tracking-widest">No automation events yet</p>
            <p className="text-xs mt-1">Use "Force Global Sync" or wait for the hourly trigger</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-black">
                <tr>
                  <th className="text-left px-6 py-3">Timestamp</th>
                  <th className="text-left px-6 py-3">Fixture ID</th>
                  <th className="text-left px-6 py-3">Sport</th>
                  <th className="text-left px-6 py-3">From</th>
                  <th className="text-left px-6 py-3">To</th>
                  <th className="text-left px-6 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded truncate block max-w-[120px]">
                        {log.fixtureId}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">
                      {log.sport || '—'}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={log.oldStatus} />
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={log.newStatus} />
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
                      {log.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
