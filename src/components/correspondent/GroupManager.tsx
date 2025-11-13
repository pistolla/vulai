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
export const GroupManager: React.FC<{ league: League | null }> = ({ league }) => {
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
      <div className={`p-4 rounded-lg shadow-sm ${
        theme === 'light'
          ? 'bg-white/10 backdrop-blur-md border border-white/20'
          : 'bg-card'
      }`}>
        <h3 className="text-lg font-semibold mb-2">Groups for {league?.name ?? '—'}</h3>
        {league ? (
          <>
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group name"
                className={`input flex-1 ${
                  theme === 'light'
                    ? 'bg-white/20 border-white/30 text-white placeholder:text-white/70'
                    : ''
                }`}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary whitespace-nowrap"
                disabled={loading || !name.trim()}
              >
                {loading ? 'Adding...' : 'Add Group'}
              </button>
            </form>

            {loading && groups.length === 0 ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm">Loading groups...</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {groups.map((g) => (
                  <li key={g.id} className={`p-3 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 ${
                    theme === 'light'
                      ? 'bg-white/10'
                      : 'bg-card-subtle'
                  }`}>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{g.name}</div>
                      <div className="text-sm text-muted">{g.description}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <StageManager league={league} group={g} />
                    </div>
                  </li>
                ))}
                {groups.length === 0 && !loading && (
                  <li className="text-center py-4 text-muted">
                    No groups yet. Add your first group above.
                  </li>
                )}
              </ul>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted">
            Select a league first to manage groups
          </div>
        )}
      </div>
    );
  };
  