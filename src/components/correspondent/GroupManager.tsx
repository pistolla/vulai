import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { RootState } from "@/store";
import { createGroup } from "@/store/correspondentThunk";
import { setGroups } from "@/store/slices/correspondentSlice";
import { useState, useEffect } from "react";
import { StageManager } from "./StageManager";
import { useTheme } from "@/components/ThemeProvider";

// --- GroupManager ---
export const GroupManager: React.FC<{ league: League | null; onGroupSelect?: (group: any) => void }> = ({ league, onGroupSelect }) => {
    const dispatch = useAppDispatch();
    const groups = useAppSelector((s: RootState) => (league ? s.correspondent.groups[league.id!] ?? [] : []));
    const { theme } = useTheme();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (!league) return;
      // fetch groups from firebase service directly and store in UI slice
      (async () => {
        setLoading(true);
        try {
          const list = await firebaseLeagueService.listGroups(league.id!);
          dispatch(setGroups({ leagueId: league.id!, groups: list }));
        } catch (error) {
          console.error('Failed to load groups:', error);
        } finally {
          setLoading(false);
        }
      })();
    }, [league?.id]);

    const submit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!league) return;
      if (!name.trim()) return alert('Provide group name');

      setLoading(true);
      try {
        await dispatch(createGroup({ leagueId: league.id!, group: { name: name.trim() } }));

        // refresh groups
        const list = await firebaseLeagueService.listGroups(league.id!);
        dispatch(setGroups({ leagueId: league.id!, groups: list }));
        setName('');
      } catch (error) {
        console.error('Failed to create group:', error);
        alert('Failed to create group. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-black dark:text-white mb-4">Groups for {league?.name ?? '—'}</h3>
        {league ? (
          <>
            <form onSubmit={submit} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter group name"
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70 whitespace-nowrap"
                  disabled={loading || !name.trim()}
                >
                  {loading ? 'Adding...' : 'Add Group'}
                </button>
              </div>
            </form>

            {loading && groups.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading groups...</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {groups.map((g) => (
                  <li key={g.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer" onClick={() => onGroupSelect?.(g)}>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white">{g.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{g.description || 'No description'}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Select Group →</div>
                    </div>
                  </li>
                ))}
                {groups.length === 0 && !loading && (
                  <li className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="font-medium">No groups yet.</p>
                    <p className="text-sm">Add your first group above to organize matches.</p>
                  </li>
                )}
              </ul>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🏆</div>
            <p className="font-medium">Select a league first</p>
            <p className="text-sm">Choose a league to manage its groups and stages.</p>
          </div>
        )}
      </div>
    );
  };
  