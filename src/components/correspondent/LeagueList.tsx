import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League } from "@/models";
import { RootState } from "@/store";
import { fetchLeagues } from "@/store/correspondentThunk";
import { useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

// --- LeagueList ---
export const LeagueList: React.FC<{ onSelect?: (league: League) => void }> = ({ onSelect }) => {
    const dispatch = useAppDispatch();
    const { leagues, loading } = useAppSelector((s: RootState) => s.leagues);
    const { theme } = useTheme();

    useEffect(() => {
      dispatch(fetchLeagues());
    }, [dispatch]);

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-black dark:text-white mb-4">Your Leagues</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading leagues...</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {leagues.map((l: League) => (
              <li key={l.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white truncate mb-1">{l.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{l.sportType} • {l.description}</div>
                  </div>
                  <button
                    onClick={() => onSelect?.(l)}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    Open
                  </button>
                </div>
              </li>
            ))}
            {leagues.length === 0 && (
              <li className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🏆</div>
                <p className="font-medium">No leagues found.</p>
                <p className="text-sm">Create your first league above to get started.</p>
              </li>
            )}
          </ul>
        )}
      </div>
    );
  };