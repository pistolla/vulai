import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group, Stage, Participant, Match } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { RootState } from "@/store";
import { createMatch } from "@/store/correspondentThunk";
import { setMatches } from "@/store/slices/correspondentSlice";
import { toISO } from "@/utils/csvHelpers";
import { useState, useEffect } from "react";
import { MatchCard } from "./MatchCard";

// --- MatchManager ---
export const MatchManager: React.FC<{ league: League; group: Group; stage: Stage }> = ({ league, group, stage }) => {
    const dispatch = useAppDispatch();
    const matches = useAppSelector((s: RootState) => s.correspondent.matches[`${league.id}_${group.id}_${stage.id}`] ?? []);
    const [matchNumber, setMatchNumber] = useState(1);
    const [date, setDate] = useState(toISO());
    const [venue, setVenue] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [pRefId, setPRefId] = useState('');
    const [pName, setPName] = useState('');
    const [pRefType, setPRefType] = useState<'team' | 'individual'>(league.sportType === 'team' ? 'team' : 'individual');
  
    useEffect(() => {
      (async () => {
        const list = await firebaseLeagueService.listMatches(league.id!, group.id!, stage.id!);
        dispatch(setMatches({ leagueId: league.id!, groupId: group.id!, stageId: stage.id!, matches: list }));
      })();
    }, [league.id, group.id, stage.id]);
  
    const addParticipant = () => {
      if (!pRefId) return alert('participant ref required');
      setParticipants((s) => [...s, { refType: pRefType, refId: pRefId, name: pName || pRefId, score: 0 }]);
      setPRefId('');
      setPName('');
    };
  
    const submit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!participants.length) return alert('Add participants');
      const match: Omit<Match, 'id'> = { matchNumber, date, venue, status: 'pending', participants };
      const res = await dispatch(createMatch({ leagueId: league.id!, groupId: group.id!, stageId: stage.id!, match }));
      // refresh matches
      const list = await firebaseLeagueService.listMatches(league.id!, group.id!, stage.id!);
      dispatch(setMatches({ leagueId: league.id!, groupId: group.id!, stageId: stage.id!, matches: list }));
      setParticipants([]);
    };
  
    return (
      <div className="p-2">
        <details>
          <summary className="cursor-pointer">Matches ({matches.length})</summary>
  
          <form onSubmit={submit} className="mt-2 grid gap-2">
            <div className="flex gap-2">
              <input value={matchNumber} onChange={(e) => setMatchNumber(Number(e.target.value))} type="number" className="input w-24" />
              <input value={date} onChange={(e) => setDate(e.target.value)} type="datetime-local" className="input" />
              <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue" className="input" />
            </div>
  
            <div className="grid grid-cols-2 gap-2">
              <input value={pRefId} onChange={(e) => setPRefId(e.target.value)} placeholder="participant ref id" className="input" />
              <input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="display name (optional)" className="input" />
              <select value={pRefType} onChange={(e) => setPRefType(e.target.value as any)} className="input">
                <option value="team">Team</option>
                <option value="individual">Individual</option>
              </select>
              <button type="button" onClick={addParticipant} className="btn btn-outline">Add Participant</button>
            </div>
  
            <div className="space-y-1">
              {participants.map((p, idx) => (
                <div key={idx} className="p-2 rounded bg-card-subtle flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.name ?? p.refId}</div>
                    <div className="text-sm text-muted">{p.refType} • {p.refId}</div>
                  </div>
                  <div>{p.score}</div>
                </div>
              ))}
            </div>
  
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Create Match</button>
            </div>
          </form>
  
          <div className="mt-4 space-y-2">
            {matches.map((m: any) => (
              <MatchCard key={m.id} league={league} group={group} stage={stage} match={m} />
            ))}
          </div>
        </details>
      </div>
    );
  };