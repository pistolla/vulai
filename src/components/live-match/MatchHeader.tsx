import React from 'react';
import { FiActivity, FiZap } from 'react-icons/fi';

interface MatchHeaderProps {
    homeTeam: string;
    awayTeam: string;
    score: { home: number; away: number };
    minute: number;
    status: string;
    venue: string;
}

export const MatchHeader = ({ homeTeam, awayTeam, score, minute, status, venue }: MatchHeaderProps) => {
    return (
        <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-800 p-8 mb-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Home Team */}
                <div className="flex-1 text-center md:text-right">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">{homeTeam}</h2>
                    <div className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        <span>Home Team</span>
                    </div>
                </div>

                {/* Score & Time */}
                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center space-x-6 mb-4">
                        <span className="text-7xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">{score.home}</span>
                        <div className="flex flex-col items-center">
                            <div className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">VS</div>
                            <div className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
                        </div>
                        <span className="text-7xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">{score.away}</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-6 py-2 rounded-2xl border border-red-100 dark:border-red-900/30">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest">{status} - {minute}'</span>
                        </div>
                        <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                            <FiActivity className="mr-2" /> {venue}
                        </p>
                    </div>
                </div>

                {/* Away Team */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">{awayTeam}</h2>
                    <div className="inline-flex items-center space-x-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-4 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        <span>Away Team</span>
                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-red-500/5 blur-[100px] rounded-full" />
        </div>
    );
};
