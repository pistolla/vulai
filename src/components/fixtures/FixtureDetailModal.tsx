import React from 'react';
import { Match, Fixture } from '@/models';

interface FixtureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any | null; // Can be Match or Fixture or a combined DisplayMatch
}

const FixtureDetailModal: React.FC<FixtureDetailModalProps> = ({ isOpen, onClose, match }) => {
  if (!isOpen || !match) return null;

  const homeTeam = match.homeTeam || match.homeTeamName || 'Home Team';
  const awayTeam = match.awayTeam || match.awayTeamName || 'Away Team';
  const sport = match.sport || 'Sport';
  const status = match.status || 'scheduled';
  const score = match.score || { home: 0, away: 0 };
  const venue = match.venue || 'TBD Venue';
  
  // Format time - handle both date string and scheduledAt
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
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-white/10 shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 my-auto">
        {/* Modal Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-unill-purple-600 flex items-center justify-center text-white shadow-lg shadow-unill-purple-600/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                Fixture Detail
              </h2>
              <p className="text-sm font-bold text-unill-purple-600 uppercase tracking-[0.2em]">
                {sport} • {displayTime}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-full transition-all group"
          >
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 bg-red-400 opacity-0 group-hover:opacity-20 rounded-full blur-lg animate-pulse" />
              <svg className="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="animate-in fade-in duration-700">
            {/* Match Hero Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-unill-purple-900 to-indigo-950 rounded-[3rem] p-10 mb-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-unill-yellow-400 opacity-10 blur-[100px] rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-unill-purple-400 opacity-20 blur-[100px] rounded-full" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                 <div className="flex-1 text-center group cursor-default">
                    <div className="w-28 h-28 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 border-white/20 transform group-hover:rotate-12 transition-transform duration-500 shadow-xl">
                      <span className="text-5xl">🦁</span>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight mb-2">{homeTeam}</h3>
                    <div className="h-1.5 w-12 bg-unill-yellow-400 mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
                 
                 <div className="flex flex-col items-center">
                    <div className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-unill-yellow-400'}`} />
                        <span className="text-xs font-black uppercase tracking-widest">{status === 'live' ? 'Live Match' : 'Scheduled'}</span>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="text-7xl font-black tabular-nums tracking-tighter drop-shadow-2xl">{score.home ?? '0'}</span>
                      <div className="flex flex-col items-center opacity-30">
                        <span className="text-3xl font-black">VS</span>
                      </div>
                      <span className="text-7xl font-black tabular-nums tracking-tighter drop-shadow-2xl">{score.away ?? '0'}</span>
                    </div>
                    <div className="mt-8 flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/5">
                        <svg className="w-4 h-4 text-unill-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-bold opacity-80">{venue}</span>
                    </div>
                 </div>

                 <div className="flex-1 text-center group cursor-default">
                    <div className="w-28 h-28 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 border-white/20 transform group-hover:-rotate-12 transition-transform duration-500 shadow-xl">
                      <span className="text-5xl">🦅</span>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight mb-2">{awayTeam}</h3>
                    <div className="h-1.5 w-12 bg-cyan-400 mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
              </div>
            </div>

            {/* Lineups Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Home Team Squad */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <div className="w-3 h-8 bg-unill-purple-600 rounded-full shadow-lg shadow-unill-purple-600/30" />
                    {homeTeam} Lineup
                  </h4>
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-black text-gray-400 uppercase">Pro Squad</div>
                </div>
                <div className="bg-gray-50/50 dark:bg-gray-800/10 rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-unill-purple-500 to-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-lg">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-black text-base text-gray-900 dark:text-white">Player {i + 1}</p>
                            <p className="text-xs font-bold text-unill-purple-500 uppercase tracking-widest">Key Starter</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-unill-yellow-500 italic">★ 9.2</p>
                        </div>
                     </div>
                  ))}
                </div>
              </div>

              {/* Away Team Squad */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <div className="w-3 h-8 bg-cyan-600 rounded-full shadow-lg shadow-cyan-600/30" />
                    {awayTeam} Lineup
                  </h4>
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-black text-gray-400 uppercase">First XI</div>
                </div>
                <div className="bg-gray-50/50 dark:bg-gray-800/10 rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-sm text-white shadow-lg">
                            {i + 14}
                          </div>
                          <div>
                            <p className="font-black text-base text-gray-900 dark:text-white">Player {i + 6}</p>
                            <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest">Crucial Role</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-unill-yellow-500 italic">★ 8.7</p>
                        </div>
                     </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="mt-12 pt-12 border-t border-gray-100 dark:border-gray-800">
               <div className="flex items-center justify-center gap-4 mb-10">
                  <div className="h-px w-20 bg-gray-200 dark:bg-gray-800" />
                  <h4 className="font-black text-gray-400 uppercase tracking-[0.4em] text-[10px]">Head to Head Stats</h4>
                  <div className="h-px w-20 bg-gray-200 dark:bg-gray-800" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-3xl mx-auto">
                  {[
                    { label: 'Attacking Threat', home: '78%', away: '62%', fill: 78, color: 'unill-purple' },
                    { label: 'Defensive Walls', home: '45%', away: '55%', fill: 45, color: 'unill-purple' },
                    { label: 'Team Chemistry', home: '92%', away: '88%', fill: 92, color: 'unill-purple' }
                  ].map(stat => (
                    <div key={stat.label} className="space-y-4 group">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                          <span className="text-unill-purple-600">{stat.home}</span>
                          <span className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{stat.label}</span>
                          <span className="text-cyan-600">{stat.away}</span>
                       </div>
                       <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
                          <div className="h-full bg-unill-purple-600 shadow-lg shadow-unill-purple-600/40" style={{ width: `${stat.fill}%` }} />
                          <div className="h-full bg-cyan-600 flex-1 shadow-lg shadow-cyan-600/40" />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixtureDetailModal;
