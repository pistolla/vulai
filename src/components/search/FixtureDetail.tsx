import React, { useState, useEffect } from 'react';
import { Fixture, League, Match, MatchPlayer, Participant } from '@/models';
import { useTheme } from '../ThemeProvider';
import { FiMapPin, FiUsers, FiBarChart2, FiList, FiX, FiCalendar } from 'react-icons/fi';

interface FixtureDetailProps {
    fixture: Fixture;
    onClose: () => void;
}

type TabId = 'venue' | 'statistics' | 'standings';

const TabButton: React.FC<{
    id: TabId;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
}> = ({ label, icon, active, onClick }) => {
    const { theme, mounted: themeMounted } = useTheme();
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${active
                    ? `${themeMounted && theme === 'light' ? 'text-unill-purple-700 bg-unill-yellow-400/10 border-unill-yellow-400' : 'text-white bg-white/5 border-unill-yellow-400'} border-b-2`
                    : `${themeMounted && theme === 'light' ? 'text-gray-500 hover:text-unill-purple-700 hover:bg-black/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
                }`}
        >
            {icon}
            {label}
        </button>
    );
};

// Tab: Venue & Players
const VenuePlayersTab: React.FC<{ fixture: Fixture; players: MatchPlayer[]; participants: Participant[] }> = ({ fixture, players, participants }) => {
    const { theme, mounted: themeMounted } = useTheme();
    const PlayerList: React.FC<{ players: MatchPlayer[]; participant: Participant; index: number }> = ({ players, participant, index }) => (
        <div className={`rounded-xl p-4 border ${themeMounted && theme === 'light' ? 'bg-white/40 border-mauve-200' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${
                    index === 0 ? 'bg-indigo-600' : index === 1 ? 'bg-cyan-600' : 'bg-emerald-600'
                }`}>
                    {participant.name?.charAt(0) || '?'}
                </div>
                <h4 className={`font-bold uppercase tracking-tight ${themeMounted && theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{participant.name} Lineup</h4>
            </div>
            {players.length === 0 ? (
                <p className="text-gray-500 text-xs italic py-4">Roster pending announcement</p>
            ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {players.map((player) => (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                                themeMounted && theme === 'light' 
                                ? 'bg-black/5 hover:bg-white/60 border-transparent hover:border-mauve-200' 
                                : 'bg-white/5 hover:bg-white/10 border-transparent hover:border-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                                    themeMounted && theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-gray-800 text-gray-400'
                                } group-hover:text-white group-hover:bg-indigo-600`}>
                                    {player.jerseyNumber || '#'}
                                </span>
                                <div>
                                    <p className={`text-sm font-bold uppercase tracking-tight ${themeMounted && theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{player.name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{player.position}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${player.status === 'starter' ? 'text-green-500' : 'text-gray-500'}`}>
                                {player.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 space-y-8">
            {/* Venue Info */}
            <div className={`rounded-xl p-4 md:p-8 border shadow-xl ${themeMounted && theme === 'light' ? 'bg-white/60 border-mauve-200' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-unill-yellow-400/20 rounded-2xl flex items-center justify-center">
                        <FiMapPin className="w-6 h-6 text-unill-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-unill-yellow-400 uppercase tracking-widest">Offical Venue</h3>
                        <p className={`text-2xl font-black uppercase tracking-tight ${themeMounted && theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{fixture.venue || 'Venue TBD'}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 font-bold uppercase tracking-widest text-[11px] ${themeMounted && theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    <FiCalendar className="w-4 h-4" />
                    <span>{new Date(fixture.scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </div>
            </div>

            {/* Players Area */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                    <FiUsers className="w-5 h-5 text-unill-yellow-400" />
                    <h3 className={`text-sm font-black uppercase tracking-widest ${themeMounted && theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Match Roster Analysis</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {participants.map((p, i) => (
                        <PlayerList 
                            key={p.refId || i} 
                            participant={p} 
                            index={i}
                            players={players.filter(pL => pL.teamId === p.refId)} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Tab: Statistics
const StatisticsTab: React.FC<{ fixture: Fixture; participants: Participant[] }> = ({ fixture, participants }) => {
    const { theme, mounted: themeMounted } = useTheme();
    const stats = fixture.stats;

    const StatBar: React.FC<{ label: string; pScores: number[] }> = ({
        label, pScores
    }) => {
        const total = pScores.reduce((a, b) => a + b, 0) || 1;
        
        return (
            <div className="py-4">
                <div className={`flex justify-between text-[11px] font-black uppercase tracking-widest mb-3 ${themeMounted && theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {participants.map((p, i) => (
                        <span key={i} className={i === 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-cyan-600 dark:text-cyan-400'}>
                            {p.name} {pScores[i] || 0}
                        </span>
                    ))}
                    <span className="text-center absolute left-1/2 transform -translate-x-1/2">{label}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden flex gap-1 p-0.5 ${themeMounted && theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`}>
                    {pScores.map((score, i) => (
                        <div
                            key={i}
                            className={`h-full rounded-full transition-all duration-500 ${
                                i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-cyan-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${(score / total) * 100}%` }}
                        />
                    ))}
                </div>
            </div>
        );
    };

    if (!stats && participants.length > 2) {
        return (
            <div className="p-20 text-center opacity-30">
                <FiBarChart2 className={`w-16 h-16 mx-auto mb-4 ${themeMounted && theme === 'light' ? 'text-gray-400' : 'text-white'}`} />
                <p className={`text-lg font-black uppercase tracking-widest ${themeMounted && theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Telemetry Feed Loading</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <div className={`rounded-[2rem] p-4 md:p-8 border shadow-2xl ${themeMounted && theme === 'light' ? 'bg-white/60 border-mauve-200' : 'bg-white/5 border-white/10 shadow-2xl'}`}>
                <div className="flex items-center justify-center gap-12 mb-10">
                    {participants.map((p, i) => (
                        <div key={i} className="text-center">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{p.name}</p>
                            <p className="text-4xl font-black text-unill-yellow-400 tabular-nums">{p.score ?? 0}</p>
                        </div>
                    ))}
                </div>

                {stats && (
                    <div className="space-y-4">
                        <StatBar label="Performance Metrics" pScores={participants.map((_, i) => i === 0 ? stats.homeGoals : stats.awayGoals)} />
                        {/* More complex multi-stat mapping would go here if defined in models */}
                        <div className="py-10 text-center border-t border-white/5 mt-10">
                           <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">Real-Time Sync Active</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Tab: Standings (Simplified for now)
const StandingsTab: React.FC<{ fixture: Fixture }> = ({ fixture }) => {
    return (
        <div className="p-10 text-center opacity-40">
           <FiList size={48} className="mx-auto mb-4 text-gray-600" />
           <p className="text-xs font-black uppercase tracking-widest">Tournament Bracket Sync Available in Full Season View</p>
        </div>
    );
};

export const FixtureDetail: React.FC<FixtureDetailProps> = ({ fixture, onClose }) => {
    const { theme, mounted: themeMounted } = useTheme();
    const [activeTab, setActiveTab] = useState<TabId>('venue');
    const participants: Participant[] = fixture.participants && fixture.participants.length > 0 
        ? fixture.participants 
        : ([
            { refId: fixture.homeTeamId || '', name: fixture.homeTeamName || 'Home', score: fixture.score?.home ?? 0, refType: 'team' },
            { refId: fixture.awayTeamId || '', name: fixture.awayTeamName || 'Away', score: fixture.score?.away ?? 0, refType: 'team' }
          ] as Participant[]).filter(p => p.refId || p.name !== 'Home');

    const players: MatchPlayer[] = fixture.players || [];

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'venue', label: 'Match Hub', icon: <FiMapPin className="w-4 h-4" /> },
        { id: 'statistics', label: 'Data Analytics', icon: <FiBarChart2 className="w-4 h-4" /> },
        { id: 'standings', label: 'Season Context', icon: <FiList className="w-4 h-4" /> },
    ];

    const displayParticipants = participants.slice(0, 3);

    return (
        <div className={`backdrop-blur-2xl rounded-[3rem] border overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.3)] max-w-5xl mx-auto ${
            themeMounted && theme === 'light' ? 'bg-white/80 border-mauve-200' : 'bg-gray-900/95 border-white/10'
        }`}>
            {/* Header Area */}
            <div className={`relative p-6 md:p-12 border-b ${
                themeMounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-100 via-white to-mauve-50 border-mauve-200' : 'bg-gradient-to-br from-indigo-950 via-gray-900 to-black border-white/5'
            }`}>
                <button
                    onClick={onClose}
                    className={`absolute top-8 right-8 p-3 rounded-2xl transition-all z-20 hover:bg-red-500/20 hover:text-red-500 border ${
                        themeMounted && theme === 'light' ? 'bg-black/5 border-mauve-200 text-gray-500' : 'bg-white/5 border-white/10 text-white'
                    }`}
                >
                    <FiX size={20} />
                </button>

                <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 md:gap-16">
                    {displayParticipants.map((p, i) => (
                        <React.Fragment key={i}>
                            <div className="text-center group">
                                <div className={`w-20 h-20 md:w-28 md:h-28 mx-auto rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-4 md:mb-6 shadow-2xl transition-all group-hover:scale-110 border-2 ${
                                    i === 0 ? 'bg-indigo-600 border-indigo-400/30' : 
                                    i === 1 ? 'bg-cyan-600 border-cyan-400/30' : 
                                    'bg-emerald-600 border-emerald-400/30'
                                }`}>
                                    <span className="text-3xl md:text-4xl font-black text-white">{p.name?.charAt(0) || '?'}</span>
                                </div>
                                <h3 className={`text-lg md:text-2xl font-black uppercase tracking-tighter truncate max-w-[120px] md:max-w-[180px] ${
                                    themeMounted && theme === 'light' ? 'text-gray-900' : 'text-white'
                                }`}>{p.name}</h3>
                                {fixture.status !== 'scheduled' && (
                                    <p className="mt-2 text-2xl md:text-3xl font-black text-unill-yellow-400 tabular-nums">{p.score ?? 0}</p>
                                )}
                            </div>
                            {i < displayParticipants.length - 1 && participants.length === 2 && (
                                <div className="text-gray-700 font-black italic text-2xl md:text-3xl opacity-20 mt-[-20px] md:mt-[-40px]">VS</div>
                            )}
                        </React.Fragment>
                    ))}
                    {participants.length > 3 && (
                        <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/10 text-center">
                           <p className="text-xl font-black text-gray-500">+{participants.length - 3}</p>
                           <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">More</p>
                        </div>
                    )}
                </div>
                
                <div className="mt-12 flex justify-center">
                    <div className={`px-5 py-2 backdrop-blur-md rounded-full border flex items-center gap-3 ${
                        themeMounted && theme === 'light' ? 'bg-black/5 border-mauve-200' : 'bg-white/5 border-white/10 shadow-sm'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${fixture.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-unill-yellow-400'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            themeMounted && theme === 'light' ? 'text-gray-700' : 'text-white/80'
                        }`}>{fixture.status.toUpperCase()} SESSION</span>
                    </div>
                </div>
            </div>

            {/* Sub-Nav Tabs */}
            <div className={`flex overflow-x-auto whitespace-nowrap custom-scrollbar border-b ${themeMounted && theme === 'light' ? 'bg-gray-50 border-mauve-200' : 'bg-black/20 border-white/5'}`}>
                {tabs.map((tab) => (
                    <TabButton
                        key={tab.id}
                        id={tab.id}
                        label={tab.label}
                        icon={tab.icon}
                        active={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    />
                ))}
            </div>

            {/* Tab Body */}
            <div className="min-h-[500px] overflow-y-auto max-h-[60vh] custom-scrollbar">
                {activeTab === 'venue' && <VenuePlayersTab fixture={fixture} players={players} participants={participants} />}
                {activeTab === 'statistics' && <StatisticsTab fixture={fixture} participants={participants} />}
                {activeTab === 'standings' && <StandingsTab fixture={fixture} />}
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(255,255,255,0.05);
                  border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default FixtureDetail;
