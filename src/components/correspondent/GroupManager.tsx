import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { RootState } from "@/store";
import { createGroup } from "@/store/correspondentThunk";
import { setGroups } from "@/store/slices/correspondentSlice";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

// --- SubGroupManager Internal Component ---
const SubGroupManager: React.FC<{ league: League; parentGroup: Group }> = ({ league, parentGroup }) => {
  const [subGroups, setSubGroups] = useState<Group[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) {
      loadSubGroups();
    }
  }, [expanded]);

  const loadSubGroups = async () => {
    setLoading(true);
    try {
      const list = await firebaseLeagueService.listSubGroups(league.id!, parentGroup.id!);
      setSubGroups(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addSubGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await firebaseLeagueService.createSubGroup(league.id!, parentGroup.id!, { name: name.trim() });
      await loadSubGroups();
      setName('');
    } catch (e) {
      console.error(e);
      alert('Failed to create subgroup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline mb-2 flex items-center gap-1"
      >
        {expanded ? 'Hide Sub-groups' : `Show Sub-groups`}
      </button>

      {expanded && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <form onSubmit={addSubGroup} className="flex flex-col sm:flex-row gap-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="New Sub-group"
              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !name.trim()}
            >
              Add
            </button>
          </form>

          {loading && subGroups.length === 0 ? (
            <div className="text-xs text-gray-500">Loading...</div>
          ) : (
            <ul className="space-y-2">
              {subGroups.map(sg => (
                <li key={sg.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
                  <span className="font-bold text-gray-900 dark:text-white">{sg.name}</span>
                  {/* Recursion could go here if we supported deeper nesting */}
                </li>
              ))}
              {subGroups.length === 0 && !loading && (
                <div className="text-xs text-gray-500 italic">No sub-groups yet</div>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// --- GroupManager ---
export const GroupManager: React.FC<{ league: League | null; onGroupSelect?: (group: Group) => void }> = ({ league, onGroupSelect }) => {
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
                <li key={g.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex flex-col gap-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => onGroupSelect?.(g)}>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white">{g.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{g.description || 'No description'}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Select Group →</div>
                    </div>
                  </div>
                  {/* Sub-groups section */}
                  <SubGroupManager league={league} parentGroup={g} />
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