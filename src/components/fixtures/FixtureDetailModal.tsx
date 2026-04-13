import React, { useState } from 'react';
import { Match, Fixture } from '@/models';

interface FixtureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any | null; // Can be Match or Fixture or a combined DisplayMatch
}

type TabType = 'lineups' | 'statistics' | 'overview';

const FixtureDetailModal: React.FC<FixtureDetailModalProps> = ({ isOpen, onClose, match }) => {
  const [activeTab, setActiveTab] = useState<TabType>('lineups');
  
  if (!isOpen || !match) return null;

  const homeTeam = match.homeTeam || match.homeTeamName || 'Home Team';
  const awayTeam = match.awayTeam || match.awayTeamName || 'Away Team';
  const sport = match.sport || 'Sport';
  const status = match.status || 'scheduled';
  const score = match.score || { home: 0, away: 0 };
  const venue = match.venue || 'TBD Venue';
  
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                Fixture Detail
              </h2>
              <p className="text-[10px] font-black text-unill-purple-600 uppercase tracking-[0.2em] mt-1">
                {sport} • {displayTime}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-full transition-all group"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Match Hero Card (Fixed context at top) */}
        <div className="px-8 pt-8 pb-4 shrink-0">
            <div className="bg-gradient-to-br from-indigo-900 via-unill-purple-900 to-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              
              <div className="relative z-10 flex items-center justify-between gap-8">
                 <div className="flex-1 text-center">
                    <div className="w-20 h-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border-2 border-white/20 shadow-xl">
                      <span className="text-4xl">🦁</span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight truncate">{homeTeam}</h3>
                 </div>
                 
                 <div className="flex flex-col items-center">
                    <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-unill-yellow-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{status === 'live' ? 'Live Match' : 'Scheduled'}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-5xl font-black tabular-nums tracking-tighter">{score.home ?? '0'}</span>
                      <span className="text-xl font-black opacity-30">VS</span>
                      <span className="text-5xl font-black tabular-nums tracking-tighter">{score.away ?? '0'}</span>
                    </div>
                 </div>

                 <div className="flex-1 text-center">
                    <div className="w-20 h-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border-2 border-white/20 shadow-xl">
                      <span className="text-4xl">🦅</span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight truncate">{awayTeam}</h3>
                 </div>
              </div>
            </div>
        </div>

        {/* Tab Navbar */}
        <div className="px-8 py-2 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 shrink-0">
          {[
            { id: 'lineups' as const, label: 'Full Lineups', icon: '⚽' },
            { id: 'statistics' as const, label: 'Live Stats', icon: '📊' },
            { id: 'overview' as const, label: 'Match Info', icon: '🏟️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-unill-purple-600 text-white shadow-lg shadow-unill-purple-600/30 grow' 
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content (The only scrollable area) */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'lineups' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Home Team Squad */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-4">
                    <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                      <div className="w-2 h-6 bg-unill-purple-600 rounded-full" />
                      {homeTeam} Lineup
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 11 }).map((_, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-unill-purple-500/30 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-unill-purple-500 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-lg">
                              {i + 1}
                            </div>
                            <div>
                               <p className="font-black text-sm text-gray-900 dark:text-white">Start Player {i + 1}</p>
                               <p className="text-[10px] font-bold text-unill-purple-500 uppercase tracking-widest">Main Squad</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-black text-unill-yellow-500 italic">★ {9.5 - (i * 0.1)}</p>
                          </div>
                       </div>
                    ))}
                  </div>
                </div>

                {/* Away Team Squad */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-4">
                    <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                      <div className="w-2 h-6 bg-cyan-600 rounded-full" />
                      {awayTeam} Lineup
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 11 }).map((_, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-cyan-500/30 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xs text-white shadow-lg">
                              {i + 14}
                            </div>
                            <div>
                               <p className="font-black text-sm text-gray-900 dark:text-white">Opponent Player {i + 6}</p>
                               <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">Crucial XI</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-black text-unill-yellow-500 italic">★ {8.9 - (i * 0.1)}</p>
                          </div>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="max-w-4xl mx-auto space-y-12 py-10">
                 <div className="text-center space-y-2">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.4em]">Live Match Analytics</h4>
                    <p className="text-xs font-bold text-gray-500">Real-time performance comparison</p>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-10">
                    {[
                      { label: 'Attacking Threat', home: '78%', away: '62%', fill: 78 },
                      { label: 'Defensive Strength', home: '45%', away: '55%', fill: 45 },
                      { label: 'Ball Possession', home: '54%', away: '46%', fill: 54 },
                      { label: 'Pass Accuracy', home: '92%', away: '88%', fill: 92 },
                      { label: 'Shots on Target', home: '8', away: '5', fill: 61 }
                    ].map(stat => (
                      <div key={stat.label} className="space-y-4 group">
                         <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                            <span className="text-unill-purple-600">{stat.home}</span>
                            <span className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{stat.label}</span>
                            <span className="text-cyan-600">{stat.away}</span>
                         </div>
                         <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex shadow-inner p-1">
                            <div className="h-full bg-unill-purple-600 rounded-full shadow-lg shadow-unill-purple-600/40" style={{ width: `${stat.fill}%` }} />
                            <div className="h-full bg-cyan-600 rounded-full flex-1 shadow-lg shadow-cyan-600/40 ml-1" />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="max-w-3xl mx-auto space-y-10 py-10">
                 <div className="bg-gray-50 dark:bg-gray-800/30 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800">
                    <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-8 flex items-center gap-4">
                       <span className="text-2xl">🏟️</span>
                       Venue & Information
                    </h4>
                    
                    <div className="space-y-8">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-2xl shadow-sm">📍</div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                             <p className="text-lg font-black text-gray-900 dark:text-white">{venue}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-2xl shadow-sm">📅</div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Match Schedule</p>
                             <p className="text-lg font-black text-gray-900 dark:text-white">
                                {new Date(match.scheduledAt || match.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                             </p>
                             <p className="text-sm font-bold text-unill-purple-600">{displayTime} Local Time</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-2xl shadow-sm">🏆</div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Competition</p>
                             <p className="text-lg font-black text-gray-900 dark:text-white">{sport.charAt(0).toUpperCase() + sport.slice(1)} Tournament</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixtureDetailModal;
