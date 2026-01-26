import React, { useMemo } from 'react';
import { Fixture, GoalTiming } from '@/models';

interface PlayerStat {
    playerName: string;
    teamId: string;
    teamName: string;
    goals: number;
}

interface PlayerStatsTableProps {
    fixtures: Fixture[];
}

export const PlayerStatsTable: React.FC<PlayerStatsTableProps> = ({ fixtures }) => {
    const stats = useMemo(() => {
        const playerMap: Record<string, PlayerStat> = {};

        fixtures.forEach(fixture => {
            if (fixture.status !== 'completed' || !fixture.goalTimings) return;

            fixture.goalTimings.forEach((gt: GoalTiming) => {
                const key = `${gt.playerName}_${gt.teamId}`;
                if (!playerMap[key]) {
                    playerMap[key] = {
                        playerName: gt.playerName || 'Unknown Player',
                        teamId: gt.teamId,
                        teamName: gt.teamId === fixture.homeTeamId ? fixture.homeTeamName : fixture.awayTeamName,
                        goals: 0
                    };
                }
                playerMap[key].goals += 1;
            });
        });

        return Object.values(playerMap).sort((a, b) => b.goals - a.goals);
    }, [fixtures]);

    if (stats.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 text-lg">No goal data recorded for this season yet.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-blue-900/5 border border-gray-100 dark:border-gray-700 p-8">
            <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="text-3xl">👟</span> Golden Boot Race
                </h3>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                    {stats.length} Scorers Observed
                </span>
            </div>

            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Rank</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Player</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Team</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-center bg-blue-600 text-white rounded-t-lg">Goals</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {stats.map((s, idx) => (
                        <tr key={`${s.playerName}-${s.teamId}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                            <td className="py-5 px-4 font-black">
                                {idx === 0 ? <span className="text-2xl">🥇</span> :
                                    idx === 1 ? <span className="text-2xl">🥈</span> :
                                        idx === 2 ? <span className="text-2xl">🥉</span> :
                                            <span className="text-gray-400">#{idx + 1}</span>}
                            </td>
                            <td className="py-5 px-4">
                                <div className="font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{s.playerName}</div>
                            </td>
                            <td className="py-5 px-4">
                                <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{s.teamName}</div>
                            </td>
                            <td className="py-5 px-4 text-center font-black text-2xl bg-blue-600 text-white">
                                {s.goals}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
