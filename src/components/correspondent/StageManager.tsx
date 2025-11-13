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

    return (
      <div className="p-2">
        <details open={isOpen} onToggle={(e) => setIsOpen(e.currentTarget.open)}>
          <summary className="cursor-pointer font-medium text-sm">
            Stages ({stages.length})
          </summary>
          <div className="mt-3 space-y-3">
            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Stage name"
                className={`input ${
                  theme === 'light'
                    ? 'bg-white/20 border-white/30 text-white placeholder:text-white/70'
                    : ''
                }`}
                disabled={loading}
                required
              />
              <input
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                type="number"
                placeholder="Order"
                className={`input ${
                  theme === 'light'
                    ? 'bg-white/20 border-white/30 text-white placeholder:text-white/70'
                    : ''
                }`}
                disabled={loading}
                min="1"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as StageType)}
                className={`input ${
                  theme === 'light'
                    ? 'bg-white/20 border-white/30 text-white'
                    : ''
                }`}
                disabled={loading}
              >
                <option value="knockout">Knockout</option>
                <option value="round_robin">Round Robin</option>
              </select>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !name.trim()}
              >
                {loading ? 'Adding...' : 'Add Stage'}
              </button>
            </form>

            <div className="space-y-2">
              {loading && stages.length === 0 ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-xs">Loading stages...</p>
                </div>
              ) : (
                stages.map((s: any) => (
                  <div key={s.id} className={`p-3 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 ${
                    theme === 'light'
                      ? 'bg-white/10'
                      : 'bg-card-subtle'
                  }`}>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-muted">{s.type} • Order {s.order}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <MatchManager league={league} group={group} stage={s} />
                    </div>
                  </div>
                ))
              )}
              {stages.length === 0 && !loading && (
                <div className="text-center py-4 text-muted text-sm">
                  No stages yet. Add your first stage above.
                </div>
              )}
            </div>
          </div>
        </details>
      </div>
    );
  };