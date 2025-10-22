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
    const creating = false;
  
    const submit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!name) return alert('Provide name');
      const res = await dispatch(createLeague({ name, sportType, description }));
      if (res?.payload?.id && onCreate) onCreate(res.payload as League);
      setName('');
      setDescription('');
    };
  
    return (
      <form onSubmit={submit} className="p-4 bg-card rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Create League</h3>
        <div className="grid gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="League name" className="input" />
          <select value={sportType} onChange={(e) => setSportType(e.target.value as SportType)} className="input">
            <option value="team">Team sport</option>
            <option value="individual">Individual sport</option>
          </select>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="input" />
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </div>
      </form>
    );
  };