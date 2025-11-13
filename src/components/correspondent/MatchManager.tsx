import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group, Stage, Participant, Match } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { RootState } from "@/store";
import { createMatch } from "@/store/correspondentThunk";
import { setMatches } from "@/store/slices/correspondentSlice";
import { toISO } from "@/utils/csvHelpers";
import { useState, useEffect } from "react";
import { MatchCard } from "./MatchCard";
import { useTheme } from "@/components/ThemeProvider";

// --- MatchManager ---
export const MatchManager: React.FC<{ league: League; group: Group; stage: Stage }> = ({ league, group, stage }) => {
    const dispatch = useAppDispatch();
    const matches = useAppSelector((s: RootState) => s.correspondent.matches[`${league.id}_${group.id}_${stage.id}`] ?? []);
    const { theme } = useTheme();
    const [matchNumber, setMatchNumber] = useState(1);
    const [date, setDate] = useState(toISO());
    const [venue, setVenue] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [pRefId, setPRefId] = useState('');
    const [pName, setPName] = useState('');
    const [pRefType, setPRefType] = useState<'team' | 'individual'>(league.sportType === 'team' ? 'team' : 'individual');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      (async () => {
        try {
          setIsLoading(true);
          const list = await firebaseLeagueService.listMatches(league.id!, group.id!, stage.id!);
          dispatch(setMatches({ leagueId: league.id!, groupId: group.id!, stageId: stage.id!, matches: list }));
        } catch (error) {
          console.error('Failed to load matches:', error);
          alert('Failed to load matches. Please try again.');
        } finally {
          setIsLoading(false);
        }
      })();
    }, [league.id, group.id, stage.id, dispatch]);

    const addParticipant = () => {
      if (!pRefId.trim()) return alert('Participant reference ID is required');

      // Check for duplicate participants
      if (participants.some(p => p.refId === pRefId.trim())) {
        return alert('Participant already added');
      }

      setParticipants((s) => [...s, { refType: pRefType, refId: pRefId.trim(), name: pName.trim() || pRefId.trim(), score: 0 }]);
      setPRefId('');
      setPName('');
    };

    const submit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!participants.length) return alert('Add at least one participant');

      try {
        setIsLoading(true);
        const match: Omit<Match, 'id'> = { matchNumber, date, venue, status: 'pending', participants };
        await dispatch(createMatch({ leagueId: league.id!, groupId: group.id!, stageId: stage.id!, match }));

        // refresh matches
        const list = await firebaseLeagueService.listMatches(league.id!, group.id!, stage.id!);
        dispatch(setMatches({ leagueId: league.id!, groupId: group.id!, stageId: stage.id!, matches: list }));
        setParticipants([]);

        // Reset form
        setMatchNumber(matchNumber + 1);
        setVenue('');
      } catch (error) {
        console.error('Failed to create match:', error);
        alert('Failed to create match. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="p-2">
        <details open={isOpen} onToggle={(e) => setIsOpen(e.currentTarget.open)}>
          <summary className="cursor-pointer font-medium text-sm">
            Matches ({matches.length})
          </summary>

          <div className="mt-3 space-y-3">
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  value={matchNumber}
                  onChange={(e) => setMatchNumber(Number(e.target.value))}
                  type="number"
                  placeholder="Match #"
                  className={`input ${
                    theme === 'light'
                      ? 'bg-white/20 border-white/30 text-white placeholder:text-white/70'
                      : ''
                  }`}
                  disabled={isLoading}
                  min="1"
                />
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="datetime-local"
                  className={`input ${
                    theme === 'light'
                      ? 'bg-white/20 border-white/30 text-white'
                      : ''
                  }`}
                  disabled={isLoading}
                />
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Venue"
                  className={`input ${
                    theme === 'light'
                      ? 'bg-white/20 border-white/30 text-white placeholder:text-white/70'
                      : ''
                  }`}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <input
                  value={pRefId}
                  onChange={(e) => setPRefId(e.target.value)}
                  placeholder="Participant ref ID"
                  className={`input ${
                    theme === 'light'
                      ? 'bg-white/20 border-white/30 text-white placeholder:text-white/70'
                      : ''
                  }`}
                  disabled={isLoading}
                />
                <input
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Display name (optional)"
                  className={`input ${
                    theme === 'light'
                      ? 'bg-white/20 border-white/30 text-white placeholder:text-white/70'
                      : ''
                  }`}
                  disabled={isLoading}
                />
                <select
                  value={pRefType}
                  onChange={(e) => setPRefType(e.target.value as 'team' | 'individual')}
                  className={`input ${
                    theme === 'light'
                      ? 'bg-white/20 border-white/30 text-white'
                      : ''
                  }`}
                  disabled={isLoading}
                >
                  <option value="team">Team</option>
                  <option value="individual">Individual</option>
                </select>
                <button
                  type="button"
                  onClick={addParticipant}
                  className="btn btn-outline"
                  disabled={isLoading || !pRefId.trim()}
                >
                  Add Participant
                </button>
              </div>

              {participants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Participants ({participants.length})</h4>
                  {participants.map((p, idx) => (
                    <div key={idx} className={`p-2 rounded flex justify-between items-center ${
                      theme === 'light'
                        ? 'bg-white/10'
                        : 'bg-card-subtle'
                    }`}>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{p.name ?? p.refId}</div>
                        <div className="text-sm text-muted truncate">{p.refType} • {p.refId}</div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-sm font-medium">Score: {p.score}</span>
                        <button
                          type="button"
                          onClick={() => setParticipants(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded"
                          disabled={isLoading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading || participants.length === 0}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Creating...' : 'Create Match'}
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {isLoading && matches.length === 0 ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm">Loading matches...</p>
                </div>
              ) : (
                matches.map((m: Match) => (
                  <MatchCard key={m.id} league={league} group={group} stage={stage} match={m} />
                ))
              )}
              {matches.length === 0 && !isLoading && (
                <div className="text-center py-4 text-muted text-sm">
                  No matches yet. Create your first match above.
                </div>
              )}
            </div>
          </div>
        </details>
      </div>
    );
  };