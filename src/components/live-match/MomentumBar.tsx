import React from 'react';
import { FiZap } from 'react-icons/fi';

interface MomentumBarProps {
    pressure: number; // -100 (Away dominance) to 100 (Home dominance)
}

export const MomentumBar = ({ pressure }: MomentumBarProps) => {
    const homeWidth = 50 + (pressure / 2);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                        <FiZap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Live Momentum</h3>
                </div>
                <span className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.3em]">Phase: {Math.abs(pressure) > 50 ? 'Dominant' : 'Contested'}</span>
            </div>

            <div className="relative h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex items-center justify-center">
                {/* Center Line */}
                <div className="absolute inset-y-0 w-px bg-gray-300 dark:bg-gray-600 z-10" style={{ left: '50%' }} />

                {/* Home Momentum Area */}
                <div
                    className="absolute inset-y-0 right-1/2 bg-gradient-to-l from-blue-600 to-blue-400 transition-all duration-700 ease-in-out"
                    style={{ width: `${Math.max(0, pressure)}%` }}
                />

                {/* Away Momentum Area */}
                <div
                    className="absolute inset-y-0 left-1/2 bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700 ease-in-out"
                    style={{ width: `${Math.max(0, -pressure)}%` }}
                />

                {/* Pulsing Indicator at current level */}
                <div
                    className="absolute h-6 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 transition-all duration-700"
                    style={{ left: `${homeWidth}%` }}
                />
            </div>

            <div className="mt-4 flex justify-between text-[0.6rem] font-black text-gray-400 uppercase tracking-widest">
                <span>Home Pressure</span>
                <span>Away Pressure</span>
            </div>
        </div>
    );
};
