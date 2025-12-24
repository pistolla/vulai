import { useAppDispatch } from "@/hooks/redux";
import { League, SportType } from "@/models";
import { createLeague } from "@/store/correspondentThunk";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

// --- LeagueForm ---
export const LeagueForm: React.FC<{ onCreate?: (l: League) => void }> = ({ onCreate }) => {
    const dispatch = useAppDispatch();
    const { theme } = useTheme();
    const [name, setName] = useState('');
    const [sportType, setSportType] = useState<SportType>('team');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);

    const submit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!name.trim()) return alert('Please provide a league name');

      setCreating(true);
      try {
        const res = await dispatch(createLeague({ name: name.trim(), sportType, description: description.trim() }));
        if (res.type === createLeague.fulfilled.type && res.payload && onCreate) {
          onCreate(res.payload as League);
        }
        setName('');
        setDescription('');
      } catch (error) {
        console.error('Failed to create league:', error);
        alert('Failed to create league. Please try again.');
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-black dark:text-white mb-4">Create League</h3>
        <form onSubmit={submit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sport Type</label>
            <select
              value={sportType}
              onChange={(e) => setSportType(e.target.value as SportType)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
              disabled={creating}
            >
              <option value="team">Team Sport</option>
              <option value="individual">Individual Sport</option>
            </select>
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
            disabled={creating || !name.trim()}
          >
            {creating ? 'Creating League...' : 'Create League'}
          </button>
        </form>
      </div>
    );
  };