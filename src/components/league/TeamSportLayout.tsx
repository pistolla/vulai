import React from 'react';

interface TeamSportLayoutProps {
  leagueData: any;
}

export const TeamSportLayout: React.FC<TeamSportLayoutProps> = ({ leagueData }) => {
  // Calculate points table from matches
  const calculatePointsTable = () => {
    const teams: { [key: string]: { name: string; wins: number; draws: number; losses: number; points: number; goalsFor: number; goalsAgainst: number } } = {};
    
    // Initialize teams
    Object.values(leagueData.groups || {}).forEach((group: any) => {
      Object.values(group.stages || {}).forEach((stage: any) => {
        Object.values(stage.matches || {}).forEach((match: any) => {
          if (match.participants) {
            Object.values(match.participants).forEach((participant: any) => {
              if (!teams[participant.refId]) {
                teams[participant.refId] = {
                  name: participant.refId, // In real app, this would be resolved to team name
                  wins: 0,
                  draws: 0,
                  losses: 0,
                  points: 0,
                  goalsFor: 0,
                  goalsAgainst: 0
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
              const team1 = teams[p1.refId];
              const team2 = teams[p2.refId];
              
              if (team1 && team2) {
                team1.goalsFor += p1.score || 0;
                team1.goalsAgainst += p2.score || 0;
                team2.goalsFor += p2.score || 0;
                team2.goalsAgainst += p1.score || 0;

                if (p1.score > p2.score) {
                  team1.wins++;
                  team1.points += 3;
                  team2.losses++;
                } else if (p2.score > p1.score) {
                  team2.wins++;
                  team2.points += 3;
                  team1.losses++;
                } else {
                  team1.draws++;
                  team2.draws++;
                  team1.points += 1;
                  team2.points += 1;
                }
              }
            }
          }
        });
      });
    });

    return Object.values(teams).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aGD = a.goalsFor - a.goalsAgainst;
      const bGD = b.goalsFor - b.goalsAgainst;
      if (bGD !== aGD) return bGD - aGD;
      return b.goalsFor - a.goalsFor;
    });
  };

  const pointsTable = calculatePointsTable();

  return (
    <div className="space-y-8">
      {/* Groups Section */}
      {leagueData.groups && Object.keys(leagueData.groups).length > 0 && (
        <section className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
            Groups & Conferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(leagueData.groups).map(([groupId, group]: [string, any]) => (
              <div key={groupId} className="bg-white/5 rounded-lg p-6">
                <h4 className="text-xl font-semibold mb-4 text-white">{group.name}</h4>
                
                {/* Stages in this group */}
                <div className="space-y-3">
                  {Object.entries(group.stages || {}).map(([stageId, stage]: [string, any]) => (
                    <div key={stageId} className="bg-white/5 rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-white">{stage.name}</h5>
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          {Object.keys(stage.matches || {}).length} matches
                        </span>
                      </div>
                      
                      {/* Teams in this stage */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.values(stage.matches || {}).map((match: any, idx: number) => {
                          if (match.participants) {
                            return Object.values(match.participants).map((participant: any, pIdx: number) => (
                              <span key={`${idx}-${pIdx}`} className="text-xs bg-white/10 text-gray-700 px-2 py-1 rounded">
                                {participant.refId}
                              </span>
                            ));
                          }
                          return null;
                        }).flat().filter((item, index, arr) => 
                          arr.findIndex(t => t?.key === item?.key) === index
                        )}
                      </div>
                    </div>
                  ))}
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
                <th className="pb-3 text-gray-700">Pos</th>
                <th className="pb-3 text-gray-700">Team</th>
                <th className="pb-3 text-gray-700 text-center">P</th>
                <th className="pb-3 text-gray-700 text-center">W</th>
                <th className="pb-3 text-gray-700 text-center">D</th>
                <th className="pb-3 text-gray-700 text-center">L</th>
                <th className="pb-3 text-gray-700 text-center">GF</th>
                <th className="pb-3 text-gray-700 text-center">GA</th>
                <th className="pb-3 text-gray-700 text-center">GD</th>
                <th className="pb-3 text-gray-700 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {pointsTable.map((team, index) => (
                <tr key={team.name} className="border-b border-white/10">
                  <td className="py-3">
                    <span className="w-8 h-8 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 font-medium">{team.name}</td>
                  <td className="py-3 text-center">{team.wins + team.draws + team.losses}</td>
                  <td className="py-3 text-center">{team.wins}</td>
                  <td className="py-3 text-center">{team.draws}</td>
                  <td className="py-3 text-center">{team.losses}</td>
                  <td className="py-3 text-center">{team.goalsFor}</td>
                  <td className="py-3 text-center">{team.goalsAgainst}</td>
                  <td className="py-3 text-center">{team.goalsFor - team.goalsAgainst}</td>
                  <td className="py-3 text-center font-bold text-unill-yellow-400">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};