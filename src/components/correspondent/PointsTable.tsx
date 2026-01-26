import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group, Stage, Match, Fixture } from "@/models";
import { RootState } from "@/store";
import { fetchPointsTable } from "@/store/correspondentThunk";
import { setPoints } from "@/store/slices/correspondentSlice";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { useState, useEffect, useMemo } from "react";

interface CalculatedPoints {
  refId: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  adj: number;
}

export const PointsTable: React.FC<{ league: League; group: Group; seasonId?: string }> = ({ league, group, seasonId }) => {
  const dispatch = useAppDispatch();
  const [selectedStageId, setSelectedStageId] = useState<string>('all');
  const [updating, setUpdating] = useState(false);

  const effectiveGroupId = group?.id || '_general';

  // Redux Data
  const stages = useAppSelector((s: RootState) => s.correspondent.stages[`${league.id}_${effectiveGroupId}`] ?? []);
  const allMatchesMap = useAppSelector((s: RootState) => s.correspondent.matches);
  const fixtures = useAppSelector((s: RootState) => s.correspondent.fixtures) || [];
  const savedPoints = useAppSelector((s: RootState) => {
    const key = `${league.id}_${effectiveGroupId}${seasonId ? '_' + seasonId : ''}`;
    return (s.correspondent.points as any)[key] ?? [];
  });

  useEffect(() => {
    dispatch(fetchPointsTable({ leagueId: league.id!, groupId: effectiveGroupId, seasonId }));
  }, [league?.id, effectiveGroupId, seasonId, dispatch]);

  const matchesForCurrentContext = useMemo(() => {
    const contextMatches: Match[] = [];
    stages.forEach(st => {
      const key = `${league.id}_${effectiveGroupId}_${st.id}`;
      if (allMatchesMap[key]) {
        contextMatches.push(...allMatchesMap[key].map(m => ({ ...m, stageId: st.id } as any)));
      }
    });
    return contextMatches;
  }, [stages, allMatchesMap, league.id, effectiveGroupId]);

  const calculatedTable = useMemo(() => {
    const table: Record<string, CalculatedPoints> = {};

    const filteredMatches = selectedStageId === 'all'
      ? matchesForCurrentContext
      : matchesForCurrentContext.filter((m: any) => m.stageId === selectedStageId);

    filteredMatches.forEach(match => {
      const fixture = fixtures.find(f => f.matchId === match.id && f.status === 'completed');
      if (!fixture || !fixture.score) return;

      const { home: hScore, away: aScore } = fixture.score;
      const hAdj = (fixture.pointsAdded?.home || 0) - (fixture.pointsDeducted?.home || 0);
      const aAdj = (fixture.pointsAdded?.away || 0) - (fixture.pointsDeducted?.away || 0);

      const updateTeam = (teamId: string, teamName: string, scored: number, conceded: number, points: number, adj: number) => {
        if (!table[teamId]) {
          table[teamId] = { refId: teamId, name: teamName, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, adj: 0 };
        }
        const t = table[teamId];
        t.played += 1;
        t.gf += scored;
        t.ga += conceded;
        t.gd = t.gf - t.ga;
        t.adj += adj;
        if (points === 3) t.won += 1;
        else if (points === 1) t.drawn += 1;
        else t.lost += 1;
        t.points += points;
      };

      const hPts = hScore > aScore ? 3 : hScore === aScore ? 1 : 0;
      const aPts = aScore > hScore ? 3 : aScore === hScore ? 1 : 0;

      updateTeam(fixture.homeTeamId, fixture.homeTeamName, hScore, aScore, hPts, hAdj);
      updateTeam(fixture.awayTeamId, fixture.awayTeamName, aScore, hScore, aPts, aAdj);
    });

    const sorted = Object.values(table).sort((a, b) => {
      const aTotal = a.points + a.adj;
      const bTotal = b.points + b.adj;

      // 1. Total Points
      if (bTotal !== aTotal) return bTotal - aTotal;

      // 2. Head-to-Head (H2H) - Only for 2 teams currently for simplicity, 
      // but we can extend this to mini-tables for multi-team ties later if needed.
      const h2hMatches = matchesForCurrentContext.filter(m => {
        const pIds = m.participants.map(p => p.refId);
        return pIds.includes(a.refId) && pIds.includes(b.refId);
      });

      let aH2HPts = 0;
      let bH2HPts = 0;
      h2hMatches.forEach(m => {
        const fixture = fixtures.find(f => f.matchId === m.id && f.status === 'completed');
        if (!fixture || !fixture.score) return;
        const aScore = fixture.homeTeamId === a.refId ? fixture.score.home : fixture.score.away;
        const bScore = fixture.homeTeamId === b.refId ? fixture.score.home : fixture.score.away;
        if (aScore > bScore) aH2HPts += 3;
        else if (bScore > aScore) bH2HPts += 3;
        else { aH2HPts += 1; bH2HPts += 1; }
      });

      if (bH2HPts !== aH2HPts) return bH2HPts - aH2HPts;

      // 3. Goal Difference
      if (b.gd !== a.gd) return b.gd - a.gd;

      // 4. Goals For
      return b.gf - a.gf;
    });

    return sorted;
  }, [matchesForCurrentContext, fixtures, selectedStageId]);

  const handleUpdateStandings = async () => {
    setUpdating(true);
    try {
      // Save each team's total points (base + adj)
      const saveBatch = calculatedTable.map(t =>
        firebaseLeagueService.updatePoints(league.id!, effectiveGroupId, t.refId, t.points + t.adj, seasonId)
      );
      await Promise.all(saveBatch);
      dispatch(fetchPointsTable({ leagueId: league.id!, groupId: effectiveGroupId, seasonId }));
      alert('Standings updated successfully based on fixture results.');
    } catch (error) {
      console.error('Failed to update standings:', error);
      alert('Failed to update standings.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h4 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">📊</span> Calculated Standings
          </h4>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Automatic Leaderboard from Fixtures</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedStageId}
            onChange={(e) => setSelectedStageId(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
          >
            <option value="all">Overall Standings</option>
            {stages.map(st => (
              <option key={st.id} value={st.id}>{st.name} ({st.type === 'round_robin' ? 'RR' : 'KO'})</option>
            ))}
          </select>

          <button
            onClick={handleUpdateStandings}
            disabled={updating || calculatedTable.length === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Table'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Pos</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Team</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-center">P</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-center">W</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-center">D</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-center">L</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-center">GF/GA</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-center">GD</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-center bg-blue-50/50 dark:bg-blue-900/10">Base</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-center">Adj</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-center bg-blue-600 text-white rounded-t-lg">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-gray-900 dark:text-white">
            {calculatedTable.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-20 text-center text-gray-500 italic">
                  No completed fixtures found for this {selectedStageId === 'all' ? 'context' : 'stage'}.
                </td>
              </tr>
            ) : (
              calculatedTable.map((t, idx) => (
                <tr key={t.refId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="py-4 px-4 font-black text-xs text-gray-400">#{idx + 1}</td>
                  <td className="py-4 px-4">
                    <div className="font-black text-sm">{t.name}</div>
                    <div className="text-[10px] text-gray-400 tracking-tighter">ID: {t.refId}</div>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-sm">{t.played}</td>
                  <td className="py-4 px-4 text-center font-bold text-sm text-green-600">{t.won}</td>
                  <td className="py-4 px-4 text-center font-bold text-sm text-gray-500">{t.drawn}</td>
                  <td className="py-4 px-4 text-center font-bold text-sm text-red-500">{t.lost}</td>
                  <td className="py-4 px-4 text-center font-bold text-xs text-gray-500">{t.gf} / {t.ga}</td>
                  <td className={`py-4 px-4 text-center font-black text-xs ${t.gd > 0 ? 'text-green-500' : t.gd < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {t.gd > 0 ? `+${t.gd}` : t.gd}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-sm bg-blue-50/30 dark:bg-blue-900/5">{t.points}</td>
                  <td className={`py-4 px-4 text-center font-black text-xs ${t.adj > 0 ? 'text-green-500' : t.adj < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {t.adj > 0 ? `+${t.adj}` : t.adj === 0 ? '-' : t.adj}
                  </td>
                  <td className="py-4 px-4 text-center font-black text-lg bg-blue-600 text-white">
                    {t.points + t.adj}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-center">
          Note: Standings are calculated in real-time from completed fixtures. Push "Update Table" to persist totals to the public leaderboard.
        </p>
      </div>
    </div>
  );
};
