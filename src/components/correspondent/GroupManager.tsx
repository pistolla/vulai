import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { RootState } from "@/store";
import { createGroup } from "@/store/correspondentThunk";
import { setGroups } from "@/store/slices/correspondentSlice";
import { useState, useEffect } from "react";
import { StageManager } from "./StageManager";

// --- GroupManager ---
export const GroupManager: React.FC<{ league: League | null }> = ({ league }) => {
    const dispatch = useAppDispatch();
    const groups = useAppSelector((s: RootState) => (league ? s.correspondent.groups[league.id!] ?? [] : []));
    const [name, setName] = useState('');
  
    useEffect(() => {
      if (!league) return;
      // fetch groups from firebase service directly and store in UI slice
      (async () => {
        const list = await firebaseLeagueService.listGroups(league.id!);
        dispatch(setGroups({ leagueId: league.id!, groups: list }));
      })();
    }, [league?.id]);
  
    const submit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!league) return;
      if (!name) return alert('Provide group name');
      await dispatch(createGroup({ leagueId: league.id!, group: { name } }));
  
      // refresh groups
      const list = await firebaseLeagueService.listGroups(league.id!);
      dispatch(setGroups({ leagueId: league.id!, groups: list }));
      setName('');
    };
  
    return (
      <div className="p-4 bg-card rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Groups for {league?.name ?? '—'}</h3>
        {league ? (
          <>
            <form onSubmit={submit} className="flex gap-2 mb-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="input" />
              <button type="submit" className="btn btn-primary">Add Group</button>
            </form>
  
            <ul className="space-y-2">
              {groups.map((g) => (
                <li key={g.id} className="p-2 rounded bg-card-subtle flex justify-between items-center">
                  <div>
                    <div className="font-medium">{g.name}</div>
                    <div className="text-sm text-muted">{g.description}</div>
                  </div>
                  <div>
                    <StageManager league={league} group={g} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div>Select a league first</div>
        )}
      </div>
    );
  };
  