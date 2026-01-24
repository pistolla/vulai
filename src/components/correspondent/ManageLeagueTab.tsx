import { LeagueDashboard } from './LeagueDashboard';

export const ManageLeagueTab: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 dark:text-white">Manage League</h2>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Use this section to manage leagues, groups, stages, matches, and points tables.
        </p>
        <LeagueDashboard />
      </div>
    </div>
  );
};