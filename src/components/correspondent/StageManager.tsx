import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group, StageType } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { RootState } from "@/store";
import { createStage } from "@/store/correspondentThunk";
import { setStages } from "@/store/slices/correspondentSlice";
import { useState, useEffect } from "react";
import { MatchManager } from "./MatchManager";

// --- StageManager ---
export const StageManager: React.FC<{ league: League; group: Group }> = ({ league, group }) => {
    const dispatch = useAppDispatch();
    const stages = useAppSelector((s: RootState) => s.correspondent.stages[`${league.id}_${group.id}`] ?? []);
    const [name, setName] = useState('');
    const [type, setType] = useState<StageType>('knockout');
    const [order, setOrder] = useState(1);
  
    useEffect(() => {
      (async () => {
        const list = await firebaseLeagueService.listStages(league.id!, group.id!);
        dispatch(setStages({ leagueId: league.id!, groupId: group.id!, stages: list }));
      })();
    }, [league.id, group.id]);
  
    const submit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!name) return alert('name required');
      const res = await dispatch(createStage({ leagueId: league.id!, groupId: group.id!, stage: { name, order, type } }));
      // refresh
      const list = await firebaseLeagueService.listStages(league.id!, group.id!);
      dispatch(setStages({ leagueId: league.id!, groupId: group.id!, stages: list }));
      setName('');
    };
  
    return (
      <div className="p-2">
        <details>
          <summary className="cursor-pointer">Stages ({stages.length})</summary>
          <form onSubmit={submit} className="mt-2 flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Stage name" className="input" />
            <input value={order} onChange={(e) => setOrder(Number(e.target.value))} type="number" className="input w-24" />
            <select value={type} onChange={(e) => setType(e.target.value as StageType)} className="input w-36">
              <option value="knockout">Knockout</option>
              <option value="round_robin">Round Robin</option>
            </select>
            <button className="btn btn-primary">Add</button>
          </form>
  
          <div className="mt-2 space-y-2">
            {stages.map((s: any) => (
              <div key={s.id} className="p-2 rounded bg-card-subtle">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-muted">{s.type} • Order {s.order}</div>
                  </div>
                  <div>
                    <MatchManager league={league} group={group} stage={s} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    );
  };