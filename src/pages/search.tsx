import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { SearchSidebar } from '../components/search/SearchSidebar';
import FixtureCard from '../components/search/FixtureCard';
import { FixtureDetail } from '../components/search/FixtureDetail';
import { apiService } from '../services/apiService';
import { Fixture as FixtureModel, League, University, Sport } from '@/models';
import { FiSearch, FiX, FiCalendar, FiFilter } from 'react-icons/fi';

// Helper function to check if a fixture is selected
const isFixtureSelected = (fixture: FixtureModel, selectedFixture: FixtureModel | null): boolean => {
    return selectedFixture !== null && fixture.id === selectedFixture.id;
};

const SearchPage: React.FC = () => {
    // Data state
    const [fixtures, setFixtures] = useState<FixtureModel[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [universities, setUniversities] = useState<University[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
    const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
    const [selectedSport, setSelectedSport] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState({
        leagues: true,
        universities: false,
        sports: false,
    });

    // UI state
    const [selectedFixture, setSelectedFixture] = useState<FixtureModel | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                const [fixturesData, teamsData, universitiesData, sportsData, leaguesData] = await Promise.all([
                    apiService.getFixtures(),
                    apiService.getTeams(),
                    apiService.getUniversities(),
                    apiService.getSports(),
                    import('@/services/firebaseCorrespondence').then(m => m.firebaseLeagueService.listLeagues()),
                ]);

                // 1. Filter fixtures to only show league fixtures
                const leagueFixtures = (fixturesData || []).filter(f => f.type === 'league');
                setFixtures(leagueFixtures);
                setTeams(teamsData || []);
                setUniversities(universitiesData || []);
                setSports(sportsData || []);

                // 2. Map of leagueId to League object for names
                const leagueMap = new Map<string, League>();
                (leaguesData || []).forEach(l => {
                    if (l.id) leagueMap.set(l.id, l);
                });

                // 3. Filter sidebar items to only those with fixtures
                const activeLeagueIds = new Set(leagueFixtures.map(f => f.leagueId).filter(Boolean));
                const filteredLeagues = (leaguesData || []).filter(l => activeLeagueIds.has(l.id!));
                setLeagues(filteredLeagues);

                // Filter universities with fixtures
                const activeTeamIds = new Set([
                    ...leagueFixtures.map(f => f.homeTeamId),
                    ...leagueFixtures.map(f => f.awayTeamId)
                ]);
                const filteredUniversities = (universitiesData || []).filter(uni =>
                    (teamsData || []).some(t => t.universityId === uni.id && activeTeamIds.has(t.id))
                );
                setUniversities(filteredUniversities);

                // Filter sports with fixtures
                const activeSports = new Set(leagueFixtures.map(f => f.sport?.toLowerCase()));
                const filteredSports = (sportsData || []).filter(s => activeSports.has(s.name.toLowerCase()));
                setSports(filteredSports);

            } catch (error) {
                console.error('Failed to load search data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Get team's university ID
    const getTeamUniversityId = (teamId: string): string | undefined => {
        const team = teams.find(t => t.id === teamId);
        return team?.universityId;
    };

    // Filter fixtures
    const filteredFixtures = useMemo(() => {
        return fixtures.filter((fixture) => {
            // Search query filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    fixture.homeTeamName?.toLowerCase().includes(query) ||
                    fixture.awayTeamName?.toLowerCase().includes(query) ||
                    fixture.venue?.toLowerCase().includes(query) ||
                    fixture.sport?.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // League filter
            if (selectedLeague && fixture.leagueId !== selectedLeague) return false;

            // University filter
            if (selectedUniversity) {
                const homeUni = getTeamUniversityId(fixture.homeTeamId);
                const awayUni = getTeamUniversityId(fixture.awayTeamId);
                if (homeUni !== selectedUniversity && awayUni !== selectedUniversity) return false;
            }

            // Sport filter
            if (selectedSport) {
                const sport = sports.find(s => s.id === selectedSport);
                if (sport && fixture.sport?.toLowerCase() !== sport.name.toLowerCase()) return false;
            }

            return true;
        }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    }, [fixtures, searchQuery, selectedLeague, selectedUniversity, selectedSport, teams, sports]);

    // Group fixtures by date
    const groupedFixtures = useMemo(() => {
        const groups: { [date: string]: FixtureModel[] } = {};

        filteredFixtures.forEach((fixture) => {
            const date = new Date(fixture.scheduledAt).toDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(fixture);
        });

        return Object.entries(groups).map(([date, fixtureList]) => ({
            date,
            displayDate: formatGroupDate(date),
            fixtures: fixtureList as FixtureModel[],
        }));
    }, [filteredFixtures]);

    function formatGroupDate(dateStr: string): string {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }

    const handleToggleSection = (section: 'leagues' | 'universities' | 'sports') => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const hasActiveFilters = selectedLeague || selectedUniversity || selectedSport;

    if (loading) {
        return (
            <Layout title="Search Fixtures" description="Search and browse upcoming and past fixtures">
                <div className="min-h-screen flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-unill-yellow-400 mx-auto mb-4" />
                        <p className="text-gray-400">Loading fixtures...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Search Fixtures" description="Search and browse upcoming and past fixtures">
            <div className="min-h-screen bg-gray-900 pt-20">
                {/* Search Header */}
                <div className="bg-gradient-to-r from-unill-purple-500/20 to-unill-yellow-500/20 border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center gap-4">
                            {/* Mobile Sidebar Toggle */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <FiFilter className="w-5 h-5 text-white" />
                            </button>

                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search fixtures by team, venue, or sport..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-unill-yellow-400 focus:border-transparent transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
                                    >
                                        <FiX className="w-4 h-4 text-gray-400" />
                                    </button>
                                )}
                            </div>

                            {/* Active Filters Badge */}
                            {hasActiveFilters && (
                                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-unill-yellow-400/20 text-unill-yellow-400 text-sm font-semibold">
                                    <FiFilter className="w-4 h-4" />
                                    Filtered
                                </span>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-4 flex items-center gap-6 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <FiCalendar className="w-4 h-4" />
                                Showing {filteredFixtures.length} fixture{filteredFixtures.length !== 1 ? 's' : ''}
                            </span>
                            {hasActiveFilters && (
                                <button
                                    onClick={() => {
                                        setSelectedLeague(null);
                                        setSelectedUniversity(null);
                                        setSelectedSport(null);
                                    }}
                                    className="text-unill-yellow-400 hover:text-unill-yellow-300 transition-colors"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex min-h-[calc(100vh-180px)]">
                    {/* Sidebar */}
                    <div className={`fixed lg:relative z-40 h-full transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        }`}>
                        <SearchSidebar
                            leagues={leagues}
                            universities={universities}
                            sports={sports}
                            selectedLeague={selectedLeague}
                            selectedUniversity={selectedUniversity}
                            selectedSport={selectedSport}
                            onLeagueSelect={setSelectedLeague}
                            onUniversitySelect={setSelectedUniversity}
                            onSportSelect={setSelectedSport}
                            expandedSections={expandedSections}
                            onToggleSection={handleToggleSection}
                        />
                    </div>

                    {/* Backdrop for mobile sidebar */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Fixtures Grid */}
                    <div className="flex-1 p-6">
                        {selectedFixture ? (
                            /* Fixture Detail View */
                            <div className="max-w-4xl mx-auto">
                                <FixtureDetail
                                    fixture={selectedFixture}
                                    onClose={() => setSelectedFixture(null)}
                                />
                            </div>
                        ) : filteredFixtures.length === 0 ? (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                <FiCalendar className="w-20 h-20 text-gray-600 mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">No Fixtures Found</h3>
                                <p className="text-gray-400 max-w-md">
                                    {searchQuery || hasActiveFilters
                                        ? 'Try adjusting your search or filters to find more fixtures.'
                                        : 'No fixtures are scheduled for the next 7 days.'}
                                </p>
                                {(searchQuery || hasActiveFilters) && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedLeague(null);
                                            setSelectedUniversity(null);
                                            setSelectedSport(null);
                                        }}
                                        className="mt-4 px-6 py-2 bg-unill-yellow-400 text-black font-semibold rounded-lg hover:bg-unill-yellow-300 transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Fixtures List by Date */
                            <div className="space-y-8">
                                {groupedFixtures.map((group: { date: string; displayDate: string; fixtures: FixtureModel[] }) => (
                                    <div key={group.date}>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <FiCalendar className="w-5 h-5 text-unill-yellow-400" />
                                            {group.displayDate}
                                            <span className="text-sm font-normal text-gray-400">
                                                ({group.fixtures.length} fixture{group.fixtures.length !== 1 ? 's' : ''})
                                            </span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {group.fixtures.map((fixture) => {
                                                const isSelected = isFixtureSelected(fixture, selectedFixture);
                                                return (
                                                    <FixtureCard
                                                        key={fixture.id || Math.random().toString()}
                                                        fixture={fixture}
                                                        leagueName={leagues.find(l => l.id === fixture.leagueId)?.name}
                                                        onClick={() => setSelectedFixture(fixture)}
                                                        isSelected={isSelected}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SearchPage;
