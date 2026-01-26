import { Fixture, League, Match, Team, Season } from "@/models";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { fetchLeagues, fetchFixtures, createFixture, updateFixture } from "@/store/correspondentThunk";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { apiService } from "@/services/apiService";
import { db } from "@/services/firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
});
import 'react-quill/dist/quill.snow.css';

interface FixtureFormProps {
  fixture?: Fixture | null;
  match?: Match | null;
  league?: League | null;
  onClose: () => void;
}

export const FixtureForm: React.FC<FixtureFormProps> = ({ fixture, match, league, onClose }) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state);
  const leagues = useAppSelector((state) => state.correspondent.leagues);
  const fixtures = useAppSelector((state) => state.correspondent.fixtures);
  const [type, setType] = useState<'league' | 'friendly'>(fixture?.type || (match ? 'league' : 'friendly'));
  const [selectedLeague, setSelectedLeague] = useState<string>(league?.id || '');
  const [selectedMatch, setSelectedMatch] = useState<string>(match?.id || '');
  const [matches, setMatches] = useState<Match[]>([]);
  const [homeTeamId, setHomeTeamId] = useState(fixture?.homeTeamId || '');
  const [awayTeamId, setAwayTeamId] = useState(fixture?.awayTeamId || '');
  const [homeTeamName, setHomeTeamName] = useState(fixture?.homeTeamName || (match && match.participants[0] ? match.participants[0].name || match.participants[0].refId : ''));
  const [awayTeamName, setAwayTeamName] = useState(fixture?.awayTeamName || (match && match.participants[1] ? match.participants[1].name || match.participants[1].refId : ''));
  const [scheduledAt, setScheduledAt] = useState(fixture?.scheduledAt || match?.date || '');
  const [venue, setVenue] = useState(fixture?.venue || match?.venue || '');
  const [blogContent, setBlogContent] = useState(fixture?.blogContent || '');
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(fixture?.seasonId || '');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSportId, setSelectedSportId] = useState('');
  const [sports, setSports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchLeagues());
    dispatch(fetchFixtures());
    loadTeams();
    loadSports();
  }, [dispatch]);

  const loadSports = async () => {
    try {
      const allSports = await apiService.getSports();
      setSports(allSports);
    } catch (e) {
      console.error('Failed to load sports:', e);
    }
  };

  const loadTeams = async () => {
    try {
      const allTeams = await apiService.getTeams();
      setTeams(allTeams);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const loadSeasonsForSport = async (sportId: string) => {
    try {
      const list = await firebaseLeagueService.listSeasons(sportId);
      setSeasons(list);
      if (!selectedSeasonId) {
        const active = list.find(s => s.isActive);
        if (active) setSelectedSeasonId(active.id);
      }
    } catch (e) {
      console.error('Failed to load seasons:', e);
    }
  };

  useEffect(() => {
    if (selectedLeague) {
      const league = leagues.find(l => l.id === selectedLeague);
      if (league) {
        const sportName = league.sportName;
        if (sportName) {
          const sport = sports.find(s => s.name.toLowerCase() === sportName.toLowerCase());
          if (sport) loadSeasonsForSport(sport.id);
        }
      }
      loadMatches(selectedLeague);
    } else {
      // Clear seasons when no league is selected
      setSeasons([]);
      setSelectedSeasonId('');
    }
  }, [selectedLeague, sports]);

  useEffect(() => {
    if (type === 'friendly' && selectedSportId) {
      loadSeasonsForSport(selectedSportId);
    } else if (type === 'league' && !selectedLeague) {
      // Clear seasons when switching to league mode without a league selected
      setSeasons([]);
      setSelectedSeasonId('');
    }
  }, [type, selectedSportId]);

  const loadMatches = async (leagueId: string) => {
    try {
      // Load all matches from all groups and stages in the league
      const league = leagues.find((l: League) => l.id === leagueId);
      if (!league) return;

      const allMatches: Match[] = [];
      const groups = await firebaseLeagueService.listGroups(leagueId);
      for (const group of groups) {
        const stages = await firebaseLeagueService.listStages(leagueId, group.id!);
        for (const stage of stages) {
          const stageMatches = await firebaseLeagueService.listMatches(leagueId, group.id!, stage.id!);
          allMatches.push(...stageMatches);
        }
      }
      setMatches(allMatches);
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  };

  useEffect(() => {
    if (selectedLeague) {
      loadMatches(selectedLeague);
    } else {
      setMatches([]);
      setSelectedMatch('');
    }
  }, [selectedLeague]);

  useEffect(() => {
    if (selectedMatch && matches.length > 0) {
      const match = matches.find(m => m.id === selectedMatch);
      if (match && match.participants.length >= 2) {
        // For league matches, use placeholder names or actual if available
        setHomeTeamName(match.participants[0].name || `Team ${match.participants[0].refId}`);
        setAwayTeamName(match.participants[1].name || `Team ${match.participants[1].refId}`);
        // Try to find actual team IDs if they exist
        const homeTeam = teams.find(t => t.name === match.participants[0].name);
        const awayTeam = teams.find(t => t.name === match.participants[1].name);
        setHomeTeamId(homeTeam?.id || match.participants[0].refId);
        setAwayTeamId(awayTeam?.id || match.participants[1].refId);
        if (match.seasonId) setSelectedSeasonId(match.seasonId);
      }
    }
  }, [selectedMatch, matches, teams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeasonId) {
      alert("Please select a season.");
      return;
    }
    setIsLoading(true);

    try {
      let homeId = homeTeamId;
      let awayId = awayTeamId;

      if (type === 'league') {
        const leagueObj = leagues.find(l => l.id === selectedLeague);
        // Create teams if not exist
        const homeTeam = teams.find(t => t.name === homeTeamName);
        if (!homeTeam) {
          const teamId = doc(collection(db, 'teams')).id;
          const newTeam: Omit<Team, 'id'> = {
            universityId: state.auth.user!.universityId!,
            name: homeTeamName,
            sport: leagueObj?.name || 'Unknown',
            foundedYear: new Date().getFullYear(),
          };
          await setDoc(doc(db, 'teams', teamId), newTeam);
          homeId = teamId;
        } else {
          homeId = homeTeam.id;
        }

        const awayTeam = teams.find(t => t.name === awayTeamName);
        if (!awayTeam) {
          const teamId = doc(collection(db, 'teams')).id;
          const newTeam: Omit<Team, 'id'> = {
            universityId: state.auth.user!.universityId!,
            name: awayTeamName,
            sport: leagueObj?.name || 'Unknown',
            foundedYear: new Date().getFullYear(),
          };
          await setDoc(doc(db, 'teams', teamId), newTeam);
          awayId = teamId;
        } else {
          awayId = awayTeam.id;
        }
      }

      const fixtureData: Omit<Fixture, 'id' | 'correspondentId'> = {
        homeTeamName,
        awayTeamName,
        homeTeamId: homeId,
        awayTeamId: awayId,
        sport: type === 'league'
          ? (leagues.find((l: League) => l.id === selectedLeague)?.name || 'Unknown')
          : (sports.find(s => s.id === selectedSportId)?.name || 'Friendly'),
        scheduledAt,
        venue,
        status: 'scheduled',
        type,
        matchId: type === 'league' ? selectedMatch : undefined,
        blogContent: blogContent || undefined,
        seasonId: selectedSeasonId,
      };

      if (fixture) {
        await dispatch(updateFixture({ id: fixture.id, fixture: fixtureData }));
      } else {
        await dispatch(createFixture(fixtureData));
      }

      onClose();
    } catch (error) {
      console.error('Failed to save fixture:', error);
      alert('Failed to save fixture. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold dark:text-white">
            {fixture ? 'Edit Fixture' : 'Create Fixture'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fixture Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'league' | 'friendly')}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
            >
              <option value="league">League Match</option>
              <option value="friendly">Friendly Match</option>
            </select>
          </div>

          {type === 'league' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select League
              </label>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="">Choose League</option>
                {leagues.map((league: League) => (
                  <option key={league.id} value={league.id}>{league.name}</option>
                ))}
              </select>
            </div>
          )}

          {type === 'friendly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Sport
              </label>
              <select
                value={selectedSportId}
                onChange={(e) => setSelectedSportId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                required
              >
                <option value="">Choose Sport</option>
                {sports.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Season
            </label>
            <select
              value={selectedSeasonId}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              required
            >
              <option value="">Choose Season</option>
              {seasons.map((s: Season) => (
                <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>
              ))}
            </select>
            {seasons.length === 0 && (selectedLeague || selectedSportId) && (
              <p className="text-xs text-amber-500 mt-1 italic">No seasons found for this sport. Please create one in Admin Panel.</p>
            )}
          </div>

          {type === 'league' && selectedLeague && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Match
              </label>
              <select
                value={selectedMatch}
                onChange={(e) => setSelectedMatch(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="">Choose Match</option>
                {matches.filter((match: Match) => !fixtures.some((f: Fixture) => f.matchId === match.id) && match.participants && match.participants.length >= 2).map((match: Match) => (
                  <option key={match.id} value={match.id}>
                    Match #{match.matchNumber} - {match.participants.map(p => p.name || p.refId).join(' vs ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Home Team
              </label>
              <select
                value={homeTeamId}
                onChange={(e) => {
                  const team = teams.find(t => t.id === e.target.value);
                  setHomeTeamId(e.target.value);
                  setHomeTeamName(team?.name || (e.target.value === homeTeamId && homeTeamName ? homeTeamName : ''));
                }}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="">Select Home Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
                {/* Fallback for placeholder teams from match */}
                {type === 'league' && homeTeamName && !teams.some(t => t.id === homeTeamId) && (
                  <option value={homeTeamId}>{homeTeamName} (Placeholder)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Away Team
              </label>
              <select
                value={awayTeamId}
                onChange={(e) => {
                  const team = teams.find(t => t.id === e.target.value);
                  setAwayTeamId(e.target.value);
                  setAwayTeamName(team?.name || (e.target.value === awayTeamId && awayTeamName ? awayTeamName : ''));
                }}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="">Select Away Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
                {/* Fallback for placeholder teams from match */}
                {type === 'league' && awayTeamName && !teams.some(t => t.id === awayTeamId) && (
                  <option value={awayTeamId}>{awayTeamName} (Placeholder)</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Venue
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Stadium name"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Blog Content
            </label>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <ReactQuill
                value={blogContent}
                onChange={setBlogContent}
                theme="snow"
                className="min-h-[120px]"
                readOnly={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : (fixture ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};