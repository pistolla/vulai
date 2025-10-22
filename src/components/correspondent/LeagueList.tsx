import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League } from "@/models";
import { RootState } from "@/store";
import { fetchLeagues } from "@/store/correspondentThunk";
import { useEffect } from "react";

// --- LeagueList ---
export const LeagueList: React.FC<{ onSelect?: (league: League) => void }> = ({ onSelect }) => {
    const dispatch = useAppDispatch();
    const { leagues, loading } = useAppSelector((s: RootState) => s.leagues);
  
    useEffect(() => {
      dispatch(fetchLeagues());
    }, [dispatch]);
  
    return (
      <div className="p-4 bg-card rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Leagues</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul className="space-y-2">
            {leagues.map((l) => (
              <li key={l.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-sm text-muted">{l.sportType} • {l.description}</div>
                </div>
                <div>
                  <button onClick={() => onSelect?.(l)} className="btn btn-ghost">Open</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };