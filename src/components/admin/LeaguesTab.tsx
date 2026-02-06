import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { League, Group, Stage, Match } from '@/models';
import { firebaseLeagueService } from '@/services/firebaseCorrespondence';
import { fetchLeagues } from '@/store/correspondentThunk';
import { useToast } from '@/components/common/ToastProvider';
import { FiEye, FiEyeOff, FiTrash2, FiUsers, FiTarget, FiCalendar, FiEdit, FiPackage } from 'react-icons/fi';

interface LeagueStats {
  totalGroups: number;
  totalStages: number;
  totalMatches: number;
  totalParticipants: number;
  totalFixtures: number;
  updatedAt: string | null;
  editor?: string;
  isHidden?: boolean;
}

export default function LeaguesTab({ adminData }: { adminData: any }) {
  const dispatch = useAppDispatch();
  const { success, error: showError } = useToast();
  const leagues = useAppSelector((state: any) => state.correspondent?.leagues || []);
  
  const [leagueStats, setLeagueStats] = useState<Record<string, LeagueStats>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    setLoading(true);
    try {
      await dispatch(fetchLeagues() as any);
    } catch (err) {
      console.error('Failed to load leagues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leagues.length > 0) {
      loadLeagueStats();
    }
  }, [leagues]);

  const loadLeagueStats = async () => {
    const stats: Record<string, LeagueStats> = {};
    
    for (const league of leagues) {
      try {
        const [leagueStatsData, fixturesCount] = await Promise.all([
          firebaseLeagueService.getLeagueStats(league.id),
          firebaseLeagueService.getLeagueFixturesCount(league.id),
        ]);
        
        stats[league.id] = {
          ...leagueStatsData,
          totalFixtures: fixturesCount,
          editor: league.updatedBy || league.createdBy || 'System',
          isHidden: league.isHidden || false,
        };
      } catch (err) {
        console.error(`Failed to load stats for league ${league.id}:`, err);
        stats[league.id] = {
          totalGroups: 0,
          totalStages: 0,
          totalMatches: 0,
          totalParticipants: 0,
          totalFixtures: 0,
          updatedAt: null,
          isHidden: false,
        };
      }
    }
    
    setLeagueStats(stats);
  };

  const toggleLeagueVisibility = async (leagueId: string, currentVisibility: boolean) => {
    setProcessing(leagueId);
    try {
      await firebaseLeagueService.toggleLeagueVisibility(leagueId, !currentVisibility);
      await loadLeagueStats();
      success(
        !currentVisibility ? 'League hidden' : 'League shown',
        !currentVisibility ? 'The league is now hidden from users' : 'The league is now visible to users'
      );
    } catch (err) {
      showError('Failed to update league visibility', 'Please try again');
    } finally {
      setProcessing(null);
    }
  };

  const deleteLeague = async (leagueId: string, leagueName: string) => {
    if (!confirm(`Are you sure you want to delete "${leagueName}"? This will delete all groups, stages, matches, and fixtures associated with this league. This action cannot be undone.`)) {
      return;
    }
    
    setProcessing(leagueId);
    try {
      await firebaseLeagueService.deleteLeague(leagueId);
      await loadLeagues();
      success('League deleted', 'The league and all its data have been removed');
    } catch (err) {
      showError('Failed to delete league', 'Please try again or contact support');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  if (loading && leagues.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading leagues...</p>
        </div>
      </div>
    );
  }

  if (leagues.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mb-6">
          <FiCalendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Leagues Found</h3>
        <p className="text-gray-500 dark:text-gray-400">Create leagues in the Correspondent Dashboard to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">League Management</h2>
          <p className="text-gray-500 dark:text-gray-400">View and manage all leagues in the system</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {leagues.length} {leagues.length === 1 ? 'league' : 'leagues'} found
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                League Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sport
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Last Edited
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Editor
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Groups
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stages
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Matches
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Participants
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fixtures
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {leagues.map((league: League) => {
              const stats = leagueStats[league.id!] || {
                totalGroups: 0,
                totalStages: 0,
                totalMatches: 0,
                totalParticipants: 0,
                totalFixtures: 0,
                updatedAt: null,
                isHidden: false,
              };
              
              return (
                <tr key={league.id} className={stats.isHidden ? 'opacity-60' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {league.name?.charAt(0)?.toUpperCase() || 'L'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {league.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {league.sportName || league.sportType || 'Unknown Sport'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                      {league.sportType || 'team'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(stats.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <FiEdit className="w-3 h-3" />
                      {stats.editor || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <FiUsers className="w-4 h-4 text-gray-400" />
                      {stats.totalGroups}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <FiTarget className="w-4 h-4 text-gray-400" />
                      {stats.totalStages}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      {stats.totalMatches}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <FiUsers className="w-4 h-4 text-gray-400" />
                      {stats.totalParticipants}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <FiPackage className="w-4 h-4 text-gray-400" />
                      {stats.totalFixtures}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {stats.isHidden ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Hidden
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Visible
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleLeagueVisibility(league.id!, stats.isHidden || false)}
                        disabled={processing === league.id}
                        className={`p-2 rounded-lg transition-colors ${
                          stats.isHidden
                            ? 'text-gray-400 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                            : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={stats.isHidden ? 'Show League' : 'Hide League'}
                      >
                        {processing === league.id ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : stats.isHidden ? (
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteLeague(league.id!, league.name || 'Unknown League')}
                        disabled={processing === league.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete League"
                      >
                        {processing === league.id ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <FiTrash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
