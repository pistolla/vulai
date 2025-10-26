import React from 'react';

interface IndividualSportLayoutProps {
  leagueData: any;
}

export const IndividualSportLayout: React.FC<IndividualSportLayoutProps> = ({ leagueData }) => {
  // Calculate player rankings from matches
  const calculatePlayerRankings = () => {
    const players: { [key: string]: { name: string; wins: number; losses: number; points: number; matchesPlayed: number } } = {};
    
    // Initialize players
    Object.values(leagueData.groups || {}).forEach((group: any) => {
      Object.values(group.stages || {}).forEach((stage: any) => {
        Object.values(stage.matches || {}).forEach((match: any) => {
          if (match.participants) {
            Object.values(match.participants).forEach((participant: any) => {
              if (!players[participant.refId]) {
                players[participant.refId] = {
                  name: participant.refId, // In real app, this would be resolved to player name
                  wins: 0,
                  losses: 0,
                  points: 0,
                  matchesPlayed: 0
                };
              }
            });
          }
        });
      });
    });

    // Calculate stats from completed matches
    Object.values(leagueData.groups || {}).forEach((group: any) => {
      Object.values(group.stages || {}).forEach((stage: any) => {
        Object.values(stage.matches || {}).forEach((match: any) => {
          if (match.status === 'completed' && match.participants) {
            const participants = Object.values(match.participants) as any[];
            if (participants.length === 2) {
              const [p1, p2] = participants;
              const player1 = players[p1.refId];
              const player2 = players[p2.refId];
              
              if (player1 && player2) {
                player1.matchesPlayed++;
                player2.matchesPlayed++;

                if (p1.score > p2.score) {
                  player1.wins++;
                  player1.points += 3;
                  player2.losses++;
                } else if (p2.score > p1.score) {
                  player2.wins++;
                  player2.points += 3;
                  player1.losses++;
                } else {
                  // Draw - give 1 point each
                  player1.points += 1;
                  player2.points += 1;
                }
              }
            }
          }
        });
      });
    });

    return Object.values(players).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });
  };

  const playerRankings = calculatePlayerRankings();

  // Get all stages across groups
  const getAllStages = () => {
    const stages: { [key: string]: { name: string; status: string; matchCount: number; groupName: string } } = {};
    
    Object.entries(leagueData.groups || {}).forEach(([groupId, group]: [string, any]) => {
      Object.entries(group.stages || {}).forEach(([stageId, stage]: [string, any]) => {
        stages[`${groupId}_${stageId}`] = {
          name: stage.name,
          status: stage.status || 'pending',
          matchCount: Object.keys(stage.matches || {}).length,
          groupName: group.name
        };
      });
    });

    return stages;
  };

  const allStages = getAllStages();

  return (
    <div className="space-y-8">
      {/* Tournament Stages */}
      <section className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
          Tournament Stages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(allStages).map(([stageKey, stage]) => (
            <div key={stageKey} className="bg-white/5 rounded-lg p-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-2 text-white">{stage.name}</h4>
                <p className="text-sm text-gray-300 mb-3">{stage.groupName}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                  stage.status === 'completed' ? 'bg-green-500 text-white' :
                  stage.status === 'active' ? 'bg-blue-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {stage.status.charAt(0).toUpperCase() + stage.status.slice(1)}
                </div>
                <div className="text-sm text-gray-300">
                  {stage.matchCount} {stage.matchCount === 1 ? 'match' : 'matches'}
                </div>
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
          {playerRankings.map((player, index) => (
            <div key={player.name} className="bg-white/5 rounded-lg p-6">
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
                  <h4 className="text-lg font-semibold text-white">{player.name}</h4>
                  <p className="text-sm text-gray-300">{player.points} points</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-green-400 font-bold text-lg">{player.wins}</div>
                  <div className="text-gray-300">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 font-bold text-lg">{player.losses}</div>
                  <div className="text-gray-300">Losses</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-bold text-lg">{player.matchesPlayed}</div>
                  <div className="text-gray-300">Played</div>
                </div>
              </div>
              {player.matchesPlayed > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-gray-400 mb-1">Win Rate</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" 
                      style={{ width: `${(player.wins / player.matchesPlayed) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {Math.round((player.wins / player.matchesPlayed) * 100)}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Tournament Bracket Visualization */}
      <section className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
          Tournament Progress
        </h3>
        <div className="space-y-6">
          {Object.entries(leagueData.groups || {}).map(([groupId, group]: [string, any]) => (
            <div key={groupId} className="bg-white/5 rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-4 text-white">{group.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(group.stages || {}).map(([stageId, stage]: [string, any]) => (
                  <div key={stageId} className="bg-white/5 rounded p-4">
                    <h5 className="font-medium text-white mb-3">{stage.name}</h5>
                    <div className="space-y-2">
                      {Object.entries(stage.matches || {}).map(([matchId, match]: [string, any]) => (
                        <div key={matchId} className="bg-white/5 rounded p-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex-1">
                              {match.participants && Object.values(match.participants).map((participant: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between mb-1">
                                  <span className="text-gray-300">{participant.refId}</span>
                                  {match.status === 'completed' && (
                                    <span className="font-bold text-unill-yellow-400">{participant.score}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            {match.status === 'completed' ? 'Completed' : 
                             match.status === 'live' ? 'Live' : 'Scheduled'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};