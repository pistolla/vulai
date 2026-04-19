import React from 'react';
import { Fixture, Participant } from '@/models';
import { useTheme } from '../ThemeProvider';
import { FiMapPin, FiClock, FiCalendar } from 'react-icons/fi';

interface FixtureCardProps {
    fixture: Fixture;
    leagueName?: string;
    onClick: () => void;
    isSelected?: boolean;
}

const StatusBadge: React.FC<{ status: Fixture['status'] }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string; label: string; animate?: boolean }> = {
        scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Upcoming' },
        live: { bg: 'bg-red-500/20', text: 'text-red-400', label: '● LIVE', animate: true },
        completed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Finished' },
        postponed: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Postponed' },
    };
    const cfg = config[status] || config.scheduled;

    return (
        <span className={`${cfg.bg} ${cfg.text} px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.animate ? 'animate-pulse' : ''}`}>
            {cfg.label}
        </span>
    );
};

export const FixtureCard: React.FC<FixtureCardProps> = ({ fixture, leagueName, onClick, isSelected }) => {
    const { theme, mounted: themeMounted } = useTheme();
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const participants: Participant[] = fixture.participants && fixture.participants.length > 0
        ? fixture.participants
        : ([
            { refType: 'team', refId: fixture.homeTeamId || '', name: fixture.homeTeamName || 'Home', score: fixture.score?.home || 0 },
            { refType: 'team', refId: fixture.awayTeamId || '', name: fixture.awayTeamName || 'Away', score: fixture.score?.away || 0 }
        ] as Participant[]).filter(p => p.refId || p.name !== 'Home');

    // Show top 3 as per user request
    const displayParticipants = participants.slice(0, 3);
    const hasMore = participants.length > 3;

    return (
        <div
            onClick={onClick}
            className={`group cursor-pointer rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${isSelected
                ? 'bg-gradient-to-br from-indigo-900/40 via-unill-purple-900/40 to-indigo-950/40 border-unill-yellow-400/50 shadow-xl'
                : themeMounted && theme === 'light' 
                  ? 'bg-white/60 border-mauve-200 hover:bg-white/80 hover:border-unill-purple-300 shadow-sm' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
        >
            {/* Status Bar */}
            <div className={`px-6 py-4 border-b flex items-center justify-between rounded-t-[2rem] ${
                themeMounted && theme === 'light' ? 'bg-gray-50/50 border-mauve-100' : 'bg-black/20 border-white/5'
            }`}>
                <div className="flex flex-col">
                    <span className="text-[10px] text-unill-yellow-400 uppercase tracking-[0.2em] font-black">{fixture.sport}</span>
                    {leagueName && (
                        <span className="text-[9px] text-gray-400 font-bold truncate max-w-[120px] uppercase tracking-widest">{leagueName}</span>
                    )}
                </div>
                <StatusBadge status={fixture.status} />
            </div>

            {/* Participants */}
            <div className="p-6">
                <div className={`flex items-center justify-center gap-4 ${participants.length > 2 ? 'flex-wrap' : ''}`}>
                    {displayParticipants.map((p, index) => (
                        <React.Fragment key={p.refId || index}>
                            <div className="flex flex-col items-center text-center max-w-[100px]">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-lg transition-all group-hover:scale-110 border-2 ${
                                    index === 0 ? 'bg-gradient-to-br from-unill-purple-500 to-indigo-600 border-unill-purple-400/30' : 
                                    index === 1 ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400/30' : 
                                    'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/30'
                                }`}>
                                    <span className="text-xl font-black text-white">{p.name?.charAt(0) || '?'}</span>
                                </div>
                                <p className={`font-black text-[11px] leading-tight mb-1 uppercase tracking-tight line-clamp-2 h-8 ${
                                    themeMounted && theme === 'light' ? 'text-gray-900' : 'text-white'
                                }`}>{p.name || 'Competitor'}</p>
                                
                                {(fixture.status === 'completed' || fixture.status === 'live') && (
                                    <span className="text-xl font-black text-unill-yellow-400 tabular-nums">
                                        {p.score ?? 0}
                                    </span>
                                )}
                            </div>
                            
                            {index < displayParticipants.length - 1 && participants.length === 2 && (
                                <div className="text-gray-500 font-black italic text-lg opacity-30 px-2 mt-[-20px]">VS</div>
                            )}
                        </React.Fragment>
                    ))}
                    
                    {hasMore && (
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border ${
                                themeMounted && theme === 'light' ? 'bg-black/5 border-mauve-200' : 'bg-white/10 border-white/20'
                            }`}>
                                <span className={`text-xs font-black ${themeMounted && theme === 'light' ? 'text-gray-600' : 'text-white'}`}>+{participants.length - 3}</span>
                            </div>
                            <span className="text-[9px] font-black text-gray-500 uppercase">Others</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Info */}
            <div className={`px-6 py-5 border-t flex items-center justify-between rounded-b-[2rem] ${
                themeMounted && theme === 'light' ? 'bg-gray-50/50 border-mauve-100' : 'bg-black/10 border-white/5'
            }`}>
                 <div className="flex flex-col gap-1">
                    <div className={`flex items-center gap-2 font-bold ${themeMounted && theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        <FiClock className="w-4 h-4 text-unill-yellow-400" />
                        <span className="text-xs tracking-tighter uppercase font-black">{formatTime(fixture.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-60">
                        <FiCalendar className="w-3 h-3" />
                        <span>{formatDate(fixture.scheduledAt)}</span>
                     </div>
                </div>
                <div className={`flex items-center gap-2 text-[10px] px-4 py-2 rounded-2xl border transition-all group-hover:border-unill-yellow-400/30 ${
                    themeMounted && theme === 'light' ? 'text-gray-700 bg-black/5 border-mauve-200' : 'text-gray-300 bg-white/5 border-white/10'
                }`}>
                    <FiMapPin className="w-3 h-3 text-red-500" />
                    <span className="font-black uppercase tracking-widest truncate max-w-[80px]">{fixture.venue || 'TBD'}</span>
                </div>
            </div>
        </div>
    );
};

export default FixtureCard;
