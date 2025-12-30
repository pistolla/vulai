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
      const p = [...(local.participants || [])];
      if (p[idx]) {
        p[idx].score = val;
        setLocal({ ...local, participants: p });
      }
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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg text-gray-900 dark:text-white mb-1">Match {match.matchNumber}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {new Date(match.date).toLocaleDateString()} at {new Date(match.date).toLocaleTimeString()}
            </div>
            {match.venue && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">📍 {match.venue}</div>
            )}
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              match.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              match.status === 'ongoing' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {match.status}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {(local.participants || []).map((p, idx) => (
            <div key={p.refId + idx} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">{p.name ?? p.refId}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{p.refType} • {p.refId}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Score:</label>
                <input
                  type="number"
                  value={p.score}
                  onChange={(e) => updateScore(idx, Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white text-sm"
                  min="0"
                  disabled={saving}
                />
              </div>
            </div>
          ))}

          <button
            onClick={saveScores}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70"
          >
            {saving ? 'Saving Scores...' : 'Save Scores & Compute Winner'}
          </button>

          {match.winnerId && (
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="text-green-800 dark:text-green-400 font-bold">🏆 Winner</div>
              <div className="text-green-700 dark:text-green-300 mt-1">{match.winnerId}</div>
            </div>
          )}
        </div>
      </div>
    );
  };
  