import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group, StageType } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { RootState } from "@/store";
import { createStage } from "@/store/correspondentThunk";
import { setStages } from "@/store/slices/correspondentSlice";
import { useState, useEffect } from "react";
import { MatchManager } from "./MatchManager";
import { useTheme } from "@/components/ThemeProvider";

// --- StageManager ---
export const StageManager: React.FC<{ league: League; group: Group }> = ({ league, group }) => {
  const dispatch = useAppDispatch();
  const stages = useAppSelector((s: RootState) => s.correspondent.stages[`${league.id}_${group.id}`] ?? []);
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState<StageType>('knockout');
  const [order, setOrder] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await firebaseLeagueService.listStages(league.id!, group.id!);
        dispatch(setStages({ leagueId: league.id!, groupId: group.id!, stages: list }));
      } catch (error) {
        console.error('Failed to load stages:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [league.id, group.id]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return alert('Stage name is required');

    setLoading(true);
    try {
      const res = await dispatch(createStage({ leagueId: league.id!, groupId: group.id!, stage: { name: name.trim(), order, type } }));
      // refresh
      const list = await firebaseLeagueService.listStages(league.id!, group.id!);
      dispatch(setStages({ leagueId: league.id!, groupId: group.id!, stages: list }));
      setName('');
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
    // Implement update logic here if needed, or just close for now to fix build
    // Ideally calls an updateStage thunk
    setEditingStageId(null);
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
                <div key={s.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-600 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      {editingStageId === s.id ? (
                        <div className="flex gap-2">
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-2 py-1 border rounded"
                          />
                          <button onClick={() => saveStageName(s)} className="text-sm text-blue-600">Save</button>
                          <button onClick={() => setEditingStageId(null)} className="text-sm text-gray-500">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <div className="font-bold text-gray-900 dark:text-white">{s.name}</div>
                          <button onClick={() => startEditing(s)} className="opacity-0 group-hover:opacity-100 text-xs text-blue-500">Edit</button>
                        </div>
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-300">{s.type.replace('_', ' ')} • Order {s.order}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <MatchManager league={league} group={group} stage={s} />
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