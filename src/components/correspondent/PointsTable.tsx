import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group } from "@/models";
import { RootState } from "@/store";
import { fetchPointsTable } from "@/store/correspondentThunk";
import { setPoints } from "@/store/slices/correspondentSlice";
import { useEffect } from "react";

// Define proper type for points data
interface PointsEntry {
  refId: string;
  points: number;
}

// --- PointsTable ---
export const PointsTable: React.FC<{ league: League; group: Group; seasonId?: string }> = ({ league, group, seasonId }) => {
  const dispatch = useAppDispatch();

  // Ensure IDs exist before creating the key
  // We include seasonId in the key to partition points by season in the store
  const pointsKey = league.id && group.id ? `${league.id}_${group.id}${seasonId ? '_' + seasonId : ''}` : null;
  const points = useAppSelector((s: RootState) => {
    if (!pointsKey) return [];
    // Type assertion with proper fallback
    return (s.correspondent.points as Record<string, PointsEntry[]>)[pointsKey] ?? [];
  });

  useEffect(() => {
    if (!league?.id || !group?.id) return;

    (async () => {
      const res = await dispatch(fetchPointsTable({ leagueId: league.id!, groupId: group.id!, seasonId }));
      if (res.payload) {
        dispatch(setPoints({ leagueId: league.id!, groupId: group.id!, seasonId, points: res.payload.points }));
      }
    })();
  }, [league?.id, group?.id, seasonId, dispatch]);

  return (
    <div className="p-4 bg-card rounded-lg">
      <h4 className="font-semibold">Points</h4>
      <table className="w-full mt-2 table-auto">
        <thead>
          <tr className="text-left text-xs text-muted"><th>Participant</th><th>Points</th></tr>
        </thead>
        <tbody>
          {points.map((p: PointsEntry) => (
            <tr key={p.refId} className="border-t">
              <td>{p.refId}</td>
              <td>{p.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
