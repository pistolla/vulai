import { League } from "@/models";
import { useState } from "react";
import { GroupManager } from "./GroupManager";
import { LeagueForm } from "./LeagueForm";
import { LeagueList } from "./LeagueList";
import { useTheme } from "@/components/ThemeProvider";

// --- Top-level Dashboard Component ---
export const LeagueDashboard: React.FC = () => {
    const [selected, setSelected] = useState<League | null>(null);
    const { theme } = useTheme();

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          {/* Mobile: Stack vertically */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-6">
              <LeagueForm onCreate={(l) => setSelected(l)} />
              <LeagueList onSelect={(l) => setSelected(l)} />
            </div>
  
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <GroupManager league={selected} />
                </div>
                <div>
                  {selected && <div className="space-y-6">
                    {/* Show selected league summary */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700">
                      <h3 className="text-xl font-black dark:text-white mb-2">{selected.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{selected.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-bold">{selected.sportType}</span>
                      </div>
                    </div>
                  </div>}
                </div>
              </div>
  
              {/* optional: a global points/leaderboard area could go here when group is chosen */}
            </div>
          </div>
        </div>
      );
  };