import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group, Stage, Participant, Match } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { apiService } from "@/services/apiService";
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
    const [teams, setTeams] = useState<any[]>([]);

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

    useEffect(() => {
      (async () => {
        try {
          const allTeams = await apiService.getTeams();
          setTeams(allTeams);
        } catch (error) {
          console.error('Failed to load teams:', error);
        }
      })();
    }, []);

    const addParticipant = () => {
      if (!pRefId.trim()) return alert('Participant reference ID is required');

      // Check for duplicate participants
      if (participants.some(p => p.refId === pRefId.trim())) {
        return alert('Participant already added');
      }

      const selectedTeam = pRefType === 'team' ? teams.find(t => t.id === pRefId) : null;
      const name = selectedTeam ? selectedTeam.name : (pName.trim() || pRefId.trim());

      setParticipants((s) => [...s, { refType: pRefType, refId: pRefId.trim(), name, score: 0 }]);
      setPRefId('');
      setPName('');
    };

    const submit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (participants.length < 2) return alert('Add at least two participants');

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
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <h4 className="font-bold text-gray-900 dark:text-white">Matches ({matches.length})</h4>
          <svg
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-300">
            <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
              <h5 className="font-bold text-gray-900 dark:text-white mb-3">Create New Match</h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Match Number</label>
                  <input
                    value={matchNumber}
                    onChange={(e) => setMatchNumber(Number(e.target.value))}
                    type="number"
                    placeholder="1"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                    disabled={isLoading}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Date & Time</label>
                  <input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="datetime-local"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Venue</label>
                  <input
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Stadium name"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                <h6 className="font-bold text-gray-900 dark:text-white mb-2">Add Participants</h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {pRefType === 'team' ? (
                    <select
                      value={pRefId}
                      onChange={(e) => setPRefId(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                      disabled={isLoading}
                    >
                      <option value="">Select Team</option>
                      {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                  ) : (
                    <input
                      value={pRefId}
                      onChange={(e) => setPRefId(e.target.value)}
                      placeholder="Participant ID"
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      disabled={isLoading}
                    />
                  )}
                  <input
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="Display name"
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isLoading}
                  />
                  <select
                    value={pRefType}
                    onChange={(e) => setPRefType(e.target.value as 'team' | 'individual')}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                    disabled={isLoading}
                  >
                    <option value="team">Team</option>
                    <option value="individual">Individual</option>
                  </select>
                  <button
                    type="button"
                    onClick={addParticipant}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-70"
                    disabled={isLoading || !pRefId.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>

              {participants.length > 0 && (
                <div className="mb-4">
                  <h6 className="font-bold text-gray-900 dark:text-white mb-2">Participants ({participants.length})</h6>
                  <div className="space-y-2">
                    {participants.map((p, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">{p.name ?? p.refId}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{p.refType} • {p.refId}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Score: {p.score}</span>
                          <button
                            type="button"
                            onClick={() => setParticipants(prev => prev.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            disabled={isLoading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || participants.length < 2}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70"
              >
                {isLoading ? 'Creating Match...' : 'Create Match'}
              </button>
            </form>

            <div className="space-y-3">
              {isLoading && matches.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium">Loading matches...</p>
                </div>
              ) : (
                matches.map((m: Match) => (
                  <MatchCard key={m.id} league={league} group={group} stage={stage} match={m} />
                ))
              )}
              {matches.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-3xl mb-2">⚽</div>
                  <p className="font-medium">No matches yet.</p>
                  <p className="text-sm">Create your first match to start the tournament.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };