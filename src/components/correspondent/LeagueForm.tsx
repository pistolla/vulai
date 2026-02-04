import { useAppDispatch } from "@/hooks/redux";
import { League, SportType, Sport } from "@/models";
import { createLeague, createGroup } from "@/store/correspondentThunk";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { apiService } from "@/services/apiService";
import { useToast } from "@/components/common/ToastProvider";

// --- LeagueForm ---
export const LeagueForm: React.FC<{ onCreate?: (l: League) => void }> = ({ onCreate }) => {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { success, error: showError, warning } = useToast();
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState<SportType>('team');
  const [description, setDescription] = useState('');
  const [hasGroups, setHasGroups] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sportName, setSportName] = useState('');

  // New states for sport selection
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSportId, setSelectedSportId] = useState('');

  useEffect(() => {
    apiService.getSports().then(setSports).catch(err => console.error("Failed to load sports", err));
  }, []);

  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedSportId(id);
    const sport = sports.find(s => s.id === id);
    if (sport) {
      setSportName(sport.id);
      setSportType(sport.category as SportType);
    }
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return warning('League name required', 'Please enter a name for the league');
    if (!selectedSportId) return warning('Sport required', 'Please select a sport for the league');

    setCreating(true);
    try {
      const res = await dispatch(createLeague({
        name: name.trim(),
        sportType,
        sportName,
        description: description.trim(),
        hasGroups
      }));
      if (res.type === createLeague.fulfilled.type && res.payload) {
        // If groupless, create a default "General" group automatically
        if (!hasGroups) {
          await dispatch(createGroup({
            leagueId: (res.payload as League).id!,
            group: { name: 'General' }
          }));
        }

        if (onCreate) {
          onCreate(res.payload as League);
        }
        success('League created successfully', 'The league is now active and ready', 'Add teams or create groups');
      }
      setName('');
      setDescription('');
      setSelectedSportId('');
    } catch (error) {
      console.error('Failed to create league:', error);
      showError('Failed to create league', 'Please try again or contact support');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700">
      <h3 className="text-xl font-black dark:text-white mb-4">Create League</h3>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">League Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter league name"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={creating}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sport</label>
            <select
              value={selectedSportId}
              onChange={handleSportChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
              disabled={creating}
            >
              <option value="">Select a Sport</option>
              {sports.map(sport => (
                <option key={sport.id} value={sport.id}>{sport.name} ({sport.category})</option>
              ))}
            </select>
            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 pl-1">
              Type: {sportType === 'team' ? 'Team Sport' : 'Individual Sport'}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
          <input
            id="hasGroups"
            type="checkbox"
            checked={hasGroups}
            onChange={(e) => setHasGroups(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="hasGroups" className="flex-1 cursor-pointer">
            <span className="block text-sm font-bold text-gray-900 dark:text-white">Enable Groups / Divisions</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">If disabled, stages will be created directly under the league.</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            disabled={creating}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70"
          disabled={creating || !name.trim() || !selectedSportId}
        >
          {creating ? 'Creating League...' : 'Create League'}
        </button>
      </form>
    </div>
  );
};