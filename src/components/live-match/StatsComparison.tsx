import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';

interface MatchStats {
    possession: { home: number; away: number };
    shotsOnGoal: { home: number; away: number };
    fouls: { home: number; away: number };
    cards: { home: { yellow: number; red: number }; away: { yellow: number; red: number } };
    corners: { home: number; away: number };
}

interface StatsComparisonProps {
    stats: MatchStats;
    homeTeam: string;
    awayTeam: string;
}

export const StatsComparison = ({ stats, homeTeam, awayTeam }: StatsComparisonProps) => {
    const StatRow = ({ label, home, away, isPercent = false }: { label: string, home: number, away: number, isPercent?: boolean }) => {
        const total = home + away;
        const homeWidth = total === 0 ? 50 : (home / total) * 100;

        return (
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{home}{isPercent ? '%' : ''}</span>
                    <span className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</span>
                    <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{away}{isPercent ? '%' : ''}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full flex overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                        style={{ width: `${homeWidth}%` }}
                    />
                    <div
                        className="h-full bg-red-600 transition-all duration-1000 ease-out"
                        style={{ width: `${100 - homeWidth}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <div className="flex items-center space-x-3 mb-10">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                    <FiBarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Match Analytics</h3>
            </div>

            <div className="space-y-8">
                <StatRow label="Possession" home={stats.possession.home} away={stats.possession.away} isPercent />
                <StatRow label="Shots on Goal" home={stats.shotsOnGoal.home} away={stats.shotsOnGoal.away} />
                <StatRow label="Corner Kicks" home={stats.corners.home} away={stats.corners.away} />
                <StatRow label="Total Fouls" home={stats.fouls.home} away={stats.fouls.away} />

                <div className="pt-6 grid grid-cols-2 gap-8">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <span className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest">Cards (H)</span>
                        <div className="flex space-x-2">
                            <div className="flex items-center space-x-1">
                                <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
                                <span className="text-xs font-black dark:text-white">{stats.cards.home.yellow}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
                                <span className="text-xs font-black dark:text-white">{stats.cards.home.red}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <span className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest">Cards (A)</span>
                        <div className="flex space-x-2">
                            <div className="flex items-center space-x-1">
                                <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
                                <span className="text-xs font-black dark:text-white">{stats.cards.away.yellow}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
                                <span className="text-xs font-black dark:text-white">{stats.cards.away.red}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
