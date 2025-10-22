import { useAppDispatch } from "@/hooks/redux";
import { League, SportType } from "@/models";
import { createLeague } from "@/store/correspondentThunk";
import { useState } from "react";

// --- LeagueForm ---
export const LeagueForm: React.FC<{ onCreate?: (l: League) => void }> = ({ onCreate }) => {
    const dispatch = useAppDispatch();
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
      <form onSubmit={submit} className="p-4 bg-card rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Create League</h3>
        <div className="grid gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="League name"
            className="input"
            disabled={creating}
            required
          />
          <select
            value={sportType}
            onChange={(e) => setSportType(e.target.value as SportType)}
            className="input"
            disabled={creating}
          >
            <option value="team">Team sport</option>
            <option value="individual">Individual sport</option>
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="input"
            disabled={creating}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || !name.trim()}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    );
  };