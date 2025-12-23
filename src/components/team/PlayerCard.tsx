import React, { useState } from 'react';
import { FiStar, FiHeart, FiShare2, FiTrendingUp } from 'react-icons/fi';

type PlayerRarity = 'bronze' | 'silver' | 'gold' | 'diamond';

interface PlayerCardProps {
    id: string;
    name: string;
    position: string;
    number: number;
    avatar?: string;
    rarity: PlayerRarity;
    stats: {
        speed: number;
        power: number;
        technique: number;
        defense: number;
        stamina: number;
        intelligence: number;
    };
    isFollowed: boolean;
    onFollow: () => void;
    onClick: () => void;
}

const rarityConfig: Record<PlayerRarity, { gradient: string; glow: string; border: string; label: string }> = {
    bronze: {
        gradient: 'from-amber-700 to-amber-900',
        glow: 'rgba(217, 119, 6, 0.5)',
        border: '#d97706',
        label: 'Bronze'
    },
    silver: {
        gradient: 'from-gray-400 to-gray-600',
        glow: 'rgba(156, 163, 175, 0.5)',
        border: '#9ca3af',
        label: 'Silver'
    },
    gold: {
        gradient: 'from-yellow-400 to-yellow-600',
        glow: 'rgba(250, 204, 21, 0.6)',
        border: '#facc15',
        label: 'Gold'
    },
    diamond: {
        gradient: 'from-cyan-400 via-blue-500 to-purple-600',
        glow: 'rgba(59, 130, 246, 0.7)',
        border: '#3b82f6',
        label: 'Diamond'
    }
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
    id,
    name,
    position,
    number,
    avatar,
    rarity,
    stats,
    isFollowed,
    onFollow,
    onClick
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const config = rarityConfig[rarity];
    const overallRating = Math.round(
        (stats.speed + stats.power + stats.technique + stats.defense + stats.stamina + stats.intelligence) / 6
    );

    return (
        <div
            className="group relative cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            style={{
                transform: isHovered ? 'translateY(-10px) rotateX(5deg)' : 'translateY(0) rotateX(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {/* Glow Effect */}
            <div
                className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                style={{ background: config.glow }}
            />

            {/* Card */}
            <div
                className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black rounded-3xl overflow-hidden border-2 transition-colors duration-500"
                style={{
                    borderColor: config.border,
                    boxShadow: isHovered ? `0 20px 60px ${config.glow}` : 'none'
                }}
            >
                {/* Rarity Badge */}
                <div className="absolute top-4 right-4 z-20">
                    <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${config.gradient} text-white shadow-lg`}>
                        {config.label}
                    </div>
                </div>

                {/* Player Number Background */}
                <div className="absolute top-0 right-0 text-[120px] font-black opacity-5 leading-none pr-4">
                    {number}
                </div>

                {/* Avatar Section */}
                <div className="relative h-64 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-b ${config.gradient} opacity-20`} />
                    {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${config.gradient}`}>
                            <span className="text-8xl font-black text-white/30">{name.charAt(0)}</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                {/* Player Info */}
                <div className="p-6 space-y-4">
                    {/* Name & Position */}
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">{name}</h3>
                        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: config.border }}>{position}</p>
                    </div>

                    {/* Overall Rating */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl text-white bg-gradient-to-br"
                                style={{ background: `linear-gradient(135deg, ${config.border}, ${config.glow})` }}
                            >
                                {overallRating}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Overall</div>
                                <div className="text-sm font-black text-gray-900 dark:text-white">Rating</div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                                { label: 'SPD', value: stats.speed },
                                { label: 'POW', value: stats.power },
                                { label: 'TEC', value: stats.technique }
                            ].map(stat => (
                                <div key={stat.label}>
                                    <div className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase">{stat.label}</div>
                                    <div className="text-lg font-black text-gray-900 dark:text-white">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onFollow(); }}
                            className={`flex-1 py-3 rounded-xl font-black uppercase text-sm transition-all ${isFollowed
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                : `bg-gradient-to-r ${config.gradient} text-white hover:scale-105`
                                }`}
                        >
                            <FiHeart className={`inline mr-2 ${isFollowed ? 'fill-current' : ''}`} />
                            {isFollowed ? 'Following' : 'Follow'}
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="px-4 py-3 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-all hover:scale-105"
                        >
                            <FiShare2 />
                        </button>
                    </div>
                </div>

                {/* Hover Overlay - Show Full Stats */}
                <div
                    className={`absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-sm p-6 flex flex-col justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase mb-4 text-center">Player Stats</h4>
                    <div className="space-y-3">
                        {Object.entries(stats).map(([key, value]) => (
                            <div key={key}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-gray-500 dark:text-gray-400 uppercase">{key}</span>
                                    <span className="font-black text-gray-900 dark:text-white">{value}</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
