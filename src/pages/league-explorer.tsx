import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { League, Match, Group, Stage } from '../models';
import { firebaseLeagueService } from '../services/firebaseCorrespondence';
import { useTheme } from '../components/ThemeProvider';

interface MatchWithContext extends Match {
  groupName?: string;
  stageName?: string;
}

interface LeagueExplorerData {
  league: League;
  allMatches: MatchWithContext[];
}

const LeagueExplorerPage: React.FC = () => {
  const router = useRouter();
  const { leagueId } = router.query;
  const { theme, mounted: themeMounted } = useTheme();
  const [data, setData] = useState<LeagueExplorerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leagueId || typeof leagueId !== 'string') return;

    const loadLeagueHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch league details
        const league = await firebaseLeagueService.getLeague(leagueId);
        if (!league) {
          setError('League not found');
          setLoading(false);
          return;
        }

        // Fetch all groups
        const groups = await firebaseLeagueService.listGroups(leagueId);

        // Fetch all matches from all groups and stages
        const allMatches: MatchWithContext[] = [];
        for (const group of groups) {
          const stages = await firebaseLeagueService.listStages(leagueId, group.id!);
          for (const stage of stages) {
            const matches = await firebaseLeagueService.listMatches(leagueId, group.id!, stage.id!);
            // Enrich match with context
            const enrichedMatches = matches.map(m => ({
              ...m,
              groupName: group.name,
              stageName: stage.name
            }));
            allMatches.push(...enrichedMatches);
          }
        }

        // Sort matches by date (newest first for history view)
        allMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setData({
          league,
          allMatches
        });
      } catch (err) {
        console.error('Failed to load league history:', err);
        setError('Failed to load league history');
      } finally {
        setLoading(false);
      }
    };

    loadLeagueHistory();
  }, [leagueId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'live': return 'text-red-500 animate-pulse';
      case 'pending': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getScoreDisplay = (match: Match) => {
    if (match.status === 'completed' && match.participants && match.participants.length >= 2) {
      const home = match.participants[0];
      const away = match.participants[1];
      return `${home.score} - ${away.score}`;
    }
    return 'vs';
  };

  if (loading) {
    return (
      <Layout title="League Explorer" description="View league match history and results">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-unill-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading league history...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout title="League Explorer" description="View league match history and results">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600">{error || 'League not found'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 bg-unill-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-unill-yellow-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const { league, allMatches } = data;

  // Group matches by date
  const matchesByDate = allMatches.reduce((acc, match) => {
    const date = formatDate(match.date);
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <Layout title={`${league.name} - League Explorer`} description={`View match history and results for ${league.name}`}>
      {/* Hero Section */}
      <section className={`pt-32 pb-20 relative overflow-hidden ${themeMounted && theme === 'light' ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50' : 'bg-gray-900'}`}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {league.sportType === 'team' ? 'Team Sport' : 'Individual Sport'}
          </span>
          <h1 className="text-6xl md:text-7xl font-black mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            {league.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
            {league.description || `Complete match history, results, and upcoming fixtures for the ${league.name} season.`}
          </p>

          <div className="mt-10 flex items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">{allMatches.length}</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Matches Played</div>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {Array.from(new Set(allMatches.flatMap(m => m.participants?.map(p => p.refId) || []))).length}
              </div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Teams</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={`py-16 ${themeMounted && theme === 'light' ? 'bg-white' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Results Matrix */}
          <div className="mb-20">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Results Matrix</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Interactive cross-tabular view. Click on any score to view the complete head-to-head history.
              </p>
            </div>
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-blue-900/5 border border-gray-100 dark:border-gray-700 p-8">
              <LeagueMatrix matches={allMatches} />
            </div>
          </div>

          {/* Upcoming Fixtures */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white border-l-8 border-blue-600 pl-6">
              Upcoming Fixtures
            </h2>
            {allMatches.filter(m => m.status === 'scheduled' || m.status === 'pending' || m.status === 'postponed').length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 text-lg">No upcoming fixtures scheduled yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allMatches
                  .filter(m => m.status === 'scheduled' || m.status === 'pending' || m.status === 'postponed' || new Date(m.date) > new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 6)
                  .map(match => (
                    <div key={match.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 hover:border-blue-500/50 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {match.groupName || 'League'}
                        </span>
                        <span className="text-sm font-bold text-gray-400">
                          {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-6">
                        <div className="text-center flex-1">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{match.participants?.[0]?.name}</h4>
                        </div>
                        <div className="text-sm font-bold text-gray-300 dark:text-gray-600 px-4">VS</div>
                        <div className="text-center flex-1">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{match.participants?.[1]?.name}</h4>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div className="text-sm text-gray-500 truncate max-w-[150px]">
                          📍 {match.venue || 'TBD'}
                        </div>
                        <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                          {match.time ? match.time : new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} →
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Recent Results</h2>
            {/* Fallback List View for Mobile or Recent */}
            <div className="space-y-4">
              {allMatches.slice(0, 5).map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-400">{new Date(match.date).toLocaleDateString()}</div>
                    <div className="font-bold">{match.participants?.[0]?.name} vs {match.participants?.[1]?.name}</div>
                  </div>
                  <div className={`font-bold ${getMatchStatusColor(match.status)}`}>{getScoreDisplay(match)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

/* -------------------------------------
   Matrix Component
   ------------------------------------- */
const LeagueMatrix = ({ matches }: { matches: MatchWithContext[] }) => {
  // 1. Extract unique teams
  const teamsMap = new Map<string, { id: string; name: string; avatar?: string }>();
  matches.forEach(m => {
    m.participants?.forEach(p => {
      if (p.refId) teamsMap.set(p.refId, { id: p.refId, name: p.name || 'Unknown', avatar: undefined });
    });
  });
  // Fallback if participants use 'id'
  if (teamsMap.size === 0) {
    matches.forEach(m => {
      m.participants?.forEach((p: any) => {
        if (p.id) teamsMap.set(p.id, { id: p.id, name: p.name || 'Unknown', avatar: p.avatar });
      });
    });
  }

  const teams = Array.from(teamsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // 2. Build Grid Data (Row: Home, Col: Away) - Find ALL matches
  const getHeadToHeadMatches = (teamAId: string, teamBId: string) => {
    return matches.filter(m => {
      const pIds = m.participants?.map((p: any) => p.refId || p.id);
      return pIds?.includes(teamAId) && pIds?.includes(teamBId);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const [selectedHeadToHead, setSelectedHeadToHead] = useState<{ teamA: any, teamB: any, matches: MatchWithContext[] } | null>(null);

  return (
    <>
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr>
            <th className="p-3 text-left bg-black/20 text-white border border-white/10 rounded-tl-lg">
              <span className="text-xs uppercase tracking-wider font-bold">Home \ Away</span>
            </th>
            {teams.map(team => (
              <th key={team.id} className="p-3 text-center bg-black/20 text-white border border-white/10 w-24">
                <div className="flex flex-col items-center justify-center space-y-1" title={team.name}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {team.name.substring(0, 2)}
                  </div>
                  <span className="text-xs truncate max-w-[80px]">{team.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map(homeTeam => (
            <tr key={homeTeam.id}>
              <td className="p-3 bg-black/10 text-white border border-white/10 font-bold sticky left-0 z-10 backdrop-blur-md">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white">
                    {homeTeam.name.substring(0, 2)}
                  </div>
                  <span className="truncate max-w-[120px]">{homeTeam.name}</span>
                </div>
              </td>
              {teams.map(awayTeam => {
                if (homeTeam.id === awayTeam.id) {
                  return <td key={awayTeam.id} className="bg-gray-800/50 border border-white/10"></td>;
                }

                const h2hMatches = getHeadToHeadMatches(homeTeam.id, awayTeam.id);
                const latestMatch = h2hMatches[0];

                return (
                  <td
                    key={awayTeam.id}
                    className="p-2 border border-white/10 text-center hover:bg-white/10 transition-colors cursor-pointer h-16"
                    onClick={() => h2hMatches.length > 0 && setSelectedHeadToHead({ teamA: homeTeam, teamB: awayTeam, matches: h2hMatches })}
                  >
                    {latestMatch ? (
                      latestMatch.status === 'completed' ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-lg text-white">
                            {latestMatch.participants?.find((p: any) => (p.refId || p.id) === homeTeam.id)?.score} - {latestMatch.participants?.find((p: any) => (p.refId || p.id) === awayTeam.id)?.score}
                          </span>
                          {h2hMatches.length > 1 && (
                            <span className="text-[10px] text-green-400">View History ({h2hMatches.length})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-blue-400 font-medium">
                          {new Date(latestMatch.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Head-to-Head History Modal */}
      {selectedHeadToHead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedHeadToHead(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
              <div className="flex items-center space-x-8 mx-auto">
                <div className="text-center">
                  <h3 className="font-black text-xl text-gray-900 dark:text-white">{selectedHeadToHead.teamA.name}</h3>
                </div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">VS</div>
                <div className="text-center">
                  <h3 className="font-black text-xl text-gray-900 dark:text-white">{selectedHeadToHead.teamB.name}</h3>
                </div>
              </div>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white" onClick={() => setSelectedHeadToHead(null)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h4 className="text-sm font-bold uppercase text-gray-500 mb-4">Match History</h4>
              {selectedHeadToHead.matches.map((match) => (
                <div key={match.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                      {match.groupName || 'League'} • {match.stageName || 'Match'}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(match.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-black text-gray-900 dark:text-white">
                        {match.participants?.find((p: any) => (p.refId || p.id) === selectedHeadToHead.teamA.id)?.score ?? '-'}
                      </div>
                    </div>
                    <div className="px-4 text-gray-300 dark:text-gray-600 font-light text-2xl">:</div>
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-black text-gray-900 dark:text-white">
                        {match.participants?.find((p: any) => (p.refId || p.id) === selectedHeadToHead.teamB.id)?.score ?? '-'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {match.venue && `📍 ${match.venue}`}
                    </div>
                    <button
                      onClick={() => window.open(`/match/${match.id}`, '_blank')}
                      className="text-xs font-bold text-white bg-black dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:opacity-80 transition-opacity flex items-center space-x-1"
                    >
                      <span>View Details</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeagueExplorerPage;