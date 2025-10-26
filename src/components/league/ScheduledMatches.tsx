import React from 'react';

interface ScheduledMatchesProps {
  leagueData: any;
}

export const ScheduledMatches: React.FC<ScheduledMatchesProps> = ({ leagueData }) => {
  // Get all matches from all groups and stages
  const getAllMatches = () => {
    const matches: any[] = [];
    
    Object.entries(leagueData.groups || {}).forEach(([groupId, group]: [string, any]) => {
      Object.entries(group.stages || {}).forEach(([stageId, stage]: [string, any]) => {
        Object.entries(stage.matches || {}).forEach(([matchId, match]: [string, any]) => {
          matches.push({
            ...match,
            id: matchId,
            groupName: group.name,
            stageName: stage.name,
            groupId,
            stageId
          });
        });
      });
    });

    // Sort matches by date
    return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const allMatches = getAllMatches();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'pending':
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return 'LIVE';
      case 'completed':
        return 'COMPLETED';
      case 'pending':
      default:
        return 'SCHEDULED';
    }
  };

  return (
    <section className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
      <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
        Scheduled Matches
      </h3>
      
      {allMatches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No matches scheduled</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allMatches.map((match) => (
            <div key={match.id} className="bg-white/5 rounded-lg p-6">
              {/* Match Header */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(match.status)}`}>
                  {getStatusText(match.status)}
                </span>
                <div className="text-right text-sm text-gray-300">
                  <div>{formatDate(match.date)}</div>
                  <div>{formatTime(match.date)}</div>
                </div>
              </div>

              {/* Match Info */}
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-1">
                  {match.groupName} • {match.stageName}
                </div>
              </div>
              
              {/* Participants */}
              <div className="flex items-center justify-between mb-4">
                {match.participants && Object.values(match.participants).length >= 2 ? (
                  <>
                    <div className="text-center flex-1">
                      <h4 className="font-semibold text-white mb-2">
                        {(Object.values(match.participants)[0] as any)?.refId || 'TBD'}
                      </h4>
                      {match.status === 'completed' && (
                        <div className="text-2xl font-bold text-unill-yellow-400">
                          {(Object.values(match.participants)[0] as any)?.score || 0}
                        </div>
                      )}
                    </div>
                    <div className="text-gray-400 text-lg font-bold mx-4">VS</div>
                    <div className="text-center flex-1">
                      <h4 className="font-semibold text-white mb-2">
                        {(Object.values(match.participants)[1] as any)?.refId || 'TBD'}
                      </h4>
                      {match.status === 'completed' && (
                        <div className="text-2xl font-bold text-unill-yellow-400">
                          {(Object.values(match.participants)[1] as any)?.score || 0}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center w-full text-gray-400">
                    Participants TBD
                  </div>
                )}
              </div>

              {/* Live Match Progress */}
              {match.status === 'live' && (
                <div className="bg-white/10 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                    <span>Match in progress</span>
                    <span className="animate-pulse text-red-400">● LIVE</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                  </div>
                </div>
              )}

              {/* Upcoming Match Info */}
              {match.status === 'pending' && (
                <div className="bg-white/10 rounded-lg p-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                      {formatDate(match.date)}
                    </div>
                    <div className="text-sm text-gray-300">{formatTime(match.date)}</div>
                  </div>
                </div>
              )}
              
              {/* Venue */}
              <div className="text-center text-sm text-gray-300">
                📍 {match.venue || 'Venue TBD'}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {match.status === 'live' && (
                  <button className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all">
                    Watch Live
                  </button>
                )}
                {match.status === 'pending' && (
                  <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all">
                    Set Reminder
                  </button>
                )}
                {match.status === 'completed' && (
                  <button className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:from-green-600 hover:to-green-700 transition-all">
                    View Report
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};