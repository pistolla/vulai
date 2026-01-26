import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group, StageType } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { RootState } from "@/store";
import { createStage, deleteStage, updateStage } from "@/store/correspondentThunk";
import { setStages } from "@/store/slices/correspondentSlice";
import { useState, useEffect } from "react";
import { MatchManager } from "./MatchManager";
import { useTheme } from "@/components/ThemeProvider";

// --- StageManager ---
export const StageManager: React.FC<{ league: League; group?: Group | null }> = ({ league, group }) => {
  const dispatch = useAppDispatch();
  const effectiveGroupId = group?.id || '_general';
  const stages = useAppSelector((s: RootState) => s.correspondent.stages[`${league.id}_${effectiveGroupId}`] ?? []);
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState<StageType>('knockout');
  const [parentStageId, setParentStageId] = useState<string>('');
  const [order, setOrder] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await firebaseLeagueService.listStages(league.id!, effectiveGroupId);
        dispatch(setStages({ leagueId: league.id!, groupId: effectiveGroupId, stages: list }));
      } catch (error) {
        console.error('Failed to load stages:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [league.id, effectiveGroupId, dispatch]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return alert('Stage name is required');

    setLoading(true);
    try {
      await dispatch(createStage({
        leagueId: league.id!,
        groupId: effectiveGroupId,
        stage: {
          name: name.trim(),
          order,
          type,
          parentStageId: parentStageId || undefined
        }
      }));
      // refresh
      const list = await firebaseLeagueService.listStages(league.id!, effectiveGroupId);
      dispatch(setStages({ leagueId: league.id!, groupId: effectiveGroupId, stages: list }));
      setName('');
      setParentStageId('');
      setOrder(prev => prev + 1);
    } catch (error) {
      console.error('Failed to create stage:', error);
      alert('Failed to create stage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Editing state
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const startEditing = (stage: any) => {
    setEditingStageId(stage.id);
    setEditingName(stage.name);
  };

  const saveStageName = async (stage: any) => {
    if (!editingName.trim()) return setEditingStageId(null);
    try {
      setLoading(true);
      await dispatch(updateStage({
        leagueId: league.id!,
        groupId: effectiveGroupId,
        stageId: stage.id,
        data: { name: editingName.trim() }
      }));
      setEditingStageId(null);
    } catch (error) {
      console.error('Failed to update stage:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        <h4 className="font-bold text-gray-900 dark:text-white">Stages ({stages.length})</h4>
        <svg
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-300">
          <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
            <h5 className="font-bold text-gray-900 dark:text-white mb-3">Add New Stage</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Stage Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Round of 16"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Order</label>
                <input
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  type="number"
                  placeholder="1"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  disabled={loading}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as StageType)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  disabled={loading}
                >
                  <option value="knockout">Knockout</option>
                  <option value="round_robin">Round Robin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Parent Stage (Optional)</label>
                <select
                  value={parentStageId}
                  onChange={(e) => setParentStageId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  disabled={loading}
                >
                  <option value="">None (Top Level)</option>
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70"
                  disabled={loading || !name.trim()}
                >
                  {loading ? 'Adding...' : 'Add Stage'}
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-3">
            {loading && stages.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium">Loading stages...</p>
              </div>
            ) : (
              stages.map((s: any) => (
                <div key={s.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold">
                          {s.order}
                        </span>
                        {editingStageId === s.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              autoFocus
                              className="flex-1 px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-blue-500 rounded-lg text-sm focus:outline-none"
                              onKeyDown={(e) => e.key === 'Enter' && saveStageName(s)}
                            />
                            <button onClick={() => saveStageName(s)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => setEditingStageId(null)} className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group flex-1">
                            <h5 className="font-bold text-lg text-gray-900 dark:text-white truncate">{s.name}</h5>
                            <button
                              onClick={() => startEditing(s)}
                              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                              title="Edit Name"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                          {s.type.replace('_', ' ')}
                        </span>
                        {s.parentStageId && (
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                            Parent: {stages.find(ps => ps.id === s.parentStageId)?.name || 'Unknown'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this stage and all its matches?')) {
                            dispatch(deleteStage({ leagueId: league.id!, groupId: effectiveGroupId, stageId: s.id! }));
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Delete Stage"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                      <MatchManager league={league} group={group || null} stage={s} />
                    </div>
                  </div>
                </div>
              ))
            )}
            {stages.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-3xl mb-2">🏅</div>
                <p className="font-medium">No stages yet.</p>
                <p className="text-sm">Add your first stage to organize tournament phases.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};