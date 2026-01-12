import { Match, League } from "@/models";
import { useAppSelector } from "@/hooks/redux";
import { useState, useEffect } from "react";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";

interface FixtureListProps {
  onSelect: (match: Match, league: League) => void;
}

export const FixtureList: React.FC<FixtureListProps> = ({ onSelect }) => {
  const [unlinkedMatches, setUnlinkedMatches] = useState<{ match: Match; league: League; groupName: string; stageName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const fixtures = useAppSelector((state) => state.correspondent.fixtures) || [];
  const leagues = useAppSelector((state) => state.correspondent.leagues) || [];

  useEffect(() => {
    const loadUnlinkedMatches = async () => {
      setLoading(true);
      try {
        const allMatches: { match: Match; league: League; groupName: string; stageName: string }[] = [];

        for (const league of leagues) {
          const groups = await firebaseLeagueService.listGroups(league.id!);
          for (const group of groups) {
            const stages = await firebaseLeagueService.listStages(league.id!, group.id!);
            for (const stage of stages) {
              const matches = await firebaseLeagueService.listMatches(league.id!, group.id!, stage.id!);
              matches.forEach(match => {
                if (!fixtures.some(f => f.matchId === match.id) && match.participants.length >= 2) {
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
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{groupName}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{stageName}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {match.participants.map(p => p.name || p.refId).join(' vs ')}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {new Date(match.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                      Create Fixture
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};