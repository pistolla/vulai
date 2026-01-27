import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { TeamSportLayout } from '../../components/league/TeamSportLayout';
import { IndividualSportLayout } from '../../components/league/IndividualSportLayout';
import { ScheduledMatches } from '../../components/league/ScheduledMatches';
import { LeagueVisualizer } from '../../components/correspondent/LeagueVisualizer';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchLeagues } from '../../store/correspondentThunk';
import { League, Group, Stage, Match, Participant } from '../../models';
import { firebaseLeagueService } from '../../services/firebaseCorrespondence';
import { loadLiveGames, loadUpcomingGames } from '../../services/firestoreAdmin';
import { Fixture } from '../../models';

interface LeagueData {
  id: string;
  name: string;
  description: string;
  sportType: 'team' | 'individual';
  sport: string;
  status: 'active' | 'upcoming' | 'completed';
  groups: { [key: string]: Group };
  stages: { [key: string]: Stage };
  matches: { [key: string]: Match };
  participants: Participant[];
}

const LeaguePage: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useAppDispatch();
  const { leagues, loading: leaguesLoading } = useAppSelector((state) => state.leagues);
  const fixtures = useAppSelector((state) => state.correspondent.fixtures || []);
  const [league, setLeague] = useState<League | null>(null);
  const [leagueData, setLeagueData] = useState<any>(null);
  const [leagueFixtures, setLeagueFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'stages' | 'matches' | 'standings'>('overview');

  useEffect(() => {
    if (!slug) return;

    const loadLeagueData = async () => {
      try {
        setLoading(true);

        // Fetch specific league data from Firebase
        const leagueObj = await firebaseLeagueService.getLeague(slug as string);
        if (!leagueObj) {
          setLoading(false);
          return;
        }
        setLeague(leagueObj);

        // Fetch groups, stages, and matches for this league
        const groups = await firebaseLeagueService.listGroups(slug as string);

        // Build league data structure expected by components
        const leagueData: LeagueData = {
          id: leagueObj.id!,
          name: leagueObj.name,
          description: leagueObj.description || '',
          sportType: leagueObj.sportType,
          sport: leagueObj.name, // Using name as sport for now
          status: 'active', // Default status
          groups: {},
          stages: {},
          matches: {},
          participants: []
        };

        // Fetch stages and matches for each group
        for (const group of groups) {
          leagueData.groups[group.id!] = group;

          const stages = await firebaseLeagueService.listStages(slug as string, group.id!);
          for (const stage of stages) {
            leagueData.stages[`${group.id}_${stage.id}`] = stage;

            const matches = await firebaseLeagueService.listMatches(slug as string, group.id!, stage.id!);
            for (const match of matches) {
              leagueData.matches[`${group.id}_${stage.id}_${match.id}`] = match;
            }
          }
        }

        // Load fixtures related to this league's matches
        try {
          const [live, upcoming] = await Promise.all([
            loadLiveGames(),
            loadUpcomingGames()
          ]);
          const allFixtures = [...live, ...upcoming];
          // Filter fixtures that have matchId in this league's matches
          const leagueMatchIds = Object.values(leagueData.matches).map((match: any) => match.id);
          const leagueFixtures = allFixtures.filter(fixture =>
            fixture.matchId && leagueMatchIds.includes(fixture.matchId)
          );
          setLeagueFixtures(leagueFixtures);
        } catch (fixtureError) {
          console.error('Failed to load fixtures:', fixtureError);
        }
      } catch (error) {
        console.error('Failed to load league data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeagueData();
  }, [slug]);

  if (loading) {
    return (
      <Layout title="League" description="View league details, standings, and matches">
        <div className="min-h-screen bg-gradient-to-b from-black/30 to-transparent">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-unill-yellow-400 mx-auto"></div>
              <p className="mt-4 text-gray-700">Loading league data...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!leagueData) {
    return (
      <Layout title="League Not Found" description="The requested league could not be found">
        <div className="min-h-screen bg-gradient-to-b from-black/30 to-transparent">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">League Not Found</h1>
              <p className="text-gray-600">The requested league could not be found.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={leagueData.name} description={leagueData.description}>
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-black/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              {leagueData.name}
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-6">
              {leagueData.description}
            </p>
            <div className="flex items-center justify-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                leagueData.status === 'active' ? 'bg-green-500 text-white' :
                leagueData.status === 'upcoming' ? 'bg-blue-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {leagueData.status.charAt(0).toUpperCase() + leagueData.status.slice(1)}
              </span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium text-white">
                {leagueData.sportType === 'team' ? 'Team Sport' : 'Individual Sport'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {leagueData.sportType === 'team' ? (
            <TeamSportLayout leagueData={leagueData} />
          ) : (
            <IndividualSportLayout leagueData={leagueData} />
          )}

          <div className="mt-8">
            <ScheduledMatches leagueData={leagueData} />
          </div>

          {/* History Table */}
          <section className="mt-8 bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Match History & Results
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="pb-3 text-gray-700">Date</th>
                    <th className="pb-3 text-gray-700">Home Team</th>
                    <th className="pb-3 text-gray-700">Score</th>
                    <th className="pb-3 text-gray-700">Away Team</th>
                    <th className="pb-3 text-gray-700">Status</th>
                    <th className="pb-3 text-gray-700">Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {fixtures.map((fixture: Fixture) => (
                    <tr key={fixture.id} className="border-b border-white/10">
                      <td className="py-3">{new Date(fixture.scheduledAt).toLocaleDateString()}</td>
                      <td className="py-3 font-medium">{fixture.homeTeamName}</td>
                      <td className="py-3 text-center">
                        {fixture.score ? `${fixture.score.home} - ${fixture.score.away}` : 'TBD'}
                      </td>
                      <td className="py-3 font-medium">{fixture.awayTeamName}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          fixture.status === 'completed' ? 'bg-green-500 text-white' :
                          fixture.status === 'live' ? 'bg-red-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {fixture.status}
                        </span>
                      </td>
                      <td className="py-3">{fixture.venue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* League Visualizer */}
          {league && (
            <section className="mt-8">
              <LeagueVisualizer league={league} />
            </section>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default LeaguePage;
