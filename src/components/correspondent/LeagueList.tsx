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
      <div className={`p-4 rounded-lg shadow-sm ${
        theme === 'light'
          ? 'bg-white/10 backdrop-blur-md border border-white/20'
          : 'bg-card'
      }`}>
        <h3 className="text-lg font-semibold mb-2">Leagues</h3>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm">Loading leagues...</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {leagues.map((l: League) => (
              <li key={l.id} className={`flex justify-between items-center p-3 rounded transition-colors ${
                theme === 'light'
                  ? 'hover:bg-white/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{l.name}</div>
                  <div className="text-sm text-muted truncate">{l.sportType} • {l.description}</div>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <button
                    onClick={() => onSelect?.(l)}
                    className="btn btn-ghost text-sm px-3 py-1"
                  >
                    Open
                  </button>
                </div>
              </li>
            ))}
            {leagues.length === 0 && (
              <li className="text-center py-8 text-muted">
                No leagues found. Create your first league above.
              </li>
            )}
          </ul>
        )}
      </div>
    );
  };