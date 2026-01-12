import { Fixture } from "@/models";
import { useAppSelector } from "@/hooks/redux";

interface FixtureListProps {
  onSelect: (fixture: Fixture) => void;
}

export const FixtureList: React.FC<FixtureListProps> = ({ onSelect }) => {
  const fixtures = useAppSelector((state) => state.correspondent.fixtures) || [];

  return (
    <div className="space-y-4">
      {fixtures.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-3xl mb-2">⚽</div>
          <p className="font-medium">No fixtures yet.</p>
          <p className="text-sm">Create your first fixture to get started.</p>
        </div>
      ) : (
        fixtures.map((fixture) => (
          <div
            key={fixture.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => onSelect(fixture)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {fixture.homeTeamName} vs {fixture.awayTeamName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(fixture.scheduledAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {fixture.venue}
                </p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  fixture.type === 'league'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                }`}>
                  {fixture.type}
                </span>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  fixture.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : fixture.status === 'live'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {fixture.status}
                </span>
                {fixture.score && (
                  <p className="text-sm font-semibold mt-1">
                    {fixture.score.home} - {fixture.score.away}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};