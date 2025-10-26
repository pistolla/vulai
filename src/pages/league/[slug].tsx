import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { PointsTable } from '../../components/correspondent/PointsTable';

interface LeagueData {
  id: string;
  name: string;
  description: string;
  sportType: 'team' | 'individual';
  sport: string;
  status: 'active' | 'upcoming' | 'completed';
  groups: Group[];
  stages: Stage[];
  matches: Match[];
  participants: Participant[];
}

interface Group {
  id: string;
  name: string;
  participants: string[];
}

interface Stage {
  id: string;
  name: string;
  type: 'group' | 'knockout' | 'round-robin';
  status: 'pending' | 'active' | 'completed';
}

interface Match {
  id: string;
  groupId?: string;
  stageId: string;
  participants: MatchParticipant[];
  date: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'completed';
  score?: any;
}

interface MatchParticipant {
  id: string;
  name: string;
  type: 'team' | 'individual';
  score?: number;
}

interface Participant {
  id: string;
  name: string;
  type: 'team' | 'individual';
  points: number;
  wins: number;
  losses: number;
  draws?: number;
}

const LeaguePage: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'stages' | 'matches' | 'standings'>('overview');

  useEffect(() => {
    if (!slug) return;

    const loadLeagueData = async () => {
      try {
        // Mock data based on slug - in real app this would come from Firebase
        const mockLeagueData = getMockLeagueData(slug as string);
        setLeagueData(mockLeagueData);
      } catch (error) {
        console.error('Failed to load league data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeagueData();
  }, [slug]);

  const getMockLeagueData = (slug: string): LeagueData => {
    const baseData = {
      id: slug,
      status: 'active' as const,
    };

    switch (slug) {
      case 'football-championship':
        return {
          ...baseData,
          name: 'Football Championship',
          description: 'Annual university football championship featuring top teams',
          sportType: 'team',
          sport: 'football',
          groups: [
            { id: 'group-a', name: 'Group A', participants: ['eagles', 'lions', 'tigers', 'wolves'] },
            { id: 'group-b', name: 'Group B', participants: ['sharks', 'bears', 'hawks', 'panthers'] }
          ],
          stages: [
            { id: 'group-stage', name: 'Group Stage', type: 'group', status: 'completed' },
            { id: 'semifinals', name: 'Semi Finals', type: 'knockout', status: 'active' },
            { id: 'final', name: 'Final', type: 'knockout', status: 'pending' }
          ],
          matches: [
            {
              id: 'match-1',
              groupId: 'group-a',
              stageId: 'group-stage',
              participants: [
                { id: 'eagles', name: 'Eagles', type: 'team', score: 2 },
                { id: 'lions', name: 'Lions', type: 'team', score: 1 }
              ],
              date: '2024-03-15',
              time: '15:00',
              venue: 'Main Stadium',
              status: 'completed',
              score: { home: 2, away: 1 }
            },
            {
              id: 'match-2',
              groupId: 'group-a',
              stageId: 'semifinals',
              participants: [
                { id: 'eagles', name: 'Eagles', type: 'team' },
                { id: 'sharks', name: 'Sharks', type: 'team' }
              ],
              date: '2024-03-22',
              time: '16:00',
              venue: 'Championship Stadium',
              status: 'scheduled'
            }
          ],
          participants: [
            { id: 'eagles', name: 'Eagles', type: 'team', points: 9, wins: 3, losses: 0, draws: 0 },
            { id: 'sharks', name: 'Sharks', type: 'team', points: 7, wins: 2, losses: 0, draws: 1 },
            { id: 'lions', name: 'Lions', type: 'team', points: 6, wins: 2, losses: 1, draws: 0 },
            { id: 'tigers', name: 'Tigers', type: 'team', points: 4, wins: 1, losses: 1, draws: 1 }
          ]
        };

      case 'tennis-tournament':
        return {
          ...baseData,
          name: 'Tennis Tournament',
          description: 'Individual tennis championship with knockout format',
          sportType: 'individual',
          sport: 'tennis',
          groups: [],
          stages: [
            { id: 'round-1', name: 'First Round', type: 'knockout', status: 'completed' },
            { id: 'quarterfinals', name: 'Quarter Finals', type: 'knockout', status: 'active' },
            { id: 'semifinals', name: 'Semi Finals', type: 'knockout', status: 'pending' },
            { id: 'final', name: 'Final', type: 'knockout', status: 'pending' }
          ],
          matches: [
            {
              id: 'tennis-match-1',
              stageId: 'round-1',
              participants: [
                { id: 'player-1', name: 'John Smith', type: 'individual', score: 6 },
                { id: 'player-2', name: 'Mike Johnson', type: 'individual', score: 3 }
              ],
              date: '2024-03-10',
              time: '10:00',
              venue: 'Tennis Court 1',
              status: 'completed',
              score: { sets: [6, 6], opponent_sets: [3, 4] }
            },
            {
              id: 'tennis-match-2',
              stageId: 'quarterfinals',
              participants: [
                { id: 'player-1', name: 'John Smith', type: 'individual' },
                { id: 'player-3', name: 'David Wilson', type: 'individual' }
              ],
              date: '2024-03-17',
              time: '14:00',
              venue: 'Tennis Court 1',
              status: 'scheduled'
            }
          ],
          participants: [
            { id: 'player-1', name: 'John Smith', type: 'individual', points: 100, wins: 3, losses: 0 },
            { id: 'player-3', name: 'David Wilson', type: 'individual', points: 85, wins: 2, losses: 1 },
            { id: 'player-4', name: 'Sarah Davis', type: 'individual', points: 75, wins: 2, losses: 1 },
            { id: 'player-5', name: 'Emma Brown', type: 'individual', points: 60, wins: 1, losses: 2 }
          ]
        };

      default:
        return {
          ...baseData,
          name: 'Unknown League',
          description: 'League not found',
          sportType: 'team',
          sport: 'unknown',
          groups: [],
          stages: [],
          matches: [],
          participants: []
        };
    }
  };

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

  const renderTeamSportLayout = () => (
    <div className="space-y-8">
      {/* Groups Section */}
      {leagueData.groups.length > 0 && (
        <section className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
            Groups
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leagueData.groups.map((group) => (
              <div key={group.id} className="bg-white/5 rounded-lg p-6">
                <h4 className="text-xl font-semibold mb-4 text-white">{group.name}</h4>
                <div className="space-y-2">
                  {group.participants.map((participantId, index) => {
                    const participant = leagueData.participants.find(p => p.id === participantId);
                    return (
                      <div key={participantId} className="flex items-center justify-between p-3 bg-white/5 rounded">
                        <div className="flex items-center">
                          <span className="w-8 h-8 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {index + 1}
                          </span>
                          <span className="font-medium">{participant?.name || participantId}</span>
                        </div>
                        <div className="text-sm text-gray-300">
                          {participant?.points || 0} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Points Table */}
      <section className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
          League Table
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/20">
                <th className="pb-3 text-gray-300">Pos</th>
                <th className="pb-3 text-gray-300">Team</th>
                <th className="pb-3 text-gray-300 text-center">W</th>
                <th className="pb-3 text-gray-300 text-center">D</th>
                <th className="pb-3 text-gray-300 text-center">L</th>
                <th className="pb-3 text-gray-300 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {leagueData.participants
                .sort((a, b) => b.points - a.points)
                .map((participant, index) => (
                  <tr key={participant.id} className="border-b border-white/10">
                    <td className="py-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 font-medium">{participant.name}</td>
                    <td className="py-3 text-center">{participant.wins}</td>
                    <td className="py-3 text-center">{participant.draws || 0}</td>
                    <td className="py-3 text-center">{participant.losses}</td>
                    <td className="py-3 text-center font-bold text-unill-yellow-400">{participant.points}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderIndividualSportLayout = () => (
    <div className="space-y-8">
      {/* Tournament Bracket/Stages */}
      <section className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
          Tournament Stages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leagueData.stages.map((stage) => (
            <div key={stage.id} className="bg-white/5 rounded-lg p-6 text-center">
              <h4 className="text-lg font-semibold mb-2 text-white">{stage.name}</h4>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                stage.status === 'completed' ? 'bg-green-500 text-white' :
                stage.status === 'active' ? 'bg-blue-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {stage.status.charAt(0).toUpperCase() + stage.status.slice(1)}
              </div>
              <div className="mt-3 text-sm text-gray-300">
                {leagueData.matches.filter(m => m.stageId === stage.id).length} matches
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Player Rankings */}
      <section className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
          Player Rankings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagueData.participants
            .sort((a, b) => b.points - a.points)
            .map((participant, index) => (
              <div key={participant.id} className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-4 ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                    'bg-gradient-to-br from-unill-purple-400 to-unill-purple-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{participant.name}</h4>
                    <p className="text-sm text-gray-300">{participant.points} points</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-400 font-bold text-lg">{participant.wins}</div>
                    <div className="text-gray-300">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-bold text-lg">{participant.losses}</div>
                    <div className="text-gray-300">Losses</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );

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
          {leagueData.sportType === 'team' ? renderTeamSportLayout() : renderIndividualSportLayout()}

          {/* Scheduled Matches */}
          <section className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 mt-8">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Scheduled Matches
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {leagueData.matches.map((match) => (
                <div key={match.id} className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      match.status === 'live' ? 'bg-red-500 text-white' :
                      match.status === 'completed' ? 'bg-green-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {match.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-300">{match.date} • {match.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center flex-1">
                      <h4 className="font-semibold text-white mb-2">{match.participants[0]?.name}</h4>
                      {match.score && (
                        <div className="text-2xl font-bold text-unill-yellow-400">
                          {match.participants[0]?.score}
                        </div>
                      )}
                    </div>
                    <div className="text-gray-400 text-lg font-bold mx-4">VS</div>
                    <div className="text-center flex-1">
                      <h4 className="font-semibold text-white mb-2">{match.participants[1]?.name}</h4>
                      {match.score && (
                        <div className="text-2xl font-bold text-unill-yellow-400">
                          {match.participants[1]?.score}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-300">
                    📍 {match.venue}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
};

export default LeaguePage;