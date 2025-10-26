import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { TeamSportLayout } from '../../components/league/TeamSportLayout';
import { IndividualSportLayout } from '../../components/league/IndividualSportLayout';
import { ScheduledMatches } from '../../components/league/ScheduledMatches';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchLeagues } from '../../store/correspondentThunk';
import { League, Group, Stage, Match, Participant } from '../../models';
import { firebaseLeagueService } from '../../services/firebaseCorrespondence';

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
  const [leagueData, setLeagueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'stages' | 'matches' | 'standings'>('overview');

  useEffect(() => {
    if (!slug) return;

    const loadLeagueData = async () => {
      try {
        setLoading(true);

        // Fetch the specific league data from Firebase
        const league = await firebaseLeagueService.getLeague(slug as string);
        if (!league) {
          setLoading(false);
          return;
        }

        // Fetch groups, stages, and matches for this league
        const groups = await firebaseLeagueService.listGroups(slug as string);

        // Build the league data structure expected by components
        const leagueData: LeagueData = {
          id: league.id!,
          name: league.name,
          description: league.description || '',
          sportType: league.sportType,
          sport: league.name, // Using name as sport for now
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

        setLeagueData(leagueData);
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
              <p className="mt-4 text-gray-300">Loading league data...</p>
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
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
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
        </div>
      </section>
    </Layout>
  );
};

export default LeaguePage;