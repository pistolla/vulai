import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group, Stage, Participant, Match, Season, Sport } from "@/models";
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
  const [blogContent, setBlogContent] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const list = await firebaseLeagueService.listMatches(league.id!, group.id!, stage.id!);
        dispatch(setMatches({ leagueId: league.id!, groupId: group.id!, stageId: stage.id!, matches: list }));

        // Fetch seasons for the sport
        const sports: Sport[] = await apiService.getSports();
        const sport = sports.find(s => s.name.toLowerCase() === league.sportType.toLowerCase() || s.name === league.name); // Simple heuristic
        if (sport) {
          const leagueSeasons = await firebaseLeagueService.listSeasons(sport.id);
          setSeasons(leagueSeasons);
          const active = leagueSeasons.find(s => s.isActive);
          if (active) setSelectedSeasonId(active.id);
        }
      } catch (error) {
        console.error('Failed to load match manager data:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [league.id, group.id, stage.id, dispatch, league.sportType, league.name]);


  const addParticipant = () => {
    const nextIndex = participants.length + 1;
    const refType = league.sportType === 'team' ? 'team' : 'individual';
    const refId = league.sportType === 'team' ? `Team ${String.fromCharCode(65 + participants.length)}` : `Player ${nextIndex}`;
    const name = refId;

    setParticipants((s) => [...s, { refType, refId, name, score: 0 }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!participants || participants.length < 2) return alert('Add at least two participants');

    try {
      setIsLoading(true);
      const match: Omit<Match, 'id'> = {
        matchNumber,
        date,
        venue,
        status: 'pending',
        participants,
        seasonId: selectedSeasonId
      };
      const seasonName = seasons.find(s => s.id === selectedSeasonId)?.name;
      await dispatch(createMatch({ leagueId: league.id!, groupId: group.id!, stageId: stage.id!, match, seasonName }));

      // refresh matches
      const list = await firebaseLeagueService.listMatches(league.id!, group.id!, stage.id!);
      dispatch(setMatches({ leagueId: league.id!, groupId: group.id!, stageId: stage.id!, matches: list }));
      setParticipants([]);

      // Reset form
      setMatchNumber(matchNumber + 1);
      setVenue('');
      setParticipants([]);
    } catch (error) {
      console.error('Failed to create match:', error);
      alert('Failed to create match. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Matches ({matches.length})</h4>
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-300">
          <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-600">
            <h5 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">Create New Match</h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Match Number</label>
                <input
                  value={matchNumber}
                  onChange={(e) => setMatchNumber(Number(e.target.value))}
                  type="number"
                  placeholder="1"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white text-sm"
                  disabled={isLoading}
                  min="1"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Date & Time</label>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="datetime-local"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Venue</label>
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Stadium name"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Season</label>
                <select
                  value={selectedSeasonId}
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white text-sm"
                  disabled={isLoading}
                  required
                >
                  <option value="" disabled>Select Season</option>
                  {seasons.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>
                  ))}
                  {seasons.length === 0 && <option value="" disabled>No seasons found</option>}
                </select>
              </div>
            </div>


            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
              <h6 className="font-bold text-gray-900 dark:text-white mb-3">Add Placeholder Participants</h6>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Click to add placeholder {league.sportType === 'team' ? 'teams' : 'players'} (Team A, Team B, etc.)
              </p>
              <button
                type="button"
                onClick={addParticipant}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-70 text-sm sm:text-base"
                disabled={isLoading}
              >
                Add {league.sportType === 'team' ? 'Team' : 'Player'} Placeholder
              </button>
            </div>

            {participants && participants.length > 0 && (
              <div className="mb-4">
                <h6 className="font-bold text-gray-900 dark:text-white mb-3">Participants ({participants.length})</h6>
                <div className="space-y-3">
                  {participants.map((p, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{p.name ?? p.refId}</div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{p.refType} • {p.refId}</div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Score: {p.score}</span>
                          <button
                            type="button"
                            onClick={() => removeParticipant(idx)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs sm:text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            disabled={isLoading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            <button
              type="submit"
              disabled={isLoading || !participants || participants.length < 2}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70 text-sm sm:text-base"
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