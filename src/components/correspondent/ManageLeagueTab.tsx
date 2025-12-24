import { LeagueDashboard } from './LeagueDashboard';

export const ManageLeagueTab: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Manage League</h2>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Use this section to manage leagues, groups, stages, matches, and points tables.
        </p>
        <LeagueDashboard />
      </div>
    </div>
  );
};