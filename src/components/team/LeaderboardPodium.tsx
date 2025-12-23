import React from 'react';
import { FiAward, FiTrendingUp, FiZap } from 'react-icons/fi';

interface LeaderboardPlayer {
    id: string;
    name: string;
    avatar?: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
}

interface LeaderboardPodiumProps {
    title: string;
    players: LeaderboardPlayer[];
    metric: string;
    accentColor: string;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({
    title,
    players,
    metric,
    accentColor
}) => {
    const topThree = players.slice(0, 3);
    const [first, second, third] = topThree;

    const podiumHeights = {
        1: 'h-48',
        2: 'h-36',
        3: 'h-28'
    };

    const medals = {
        1: { color: 'from-yellow-400 to-yellow-600', icon: '🥇' },
        2: { color: 'from-gray-300 to-gray-500', icon: '🥈' },
        3: { color: 'from-amber-600 to-amber-800', icon: '🥉' }
    };

    const PodiumCard = ({ player, position }: { player: LeaderboardPlayer; position: 1 | 2 | 3 }) => {
        if (!player) return null;

        return (
            <div className="flex flex-col items-center">
                {/* Player Avatar */}
                <div className="relative mb-4 group">
                    <div
                        className="absolute -inset-2 rounded-full opacity-75 blur-lg animate-pulse"
                        style={{ background: `linear-gradient(135deg, ${medals[position].color})` }}
                    />
                    <div className={`relative w-24 h-24 rounded-full overflow-hidden border-4 bg-gradient-to-br ${medals[position].color}`}>
                        {player.avatar ? (
                            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white">
                                {player.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Medal Badge */}
                    <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
                        {medals[position].icon}
                    </div>

                    {/* Trend Indicator */}
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full text-xs font-black ${player.trend === 'up' ? 'bg-green-500' : player.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
                        }`}>
                        {player.trend === 'up' ? '↑' : player.trend === 'down' ? '↓' : '→'}
                    </div>
                </div>

                {/* Podium */}
                <div
                    className={`w-32 ${podiumHeights[position]} bg-gradient-to-t ${medals[position].color} rounded-t-2xl flex flex-col items-center justify-between p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}
                >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 text-center">
                        <div className="text-4xl font-black text-white mb-1">{position}</div>
                        <div className="text-xs font-bold text-white/80 uppercase tracking-wider">Place</div>
                    </div>

                    <div className="relative z-10 text-center">
                        <div className="text-2xl font-black text-white mb-1">{player.value}</div>
                        <div className="text-[0.65rem] font-bold text-white/80 uppercase tracking-widest">{metric}</div>
                    </div>
                </div>

                {/* Player Name */}
                <div className="mt-4 text-center">
                    <h4 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">{player.name}</h4>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-black bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border-2 transition-colors duration-500" style={{ borderColor: accentColor }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600">
                        <FiAward className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</h3>
                </div>

                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                    <FiZap className="w-4 h-4" style={{ color: accentColor }} />
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Live</span>
                </div>
            </div>

            {/* Podium Display */}
            <div className="flex items-end justify-center space-x-8 mb-8">
                {/* 2nd Place */}
                {second && <PodiumCard player={second} position={2} />}

                {/* 1st Place */}
                {first && <PodiumCard player={first} position={1} />}

                {/* 3rd Place */}
                {third && <PodiumCard player={third} position={3} />}
            </div>

            {/* Rest of Leaderboard */}
            {players.length > 3 && (
                <div className="space-y-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
                    {players.slice(3, 10).map((player, index) => (
                        <div
                            key={player.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center font-black text-gray-400 text-sm">
                                    {index + 4}
                                </div>
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-600 to-gray-800">
                                    {player.avatar ? (
                                        <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm font-black text-white">
                                            {player.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">{player.name}</span>
                            </div>

                            <div className="flex items-center space-x-3">
                                <span className="text-xl font-black text-gray-900 dark:text-white">{player.value}</span>
                                {player.trend === 'up' && <FiTrendingUp className="w-4 h-4 text-green-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
