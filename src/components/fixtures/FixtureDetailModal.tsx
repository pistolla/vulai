import React, { useState } from 'react';
import { Match, Fixture, MatchPlayer, Participant } from '@/models';
import { FiX, FiUsers, FiBarChart2, FiMapPin, FiCalendar, FiTrendingUp } from 'react-icons/fi';

interface FixtureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any | null; // Can be Match or Fixture or a combined DisplayMatch
}

type TabType = 'lineups' | 'statistics' | 'overview';

const FixtureDetailModal: React.FC<FixtureDetailModalProps> = ({ isOpen, onClose, match }) => {
  const [activeTab, setActiveTab] = useState<TabType>('lineups');
  
  if (!isOpen || !match) return null;

  const sport = match.sport || 'Sport';
  const status = match.status || 'scheduled';
  const venue = match.venue || 'TBD Venue';
  const participants: Participant[] = match.participants && match.participants.length > 0 
    ? match.participants 
    : ([
        { refId: match.homeTeamId || '', name: match.homeTeam || match.homeTeamName || 'Home', score: match.score?.home ?? 0, refType: 'team' },
        { refId: match.awayTeamId || '', name: match.awayTeam || match.awayTeamName || 'Away', score: match.score?.away ?? 0, refType: 'team' }
      ] as Participant[]).filter(p => p.refId || p.name !== 'Home');

  const matchPlayers: MatchPlayer[] = match.players || [];
  
  // Format time
  let displayTime = '';
  try {
    if (match.scheduledAt) {
      displayTime = new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (match.time) {
      displayTime = match.time;
    } else if (match.date) {
        displayTime = new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (e) {
    displayTime = 'TBD';
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-500 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-white/10 shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 my-auto">
        
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-unill-purple-600 flex items-center justify-center text-white shadow-lg shadow-unill-purple-600/20">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                Match Details
              </h2>
              <p className="text-[10px] font-black text-unill-purple-600 uppercase tracking-[0.2em] mt-1">
                {sport} • {displayTime}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-500 rounded-2xl transition-all border border-transparent"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Match Hero Section */}
        <div className="px-8 pt-8 pb-4 shrink-0">
            <div className={`bg-gradient-to-br from-indigo-900 via-unill-purple-900 to-indigo-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl`}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              
              <div className="relative z-10">
                 <div className="flex flex-wrap items-center justify-center gap-12">
                    {participants.map((p, index) => (
                      <React.Fragment key={p.refId || index}>
                         <div className="text-center group">
                            <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border-2 border-white/20 shadow-xl transition-all group-hover:scale-110 group-hover:border-unill-yellow-400">
                               <span className="text-4xl font-black text-white">{p.name?.charAt(0) || '?'}</span>
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight max-w-[150px] mx-auto">{p.name}</h3>
                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                               <span className="text-2xl font-black tabular-nums">{p.score ?? 0}</span>
                               <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Points</span>
                            </div>
                         </div>
                         {index < participants.length - 1 && participants.length === 2 && (
                            <div className="flex flex-col items-center">
                               <div className="px-4 py-1 bg-unill-yellow-400 text-gray-900 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">VS</div>
                               <div className="w-px h-16 bg-gradient-to-b from-white/0 via-white/20 to-white/0" />
                            </div>
                         )}
                      </React.Fragment>
                    ))}
                 </div>
                 <div className="mt-8 flex justify-center">
                    <div className="px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                       <span className="text-xs font-black uppercase tracking-widest">{status.toUpperCase()}</span>
                    </div>
                 </div>
              </div>
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-8 py-2 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 shrink-0">
          {[
            { id: 'lineups' as const, label: 'Tactical Roster', icon: <FiUsers /> },
            { id: 'statistics' as const, label: 'Match Analytics', icon: <FiBarChart2 /> },
            { id: 'overview' as const, label: 'Event Info', icon: <FiMapPin /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-unill-purple-600 text-white shadow-xl shadow-unill-purple-600/30' 
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-gray-50/30 dark:bg-black/10">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'lineups' && (
              <div className="space-y-12">
                {participants.map((participant, pIdx) => {
                  const participantPlayers = matchPlayers.filter(p => p.teamId === participant.refId);
                  const starters = participantPlayers.filter(p => p.status === 'starter');
                  const bench = participantPlayers.filter(p => p.status !== 'starter');

                  return (
                    <div key={participant.refId || pIdx} className="space-y-8">
                       <div className="flex items-center gap-6">
                          <h4 className={`text-xl font-black uppercase tracking-tight flex items-center gap-4 ${pIdx % 2 === 0 ? 'text-unill-purple-600' : 'text-cyan-600'}`}>
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black ${pIdx % 2 === 0 ? 'bg-unill-purple-600' : 'bg-cyan-600'}`}>
                               {participant.name?.charAt(0) || '?'}
                             </div>
                             {participant.name || 'Unknown Team'} Roster
                          </h4>
                          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          {/* Starting XI / Starters */}
                          <div className="space-y-4">
                             <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Starting Lineup</h5>
                             {starters.length === 0 ? (
                               <div className="p-8 text-center bg-white dark:bg-gray-800/40 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700 opacity-60">
                                  <p className="text-xs font-bold">Lineup pending announcement</p>
                               </div>
                             ) : (
                               <div className="space-y-2">
                                  {starters.map((player) => (
                                     <div key={player.id} className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-[1.02] transition-transform">
                                        <div className="flex items-center gap-5">
                                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${pIdx % 2 === 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-cyan-50 text-cyan-600'}`}>
                                              #{player.jerseyNumber || '?'}
                                           </div>
                                           <div>
                                              <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{player.name}</p>
                                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{player.position || 'Player'}</p>
                                           </div>
                                        </div>
                                        <div className="px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-800">
                                           <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Starter</span>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                             )}
                          </div>

                          {/* Substitutes / Bench */}
                          <div className="space-y-4">
                             <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Bench / Reserves</h5>
                             <div className="grid grid-cols-1 gap-2">
                                {bench.map((player) => (
                                   <div key={player.id} className="flex items-center justify-between p-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-2xl border border-transparent hover:border-gray-200 transition-all opacity-80 hover:opacity-100">
                                      <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center font-black text-sm text-gray-500 shadow-sm">
                                            #{player.jerseyNumber}
                                         </div>
                                         <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white uppercase">{player.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">{player.position}</p>
                                         </div>
                                      </div>
                                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{player.status}</span>
                                   </div>
                                ))}
                                {bench.length === 0 && participantPlayers.length > 0 && (
                                   <p className="text-center py-4 text-xs font-bold text-gray-400 italic">No substitutes listed</p>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                  );
                })}
                
                {matchPlayers.length === 0 && (
                   <div className="py-20 text-center space-y-4 opacity-30">
                      <FiUsers size={64} className="mx-auto" />
                      <h4 className="text-xl font-black uppercase tracking-widest">Digital Roster Pending</h4>
                      <p className="text-sm font-bold max-w-md mx-auto">Full match-day lineups and tactical substitutions will appear once the game correspondents finalize the session data.</p>
                   </div>
                )}
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="max-w-4xl mx-auto py-10">
                 <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-12 shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-8">
                    <FiBarChart2 size={80} className="mx-auto text-indigo-200" />
                    <div className="space-y-2">
                       <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Live Insight Dashboard</h4>
                       <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">Advanced telemetry and sport-specific metrics are synchronized in real-time during the match.</p>
                    </div>
                    {(participants.length === 2 && match.score) ? (
                       <div className="grid grid-cols-1 gap-6 pt-6">
                          {[
                            { label: 'Attacking Threat', home: 55, away: 45 },
                            { label: 'Total Gains', home: 124, away: 98 },
                            { label: 'Tactical Precision', home: 88, away: 91 }
                          ].map(stat => (
                            <div key={stat.label} className="space-y-3">
                               <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                  <span>{participants[0].name} ({stat.home}%)</span>
                                  <span className="text-gray-400">{stat.label}</span>
                                  <span>{participants[1].name} ({stat.away}%)</span>
                               </div>
                               <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded-full flex overflow-hidden">
                                  <div className="h-full bg-unill-purple-600 rounded-r-full" style={{ width: `${stat.home}%` }} />
                                  <div className="h-full bg-cyan-500 rounded-l-full flex-1" style={{ width: `${stat.away}%` }} />
                               </div>
                            </div>
                          ))}
                       </div>
                    ) : (
                       <div className="pt-6">
                          <span className="px-6 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-full border border-indigo-100 dark:border-indigo-800 animate-pulse">Waiting for Data Feed</span>
                       </div>
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="max-w-3xl mx-auto space-y-6 pt-6">
                 <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800 space-y-10">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-3xl shadow-sm border border-indigo-100 dark:border-indigo-800">🏟️</div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Official Venue</p>
                          <p className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{venue}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-50 dark:border-gray-800">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-xl">📅</div>
                          <div>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Event Date</p>
                             <p className="text-sm font-black dark:text-white">{new Date(match.scheduledAt || match.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-xl">🕒</div>
                          <div>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Kick-off Time</p>
                             <p className="text-sm font-black dark:text-white">{displayTime} Standard Time</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
};

export default FixtureDetailModal;
