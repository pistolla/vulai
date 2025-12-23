import React from 'react';
import { FiClock, FiMapPin, FiTrendingUp } from 'react-icons/fi';

interface MatchCardProps {
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
    status: 'upcoming' | 'live' | 'completed';
    date: string;
    venue: string;
    isLive?: boolean;
    accentColor: string;
}

export const MatchCard: React.FC<MatchCardProps> = ({
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    status,
    date,
    venue,
    isLive,
    accentColor
}) => {
    const statusConfig = {
        upcoming: { bg: 'from-blue-600 to-blue-800', label: 'Upcoming', icon: FiClock },
        live: { bg: 'from-red-500 to-red-700', label: 'Live Now', icon: FiTrendingUp },
        completed: { bg: 'from-gray-600 to-gray-800', label: 'Full Time', icon: null }
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <div className="group relative bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden border-2 hover:scale-[1.02] transition-all duration-300" style={{ borderColor: accentColor }}>
            {/* Live Indicator */}
            {isLive && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-500 animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                        <span className="text-xs font-black text-white uppercase tracking-wider">Live</span>
                    </div>
                </div>
            )}

            {/* Status Badge */}
            <div className={`px-6 py-3 bg-gradient-to-r ${config.bg}`}>
                <div className="flex items-center justify-center space-x-2">
                    {StatusIcon && <StatusIcon className="w-4 h-4 text-white" />}
                    <span className="text-sm font-black text-white uppercase tracking-wider">{config.label}</span>
                </div>
            </div>

            {/* Match Info */}
            <div className="p-8">
                {/* Teams & Score */}
                <div className="flex items-center justify-between mb-6">
                    {/* Home Team */}
                    <div className="flex-1 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <span className="text-2xl font-black text-white">{homeTeam.charAt(0)}</span>
                        </div>
                        <h4 className="font-black text-white text-lg uppercase tracking-tight">{homeTeam}</h4>
                    </div>

                    {/* Score / VS */}
                    <div className="flex-shrink-0 mx-8">
                        {status === 'upcoming' ? (
                            <div className="text-center">
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">VS</div>
                                <div className="h-px w-12 bg-gray-700" />
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <div className="text-5xl font-black text-white tabular-nums">{homeScore}</div>
                                <div className="text-2xl font-bold text-gray-500">-</div>
                                <div className="text-5xl font-black text-white tabular-nums">{awayScore}</div>
                            </div>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                            <span className="text-2xl font-black text-white">{awayTeam.charAt(0)}</span>
                        </div>
                        <h4 className="font-black text-white text-lg uppercase tracking-tight">{awayTeam}</h4>
                    </div>
                </div>

                {/* Match Details */}
                <div className="space-y-2 pt-6 border-t border-gray-800">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                        <FiClock className="w-4 h-4" />
                        <span className="font-bold">{date}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                        <FiMapPin className="w-4 h-4" />
                        <span className="font-bold">{venue}</span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    className="mt-6 w-full py-3 rounded-2xl font-black uppercase text-sm transition-all hover:scale-105"
                    style={{
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                        color: 'white'
                    }}
                >
                    {status === 'live' ? 'Watch Live' : status === 'upcoming' ? 'Set Reminder' : 'View Highlights'}
                </button>
            </div>

            {/* Glow Effect on Hover */}
            <div
                className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300 -z-10"
                style={{ background: accentColor }}
            />
        </div>
    );
};
