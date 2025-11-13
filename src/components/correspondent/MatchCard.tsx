import { useAppDispatch } from "@/hooks/redux";
import { League, Group, Stage, Match } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { updateMatchScores } from "@/store/correspondentThunk";
import { setPoints } from "@/store/slices/correspondentSlice";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

// --- MatchCard (view + update scores) ---
export const MatchCard: React.FC<{ league: League; group: Group; stage: Stage; match: Match }> = ({ league, group, stage, match }) => {
    const dispatch = useAppDispatch();
    const { theme } = useTheme();
    const [local, setLocal] = useState<Match>(match);
    const [saving, setSaving] = useState(false);

    useEffect(() => setLocal(match), [match]);

    const updateScore = (idx: number, val: number) => {
      const p = [...local.participants];
      p[idx].score = val;
      setLocal({ ...local, participants: p });
    };

    const saveScores = async () => {
      try {
        setSaving(true);
        await dispatch(updateMatchScores({ leagueId: league.id!, groupId: group.id!, stageId: stage.id!, matchId: match.id!, participants: local.participants }));
        // optional: refresh points
        const pts = await firebaseLeagueService.getPointsTable(league.id!, group.id!);
        dispatch(setPoints({ leagueId: league.id!, groupId: group.id!, points: pts }));
      } catch (error) {
        console.error('Failed to save scores:', error);
        alert('Failed to save scores. Please try again.');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className={`p-3 rounded grid gap-2 ${
        theme === 'light'
          ? 'bg-white/10 backdrop-blur-md border border-white/20'
          : 'bg-card'
      }`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm sm:text-base">Match {match.matchNumber}</div>
            <div className="text-xs sm:text-sm text-muted">
              {new Date(match.date).toLocaleDateString()} at {new Date(match.date).toLocaleTimeString()}
            </div>
            {match.venue && (
              <div className="text-xs sm:text-sm text-muted">📍 {match.venue}</div>
            )}
          </div>
          <div className="text-xs sm:text-sm flex-shrink-0">
            Status: <span className={`font-medium px-2 py-1 rounded ${
              match.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              match.status === 'ongoing' ? 'bg-red-500/20 text-red-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {match.status}
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          {local.participants.map((p, idx) => (
            <div key={p.refId + idx} className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded ${
              theme === 'light'
                ? 'bg-white/10'
                : 'bg-card-subtle'
            }`}>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base truncate">{p.name ?? p.refId}</div>
                <div className="text-xs text-muted truncate">{p.refType} • {p.refId}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <label className="text-xs sm:text-sm font-medium">Score:</label>
                <input
                  type="number"
                  value={p.score}
                  onChange={(e) => updateScore(idx, Number(e.target.value))}
                  className={`input w-16 sm:w-20 text-sm ${
                    theme === 'light'
                      ? 'bg-white/20 border-white/30 text-white'
                      : ''
                  }`}
                  min="0"
                  disabled={saving}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button
              onClick={saveScores}
              disabled={saving}
              className="btn btn-primary text-sm flex-1 sm:flex-none"
            >
              {saving ? 'Saving...' : 'Save Scores & Compute Winner'}
            </button>
          </div>

          {match.winnerId && (
            <div className="text-xs sm:text-sm text-center p-2 rounded bg-green-500/20">
              🏆 Winner: <strong className="text-green-400">{match.winnerId}</strong>
            </div>
          )}
        </div>
      </div>
    );
  };
  