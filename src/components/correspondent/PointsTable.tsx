import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group } from "@/models";
import { RootState } from "@/store";
import { fetchPointsTable } from "@/store/correspondentThunk";
import { setPoints } from "@/store/slices/correspondentSlice";
import { useEffect } from "react";

// --- PointsTable ---
export const PointsTable: React.FC<{ league: League; group: Group }> = ({ league, group }) => {
    const dispatch = useAppDispatch();
    const points = useAppSelector((s: RootState) => s.correspondent.points[`${league.id}_${group.id}`] ?? []);
  
    useEffect(() => {
      if (!league || !group) return;
      (async () => {
        const res = await dispatch(fetchPointsTable({ leagueId: league.id!, groupId: group.id! }));
        if (res.payload) dispatch(setPoints({ leagueId: league.id!, groupId: group.id!, points: res.payload.points }));
      })();
    }, [league?.id, group?.id]);
  
    return (
      <div className="p-4 bg-card rounded-lg">
        <h4 className="font-semibold">Points</h4>
        <table className="w-full mt-2 table-auto">
          <thead>
            <tr className="text-left text-xs text-muted"><th>Participant</th><th>Points</th></tr>
          </thead>
          <tbody>
            {points.map((p: any) => (
              <tr key={p.refId} className="border-t"><td>{p.refId}</td><td>{p.points}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  