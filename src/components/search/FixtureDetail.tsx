import React, { useState, useEffect } from 'react';
import { Fixture, League, Match, MatchPlayer } from '@/models';
import { FiMapPin, FiUsers, FiBarChart2, FiList, FiX, FiCalendar } from 'react-icons/fi';
import { apiService } from '@/services/apiService';

interface FixtureDetailProps {
    fixture: Fixture;
    onClose: () => void;
}

type TabId = 'venue' | 'statistics' | 'standings';

const TabButton: React.FC<{
    id: TabId;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
}> = ({ label, icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${active
                ? 'text-white border-b-2 border-unill-yellow-400 bg-white/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
    >
        {icon}
        {label}
    </button>
);

// Tab: Venue & Players
const VenuePlayersTab: React.FC<{ fixture: Fixture; players: MatchPlayer[] }> = ({ fixture, players }) => {
    const homePlayers = players.filter(p => p.teamId === fixture.homeTeamId);
    const awayPlayers = players.filter(p => p.teamId === fixture.awayTeamId);

    const PlayerList: React.FC<{ players: MatchPlayer[]; teamName: string }> = ({ players, teamName }) => (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-bold text-white mb-3">{teamName}</h4>
            {players.length === 0 ? (
                <p className="text-gray-400 text-sm">No lineup announced</p>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {players.map((player) => (
                        <div
                            key={player.id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-unill-purple-500 to-unill-yellow-500 flex items-center justify-center text-xs font-bold">
                                    {player.jerseyNumber || '#'}
                                </span>
                                <span className="text-white text-sm">{player.name}</span>
                            </div>
                            <span className="text-xs text-gray-400 uppercase">{player.position}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Venue Info */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <FiMapPin className="w-6 h-6 text-unill-yellow-400" />
                    <h3 className="text-xl font-bold text-white">Venue</h3>
                </div>
                <p className="text-2xl font-semibold text-white">{fixture.venue || 'Venue TBD'}</p>
                <div className="flex items-center gap-2 mt-2 text-gray-400">
                    <FiCalendar className="w-4 h-4" />
                    <span>{new Date(fixture.scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </div>
            </div>

            {/* Players */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <FiUsers className="w-6 h-6 text-unill-yellow-400" />
                    <h3 className="text-xl font-bold text-white">Lineups</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PlayerList players={homePlayers} teamName={fixture.homeTeamName || 'Home Team'} />
                    <PlayerList players={awayPlayers} teamName={fixture.awayTeamName || 'Away Team'} />
                </div>
            </div>
        </div>
    );
};

// Tab: Statistics
const StatisticsTab: React.FC<{ fixture: Fixture }> = ({ fixture }) => {
    const stats = fixture.stats;

    const StatBar: React.FC<{ label: string; home: number; away: number; suffix?: string }> = ({
        label, home, away, suffix = ''
    }) => {
        const total = home + away || 1;
        const homePercent = (home / total) * 100;

        return (
            <div className="py-3">
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-white">{home}{suffix}</span>
                    <span className="text-gray-400">{label}</span>
                    <span className="font-semibold text-white">{away}{suffix}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden flex">
                    <div
                        className="h-full bg-gradient-to-r from-unill-purple-500 to-unill-purple-400 transition-all duration-500"
                        style={{ width: `${homePercent}%` }}
                    />
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${100 - homePercent}%` }}
                    />
                </div>
            </div>
        );
    };

    if (!stats) {
        return (
            <div className="p-6 text-center">
                <FiBarChart2 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Statistics will be available once the match starts</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                        <p className="font-bold text-white">{fixture.homeTeamName}</p>
                    </div>
                    <div className="text-center">
                        <span className="text-3xl font-black text-white">
                            {fixture.score?.home ?? 0} - {fixture.score?.away ?? 0}
                        </span>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-white">{fixture.awayTeamName}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <StatBar label="Goals" home={stats.homeGoals} away={stats.awayGoals} />
                    <StatBar label="Assists" home={stats.homeAssists} away={stats.awayAssists} />
                    <StatBar label="Possession" home={stats.possession?.home || 50} away={stats.possession?.away || 50} suffix="%" />
                    <StatBar label="Shots" home={stats.shots?.home || 0} away={stats.shots?.away || 0} />
                </div>
            </div>
        </div>
    );
};

// Tab: Standings
const StandingsTab: React.FC<{ fixture: Fixture }> = ({ fixture }) => {
    const [standings, setStandings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStandings = async () => {
            if (!fixture.leagueId) {
                setLoading(false);
                return;
            }
            try {
                // Mock standings for now - would fetch from API
                const mockStandings = [
                    { position: 1, team: fixture.homeTeamName, played: 10, won: 7, drawn: 2, lost: 1, gf: 22, ga: 8, gd: 14, points: 23 },
                    { position: 2, team: fixture.awayTeamName, played: 10, won: 6, drawn: 3, lost: 1, gf: 18, ga: 7, gd: 11, points: 21 },
                    { position: 3, team: 'Team C', played: 10, won: 5, drawn: 3, lost: 2, gf: 15, ga: 10, gd: 5, points: 18 },
                    { position: 4, team: 'Team D', played: 10, won: 4, drawn: 4, lost: 2, gf: 14, ga: 12, gd: 2, points: 16 },
                    { position: 5, team: 'Team E', played: 10, won: 3, drawn: 4, lost: 3, gf: 12, ga: 12, gd: 0, points: 13 },
                ];
                setStandings(mockStandings);
            } catch (error) {
                console.error('Failed to load standings:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStandings();
    }, [fixture.leagueId]);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unill-yellow-400" />
            </div>
        );
    }

    if (!fixture.leagueId) {
        return (
            <div className="p-6 text-center">
                <FiList className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">This is a friendly match - no league standings available</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">Team</th>
                            <th className="px-4 py-3 text-center">P</th>
                            <th className="px-4 py-3 text-center">W</th>
                            <th className="px-4 py-3 text-center">D</th>
                            <th className="px-4 py-3 text-center">L</th>
                            <th className="px-4 py-3 text-center">GD</th>
                            <th className="px-4 py-3 text-center font-bold">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((row) => {
                            const isInvolved = row.team === fixture.homeTeamName || row.team === fixture.awayTeamName;
                            return (
                                <tr
                                    key={row.position}
                                    className={`border-t border-white/5 transition-colors ${isInvolved ? 'bg-unill-yellow-400/10' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <td className="px-4 py-3 text-white font-semibold">{row.position}</td>
                                    <td className="px-4 py-3 text-white font-semibold">{row.team}</td>
                                    <td className="px-4 py-3 text-center text-gray-300">{row.played}</td>
                                    <td className="px-4 py-3 text-center text-green-400">{row.won}</td>
                                    <td className="px-4 py-3 text-center text-gray-400">{row.drawn}</td>
                                    <td className="px-4 py-3 text-center text-red-400">{row.lost}</td>
                                    <td className="px-4 py-3 text-center text-gray-300">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                                    <td className="px-4 py-3 text-center text-white font-bold">{row.points}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const FixtureDetail: React.FC<FixtureDetailProps> = ({ fixture, onClose }) => {
    const [activeTab, setActiveTab] = useState<TabId>('venue');
    const [players, setPlayers] = useState<MatchPlayer[]>([]);

    useEffect(() => {
        // Load players for this match if available
        const loadPlayers = async () => {
            try {
                if (fixture.matchId) {
                    // Would fetch match players from API
                    // For now using empty array
                }
            } catch (error) {
                console.error('Failed to load match players:', error);
            }
        };
        loadPlayers();
    }, [fixture.matchId]);

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'venue', label: 'Venue & Players', icon: <FiMapPin className="w-4 h-4" /> },
        { id: 'statistics', label: 'Statistics', icon: <FiBarChart2 className="w-4 h-4" /> },
        { id: 'standings', label: 'Standings', icon: <FiList className="w-4 h-4" /> },
    ];

    return (
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-unill-purple-500/20 to-unill-yellow-500/20 p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <FiX className="w-5 h-5 text-white" />
                </button>

                <div className="flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex-1 text-center">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-unill-purple-500 to-unill-yellow-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                            <span className="text-3xl font-black text-white">{fixture.homeTeamName?.charAt(0) || 'H'}</span>
                        </div>
                        <p className="text-xl font-bold text-white">{fixture.homeTeamName || 'Home Team'}</p>
                    </div>

                    {/* Score */}
                    <div className="px-8 text-center">
                        {fixture.status === 'completed' || fixture.status === 'live' ? (
                            <div className="text-5xl font-black">
                                <span className="text-white">{fixture.score?.home ?? 0}</span>
                                <span className="text-gray-500 mx-2">-</span>
                                <span className="text-white">{fixture.score?.away ?? 0}</span>
                            </div>
                        ) : (
                            <span className="text-3xl font-bold text-gray-400">VS</span>
                        )}
                        <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">{fixture.sport}</p>
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                            <span className="text-3xl font-black text-white">{fixture.awayTeamName?.charAt(0) || 'A'}</span>
                        </div>
                        <p className="text-xl font-bold text-white">{fixture.awayTeamName || 'Away Team'}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                {tabs.map((tab) => (
                    <TabButton
                        key={tab.id}
                        id={tab.id}
                        label={tab.label}
                        icon={tab.icon}
                        active={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    />
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === 'venue' && <VenuePlayersTab fixture={fixture} players={players} />}
                {activeTab === 'statistics' && <StatisticsTab fixture={fixture} />}
                {activeTab === 'standings' && <StandingsTab fixture={fixture} />}
            </div>
        </div>
    );
};

export default FixtureDetail;
