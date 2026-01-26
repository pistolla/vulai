import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { useState, useEffect } from "react";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { FixtureResultPopup } from "./FixtureResultPopup";
import { Fixture, Match, League, Group } from "@/models";
import { updateFixture } from "@/store/correspondentThunk";

interface FixtureListProps {
  onSelect: (match: Match, league: League) => void;
}

export const FixtureList: React.FC<FixtureListProps> = ({ onSelect }) => {
  const [unlinkedMatches, setUnlinkedMatches] = useState<{ match: Match; league: League; groupName: string; stageName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const fixtures = useAppSelector((state) => state.correspondent.fixtures) || [];
  const leagues = useAppSelector((state) => state.correspondent.leagues) || [];
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const dispatch = useAppDispatch();

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      let successCount = 0;

      for (const line of lines) {
        const [matchNum, hScore, aScore] = line.split(',').map(s => s.trim());
        if (!matchNum || hScore === undefined || aScore === undefined) continue;

        const target = unlinkedMatches.find(m => m.match.matchNumber?.toString() === matchNum);
        const fixture = fixtures.find(f => f.matchId === target?.match.id);

        if (fixture) {
          try {
            await dispatch(updateFixture({
              id: fixture.id,
              fixture: {
                score: { home: parseInt(hScore), away: parseInt(aScore) },
                status: 'completed'
              }
            })).unwrap();
            successCount++;
          } catch (err) {
            console.error(`Failed to update match #${matchNum}`, err);
          }
        }
      }
      alert(`Bulk update complete. Successfully processed ${successCount} matches.`);
      setBulkProcessing(false);
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const loadUnlinkedMatches = async () => {
      setLoading(true);
      try {
        const allMatches: { match: Match; league: League; groupName: string; stageName: string }[] = [];

        for (const league of leagues) {
          const groups = await firebaseLeagueService.listGroups(league.id!);
          const groupsToProcess = groups.length > 0 ? groups : [{ id: '_general', name: 'General' } as Group];

          for (const group of groupsToProcess) {
            const stages = await firebaseLeagueService.listStages(league.id!, group.id!);
            for (const stage of stages) {
              const matches = await firebaseLeagueService.listMatches(league.id!, group.id!, stage.id!);
              matches.forEach(match => {
                const linkedFixture = fixtures.find(f => f.matchId === match.id);
                if (match.participants.length >= 2) {
                  allMatches.push({ match, league, groupName: group.name, stageName: stage.name });
                }
              });
            }
          }
        }

        setUnlinkedMatches(allMatches);
      } catch (error) {
        console.error('Failed to load unlinked matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUnlinkedMatches();
  }, [leagues, fixtures]);

  return (
    <div className="space-y-4">
      {/* Bulk Operations */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Bulk Operations</h4>
          <p className="text-[10px] text-indigo-400 dark:text-indigo-500 font-bold">Upload CSV (matchNumber, homeScore, awayScore)</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".csv"
            onChange={handleBulkUpload}
            className="hidden"
            id="bulk-csv"
            disabled={bulkProcessing}
          />
          <label
            htmlFor="bulk-csv"
            className="cursor-pointer px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            {bulkProcessing ? 'Processing...' : 'Upload CSV'}
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium">Loading matches...</p>
        </div>
      ) : unlinkedMatches.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-3xl mb-2">⚽</div>
          <p className="font-medium">No unlinked matches.</p>
          <p className="text-sm">All matches have fixtures or no matches available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Match</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">League</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Group</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Participants</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {unlinkedMatches.map(({ match, league, groupName, stageName }) => (
                <tr key={match.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onSelect(match, league)}>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">#{match.matchNumber}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{league.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{groupName === 'General' ? '-' : groupName}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{stageName}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {(() => {
                      const f = fixtures.find(f => f.matchId === match.id);
                      return f ? `${f.homeTeamName} vs ${f.awayTeamName}` : match.participants.map(p => p.name || p.refId).join(' vs ');
                    })()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {new Date(match.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelect(match, league); }}
                      className={`${fixtures.some(f => f.matchId === match.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 py-1 rounded text-xs`}
                    >
                      {fixtures.some(f => f.matchId === match.id) ? 'Edit' : 'Fixture'}
                    </button>
                    {fixtures.find(f => f.matchId === match.id) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedFixture(fixtures.find(f => f.matchId === match.id)!); }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Record
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedFixture && (
        <FixtureResultPopup
          fixture={selectedFixture}
          onClose={() => setSelectedFixture(null)}
        />
      )}
    </div>
  );
};