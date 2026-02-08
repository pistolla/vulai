import React from 'react';
import { Fixture } from '@/models';
import { FiMapPin, FiClock, FiCalendar } from 'react-icons/fi';

interface FixtureCardProps {
    fixture: Fixture;
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
        <span className={`${cfg.bg} ${cfg.text} px-2 py-1 rounded-full text-xs font-bold ${cfg.animate ? 'animate-pulse' : ''}`}>
            {cfg.label}
        </span>
    );
};

export const FixtureCard: React.FC<FixtureCardProps> = ({ fixture, onClick, isSelected }) => {
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

    return (
        <div
            onClick={onClick}
            className={`cursor-pointer rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isSelected
                ? 'bg-gradient-to-br from-unill-purple-500/20 to-unill-yellow-500/20 border-unill-yellow-400/50 shadow-lg'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
        >
            {/* Status Bar */}
            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{fixture.sport}</span>
                <StatusBadge status={fixture.status} />
            </div>

            {/* Teams */}
            <div className="p-4">
                <div className="flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex-1 text-center">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-unill-purple-500 to-unill-yellow-500 rounded-full flex items-center justify-center mb-2">
                            <span className="text-lg font-black text-white">{fixture.homeTeamName?.charAt(0) || 'H'}</span>
                        </div>
                        <p className="font-semibold text-white text-sm truncate">{fixture.homeTeamName || 'Home'}</p>
                    </div>

                    {/* Score or VS */}
                    <div className="px-4 text-center">
                        {fixture.status === 'completed' || fixture.status === 'live' ? (
                            <div className="text-2xl font-black">
                                <span className="text-white">{fixture.score?.home ?? 0}</span>
                                <span className="text-gray-500 mx-1">-</span>
                                <span className="text-white">{fixture.score?.away ?? 0}</span>
                            </div>
                        ) : (
                            <span className="text-gray-400 font-bold text-lg">VS</span>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mb-2">
                            <span className="text-lg font-black text-white">{fixture.awayTeamName?.charAt(0) || 'A'}</span>
                        </div>
                        <p className="font-semibold text-white text-sm truncate">{fixture.awayTeamName || 'Away'}</p>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    <span>{formatDate(fixture.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    <span>{formatTime(fixture.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-1 truncate max-w-[100px]">
                    <FiMapPin className="w-3 h-3" />
                    <span className="truncate">{fixture.venue || 'TBD'}</span>
                </div>
            </div>
        </div>
    );
};

export default FixtureCard;
