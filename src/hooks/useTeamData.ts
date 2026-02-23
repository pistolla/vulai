import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiService } from '@/services/apiService';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchMerch } from '@/store/adminThunk';
import { findTeamBySlug } from '@/utils/slugUtils';

export const configThemes: Record<string, { primary: string; secondary: string; accent: string }> = {
    quantum: { primary: '#6a11cb', secondary: '#2575fc', accent: '#00d4ff' },
    crimson: { primary: '#990000', secondary: '#ffffff', accent: '#13294b' },
    blue: { primary: '#003366', secondary: '#ffffff', accent: '#990000' },
    cardinal: { primary: '#8C1515', secondary: '#ffffff', accent: '#4D4D4D' },
    gold: { primary: '#FFB81C', secondary: '#000000', accent: '#00539B' },
    neon: { primary: '#ff416c', secondary: '#ff4b2b', accent: '#ffcc00' },
    cyber: { primary: '#11998e', secondary: '#38ef7d', accent: '#00ffcc' },
};

export function useTeamData(slug: string | undefined) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [teamData, setTeamData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [themeColors, setThemeColors] = useState(configThemes.blue);
    const [error, setError] = useState<string | null>(null);

    const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);

    useEffect(() => {
        if (!slug) return;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Fetch Team Data
                const teamsData = await apiService.getTeamsData();

                // If no teams exist at all, redirect to /teams page
                if (!teamsData.teams || teamsData.teams.length === 0) {
                    console.warn('No teams found in database, redirecting to /teams');
                    router.replace('/teams');
                    setLoading(false);
                    return;
                }

                // Find team using the shared utility function for consistent slug matching
                const team = findTeamBySlug(teamsData.teams, slug);

                if (!team) {
                    // Team not found, redirect to /teams page
                    console.warn(`Team not found for slug: ${slug}, redirecting to /teams`);
                    router.replace('/teams');
                    setLoading(false);
                    return;
                }

                setTeamData(team);
                // Use team's custom theme if available, otherwise fall back to named theme or default
                if (team.theme && typeof team.theme === 'object' && 'primary' in team.theme) {
                    setThemeColors({
                        primary: team.theme.primary,
                        secondary: team.theme.secondary || '#ffffff',
                        accent: team.theme.accent || '#13294b'
                    });
                } else {
                    const themeName = typeof team.theme === 'string' ? team.theme : 'blue';
                    const theme = configThemes[themeName] || configThemes.blue;
                    setThemeColors(theme);
                }

                // 2. Fetch Merch (if not already loaded)
                dispatch(fetchMerch());

                // 3. Simulate Match Data
                const mockMatches = [
                    {
                        id: 'm1',
                        homeTeam: team?.name || 'Home Team',
                        awayTeam: 'Nexus United',
                        status: 'live',
                        date: 'Today, 7:00 PM',
                        venue: 'University Stadium',
                        homeScore: 2,
                        awayScore: 1,
                        isLive: true,
                        minute: 76
                    },
                    {
                        id: 'm2',
                        homeTeam: 'Cyber City',
                        awayTeam: team?.name || 'Away Team',
                        status: 'upcoming',
                        date: 'Tomorrow, 3:00 PM',
                        venue: 'Tech Arena'
                    },
                    {
                        id: 'm3',
                        homeTeam: team?.name || 'Home Team',
                        awayTeam: 'Phoenix FC',
                        status: 'completed',
                        date: 'Yesterday',
                        venue: 'Home Ground',
                        homeScore: 3,
                        awayScore: 2
                    }
                ];
                setUpcomingMatches(mockMatches);

            } catch (error) {
                console.error("Failed to load team data", error);
                setError('Failed to load team data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [slug, dispatch, router]);

    return {
        teamData,
        loading,
        themeColors,
        upcomingMatches,
        error
    };
}
