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
      <div className="container mx-auto p-4">
        {/* Mobile: Stack vertically */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-1 space-y-4">
            <LeagueForm onCreate={(l) => setSelected(l)} />
            <LeagueList onSelect={(l) => setSelected(l)} />
          </div>

          <div className="col-span-1 lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <GroupManager league={selected} />
              </div>
              <div>
                {selected && <div className="space-y-4">
                  {/* Show selected league summary */}
                  <div className={`p-4 rounded-lg ${
                    theme === 'light'
                      ? 'bg-white/10 backdrop-blur-md border border-white/20'
                      : 'bg-card'
                  }`}>
                    <h3 className="font-semibold">{selected.name}</h3>
                    <p className="text-sm text-muted">{selected.description}</p>
                    <p className="text-sm">Type: <strong>{selected.sportType}</strong></p>
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