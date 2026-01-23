import React, { useState, useEffect } from 'react';

interface GameTickerProps {
    matches: any[];
}

export const GameTicker: React.FC<GameTickerProps> = ({ matches }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (matches.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % matches.length);
        }, 5000); // Rotate every 5 seconds
        return () => clearInterval(interval);
    }, [matches]);

    if (!matches || matches.length === 0) return null;

    const match = matches[currentIndex];

    return (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full px-6 py-2 shadow-lg border border-gray-200 dark:border-gray-800 flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {match.status === 'live' && (
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            )}
            <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>{match.homeTeam}</span>
                <span className={`px-2 py-0.5 rounded ${match.status === 'live' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {match.status === 'upcoming' ? 'VS' : `${match.homeScore} - ${match.awayScore}`}
                </span>
                <span>{match.awayTeam}</span>
            </div>
            {match.status === 'live' && (
                <span className="text-xs font-mono text-red-500 animate-pulse">{match.minute}'</span>
            )}
        </div>
    );
};
