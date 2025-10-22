import { useAppDispatch } from "@/hooks/redux";
import { League, Group, Stage, Match } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { updateMatchScores } from "@/store/correspondentThunk";
import { setPoints } from "@/store/slices/correspondentSlice";
import { useState, useEffect } from "react";

// --- MatchCard (view + update scores) ---
export const MatchCard: React.FC<{ league: League; group: Group; stage: Stage; match: Match }> = ({ league, group, stage, match }) => {
    const dispatch = useAppDispatch();
    const [local, setLocal] = useState<Match>(match);
  
    useEffect(() => setLocal(match), [match]);
  
    const updateScore = (idx: number, val: number) => {
      const p = [...local.participants];
      p[idx].score = val;
      setLocal({ ...local, participants: p });
    };
  
    const saveScores = async () => {
      await dispatch(updateMatchScores({ leagueId: league.id!, groupId: group.id!, stageId: stage.id!, matchId: match.id!, participants: local.participants }));
      // optional: refresh points
      const pts = await firebaseLeagueService.getPointsTable(league.id!, group.id!);
      dispatch(setPoints({ leagueId: league.id!, groupId: group.id!, points: pts }));
    };
  
    return (
      <div className="p-3 rounded bg-card grid gap-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold">Match {match.matchNumber} • {new Date(match.date).toLocaleString()}</div>
            <div className="text-sm text-muted">{match.venue}</div>
          </div>
          <div className="text-sm">Status: <span className="font-medium">{match.status}</span></div>
        </div>
  
        <div className="grid gap-2">
          {local.participants.map((p, idx) => (
            <div key={p.refId + idx} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="font-medium">{p.name ?? p.refId}</div>
                <div className="text-xs text-muted">{p.refType} • {p.refId}</div>
              </div>
              <input type="number" value={p.score} onChange={(e) => updateScore(idx, Number(e.target.value))} className="input w-28" />
            </div>
          ))}
  
          <div className="flex gap-2">
            <button onClick={saveScores} className="btn btn-primary">Save Scores & Compute Winner</button>
          </div>
  
          {match.winnerId && <div className="text-sm">Winner: <strong>{match.winnerId}</strong></div>}
        </div>
      </div>
    );
  };
  