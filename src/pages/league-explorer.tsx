import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { League, Match, Group, Stage } from '../models';
import { firebaseLeagueService } from '../services/firebaseCorrespondence';
import { useTheme } from '../components/ThemeProvider';

interface LeagueExplorerData {
  league: League;
  allMatches: Match[];
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
        const allMatches: Match[] = [];
        for (const group of groups) {
          const stages = await firebaseLeagueService.listStages(leagueId, group.id!);
          for (const stage of stages) {
            const matches = await firebaseLeagueService.listMatches(leagueId, group.id!, stage.id!);
            allMatches.push(...matches);
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
      <section className={`pt-24 pb-16 bg-gradient-to-b from-black/30 to-transparent ${themeMounted && theme === 'light' ? 'bg-transparent' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
            {league.name} Explorer
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Complete match history and results for {league.name}
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4">
            <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium text-white">
              {league.sportType === 'team' ? 'Team Sport' : 'Individual Sport'}
            </span>
            <span className="px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full text-sm font-medium text-green-400">
              {allMatches.length} Total Matches
            </span>
          </div>
        </div>
      </section>

      {/* Match History */}
      <section className={`py-16 ${themeMounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-50 via-mauve-100 to-mauve-200' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Match History
            </h2>
            <p className="text-gray-700">All matches sorted by date (newest first)</p>
          </div>

          {Object.keys(matchesByDate).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No matches found for this league.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(matchesByDate).map(([date, matches]) => (
                <div key={date} className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4 text-unill-yellow-400 border-b border-white/10 pb-2">
                    {date}
                  </h3>
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                        onClick={() => router.push(`/match/${match.id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-400 w-16">
                            {new Date(match.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="text-left">
                                  <div className="font-semibold">{match.participants?.[0]?.name || 'Team A'}</div>
                                </div>
                                <div className="text-center px-4">
                                  <div className={`text-lg font-bold ${getMatchStatusColor(match.status)}`}>
                                    {getScoreDisplay(match)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">{match.participants?.[1]?.name || 'Team B'}</div>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {match.venue && `📍 ${match.venue}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getMatchStatusColor(match.status)}`}>
                            {match.status.toUpperCase()}
                          </div>
                          {match.status === 'completed' && match.winnerId && (
                            <div className="text-xs text-gray-400 mt-1">
                              Winner: {match.participants?.find(p => p.refId === match.winnerId)?.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default LeagueExplorerPage;