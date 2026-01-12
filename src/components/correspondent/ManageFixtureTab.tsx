import { FixtureDashboard } from './FixtureDashboard.tsx';

export const ManageFixtureTab: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">Manage Fixtures</h2>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Use this section to manage fixtures, link them to league matches, or create friendly fixtures.
        </p>
        <FixtureDashboard />
      </div>
    </div>
  );
};