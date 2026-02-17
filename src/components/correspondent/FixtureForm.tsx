import { Fixture, League, Match, Team, Season } from "@/models";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { fetchLeagues, fetchFixtures, createFixture, updateFixture } from "@/store/correspondentThunk";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { apiService } from "@/services/apiService";
import { db } from "@/services/firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import dynamic from 'next/dynamic';
import { useToast } from "@/components/common/ToastProvider";
import { FiCalendar, FiMapPin, FiUsers, FiCheckCircle, FiAlertCircle, FiArrowRight, FiX } from 'react-icons/fi';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
});
import 'react-quill/dist/quill.snow.css';

interface TeamOption {
  id: string;
  name: string;
  sport?: string;
  university?: string;
}

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
  const { success, error: showError, warning, info } = useToast();
  const [type, setType] = useState<'league' | 'friendly'>(fixture?.type || (match ? 'league' : 'friendly'));
  const [selectedLeague, setSelectedLeague] = useState<string>(league?.id || '');
  const [selectedMatch, setSelectedMatch] = useState<string>(match?.id || '');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [homeTeamId, setHomeTeamId] = useState(fixture?.homeTeamId || '');
  const [awayTeamId, setAwayTeamId] = useState(fixture?.awayTeamId || '');
  const [homeTeamName, setHomeTeamName] = useState(fixture?.homeTeamName || (match && match.participants[0] ? match.participants[0].name || match.participants[0].refId : ''));
  const [awayTeamName, setAwayTeamName] = useState(fixture?.awayTeamName || (match && match.participants[1] ? match.participants[1].name || match.participants[1].refId : ''));
  const [scheduledAt, setScheduledAt] = useState(fixture?.scheduledAt || match?.date || '');
  const [venue, setVenue] = useState(fixture?.venue || match?.venue || '');
  const [blogContent, setBlogContent] = useState(fixture?.blogContent || '');
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamOption[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(fixture?.seasonId || '');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSportId, setSelectedSportId] = useState('');
  const [sports, setSports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      const formattedTeams: TeamOption[] = allTeams.map((t: any) => ({
        id: t.id,
        name: t.name,
        sport: t.sport,
        university: t.universityName || t.universityId
      }));
      setTeams(formattedTeams);
      setFilteredTeams(formattedTeams);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const filterTeamsBySport = (sportId: string) => {
    if (!sportId) {
      setFilteredTeams(teams);
      return;
    }
    const selectedSport = sports.find((s: any) => s.id === sportId);
    if (selectedSport) {
      const filtered = teams.filter(t => 
        !t.sport || t.sport.toLowerCase() === selectedSport.name.toLowerCase()
      );
      setFilteredTeams(filtered);
      if (filtered.length === 0) {
        info('No teams found', `No teams registered for ${selectedSport.name}. Create teams first.`);
      }
    }
  };

  const loadSeasonsForSport = async (sportId: string) => {
    if (!sportId) {
      setSeasons([]);
      return;
    }
    try {
      // Try the subcollection path first: sports/{sportId}/seasons
      let list = await firebaseLeagueService.listSeasons(sportId);
      
      // If no seasons found in subcollection, try root-level seasons collection
      if (list.length === 0) {
        console.log('[FixtureForm] No seasons in subcollection, trying root collection for sport:', sportId);
        list = await firebaseLeagueService.listSeasonsFromRoot(sportId);
      }
      
      // If still no seasons, try finding by sport name
      if (list.length === 0) {
        const sport = sports.find((s: any) => s.id === sportId);
        if (sport) {
          console.log('[FixtureForm] Trying to load seasons by sport name:', sport.name);
          list = await firebaseLeagueService.listSeasonsBySportName(sport.name);
        }
      }
      
      setSeasons(list);
      console.log('[FixtureForm] Loaded seasons:', list.length, 'for sport:', sportId);
      
      // Auto-select active season if none selected
      if (!selectedSeasonId && list.length > 0) {
        const active = list.find(s => s.isActive);
        if (active) {
          setSelectedSeasonId(active.id);
        } else if (list.length > 0) {
          // Default to first season if no active one
          setSelectedSeasonId(list[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load seasons:', e);
      setSeasons([]);
    }
  };

  useEffect(() => {
    // Ensure sports are loaded before proceeding
    if (sports.length === 0) return;
    
    // Don't proceed if we don't have the necessary data
    if (!selectedLeague && type === 'league') return;
    
    if (selectedLeague && leagues.length > 0) {
      const league = leagues.find(l => l.id === selectedLeague);
      if (league) {
        const sportId = league.sportId;
        const sportName = league.sportName;
        const leagueName = league.name;
        
        console.log('[FixtureForm] Looking for sport - league:', league.name, 'sportId:', sportId, 'sportName:', sportName, 'available sports:', sports.map(s => ({ id: s.id, name: s.name })));
        
        // First try: Match by sportId (most reliable)
        let sport = sportId ? sports.find(s => s.id === sportId) : null;
        
        // Second try: Match by sportName
        if (!sport && sportName) {
          sport = sports.find(s => s.name.toLowerCase().trim() === sportName.toLowerCase().trim());
        }
        
        // Third try: Match by league name
        if (!sport && leagueName) {
          sport = sports.find(s => s.name.toLowerCase().trim() === leagueName.toLowerCase().trim());
        }
        
        // Fourth try: Partial matching
        if (!sport && sportName) {
          sport = sports.find(s => 
            s.name.toLowerCase().includes(sportName.toLowerCase().trim()) ||
            sportName.toLowerCase().includes(s.name.toLowerCase().trim())
          );
        }
        
        if (sport) {
          console.log('[FixtureForm] Found matching sport:', sport.id, sport.name);
          loadSeasonsForSport(sport.id);
          filterTeamsBySport(sport.id);
        } else {
          // If sport not found, log for debugging
          console.warn('Sport not found for league:', league.name, 'sportId:', sportId, 'sportName:', sportName, 'available sports:', sports.map(s => s.name));
          setSeasons([]);
          setFilteredTeams(teams);
        }
      }
      loadMatches(selectedLeague);
    } else if (!selectedLeague) {
      // Clear seasons and teams when no league is selected
      setSeasons([]);
      setSelectedSeasonId('');
      setFilteredTeams(teams);
    }
  }, [selectedLeague, sports, leagues, type]);

  useEffect(() => {
    if (type === 'friendly' && selectedSportId) {
      loadSeasonsForSport(selectedSportId);
      filterTeamsBySport(selectedSportId);
    } else if (type === 'friendly' && !selectedSportId) {
      setFilteredTeams(teams);
      setSeasons([]);
      setSelectedSeasonId('');
    } else if (type === 'league' && !selectedLeague) {
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
          // Add groupId and stageId to each match for tracking
          const matchesWithIds = stageMatches.map(m => ({
            ...m,
            groupId: group.id,
            stageId: stage.id,
          }));
          allMatches.push(...matchesWithIds);
        }
      }
      setMatches(allMatches);
      console.log(`[FixtureForm] Loaded ${allMatches.length} matches for league ${leagueId}`);
    } catch (error) {
      console.error('[FixtureForm] Failed to load matches:', error);
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
        setHomeTeamName(match.participants[0].name || `Team ${match.participants[0].refId}`);
        setAwayTeamName(match.participants[1].name || `Team ${match.participants[1].refId}`);
        const homeTeam = filteredTeams.find((t: TeamOption) => t.name === match.participants[0].name);
        const awayTeam = filteredTeams.find((t: TeamOption) => t.name === match.participants[1].name);
        setHomeTeamId(homeTeam?.id || match.participants[0].refId);
        setAwayTeamId(awayTeam?.id || match.participants[1].refId);
        if (match.seasonId) setSelectedSeasonId(match.seasonId);
        if (match.groupId) setSelectedGroupId(match.groupId);
        if (match.stageId) setSelectedStageId(match.stageId);
      }
    }
  }, [selectedMatch, matches, filteredTeams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    const newErrors: Record<string, string> = {};
    if (!selectedSeasonId) newErrors.season = 'Season is required';
    if (!homeTeamId) newErrors.homeTeam = 'Home team is required';
    if (!awayTeamId) newErrors.awayTeam = 'Away team is required';
    if (homeTeamId === awayTeamId) newErrors.sameTeam = 'Home and away teams cannot be the same';
    if (!scheduledAt) newErrors.date = 'Date and time is required';
    if (!venue.trim()) newErrors.venue = 'Venue is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      warning('Please fill in all required fields', 'Check the highlighted fields below');
      return;
    }
    
    setIsLoading(true);

    try {
      const homeTeam = filteredTeams.find((t: TeamOption) => t.id === homeTeamId);
      const awayTeam = filteredTeams.find((t: TeamOption) => t.id === awayTeamId);

      // For friendly matches, teams MUST exist in the teams collection
      if (type === 'friendly') {
        if (!homeTeam || !awayTeam) {
          warning('Teams not found', 'Selected teams must exist in the teams collection. Create teams first.');
          setIsLoading(false);
          return;
        }

        // Validate that teams belong to the selected sport
        const selectedSport = sports.find((s: any) => s.id === selectedSportId);
        if (selectedSport) {
          if (homeTeam.sport && homeTeam.sport.toLowerCase() !== selectedSport.name.toLowerCase()) {
            warning('Sport mismatch', `Home team sport (${homeTeam.sport}) does not match selected sport (${selectedSport.name})`);
            setIsLoading(false);
            return;
          }
          if (awayTeam.sport && awayTeam.sport.toLowerCase() !== selectedSport.name.toLowerCase()) {
            warning('Sport mismatch', `Away team sport (${awayTeam.sport}) does not match selected sport (${selectedSport.name})`);
            setIsLoading(false);
            return;
          }
        }
      }

      const finalHomeTeamName = homeTeam?.name || homeTeamName;
      const finalAwayTeamName = awayTeam?.name || awayTeamName;

      const leagueObj = leagues.find((l: any) => l.id === selectedLeague);
      let sportNameFinal = '';
      if (type === 'league') {
        sportNameFinal = leagueObj?.sportName || leagueObj?.name || 'Unknown';
      } else {
        sportNameFinal = sports.find((s: any) => s.id === selectedSportId)?.name || 'Friendly';
      }

      const fixtureData: Omit<Fixture, 'id' | 'correspondentId'> = {
        homeTeamName: finalHomeTeamName,
        awayTeamName: finalAwayTeamName,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        sport: sportNameFinal,
        scheduledAt,
        venue: venue.trim(),
        status: 'scheduled',
        type,
        matchId: type === 'league' ? selectedMatch : undefined,
        leagueId: type === 'league' ? selectedLeague : undefined,
        groupId: type === 'league' ? selectedGroupId : undefined,
        stageId: type === 'league' ? selectedStageId : undefined,
        blogContent: blogContent || undefined,
        seasonId: selectedSeasonId,
      };

      if (fixture) {
        await dispatch(updateFixture({ id: fixture.id, fixture: fixtureData }));
        success('Fixture updated successfully', 'Changes have been saved', 'Add commentary or view match details');
      } else {
        await dispatch(createFixture(fixtureData));
        success('Fixture created successfully', 'The fixture is now scheduled', 'Add more fixtures or manage league');
      }

      onClose();
    } catch (error) {
      console.error('Failed to save fixture:', error);
      showError('Failed to save fixture', 'Please try again or contact support');
    } finally {
      setIsLoading(false);
    }
  };

  const InputError = ({ message }: { message?: string }) => (
    message ? (
      <div className="flex items-center gap-1 mt-1 text-red-500 dark:text-red-400 text-xs animate-in slide-in-from-top-1">
        <FiAlertCircle className="w-3 h-3" />
        <span>{message}</span>
      </div>
    ) : null
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-blue-500" />
              {fixture ? 'Edit Fixture' : 'Create Fixture'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {fixture ? 'Update fixture details' : 'Schedule a new match'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                Fixture Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'league' | 'friendly')}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 dark:text-white font-medium"
              >
                <option value="league">League Match</option>
                <option value="friendly">Friendly Match</option>
              </select>
            </div>

            {type === 'league' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                  Select League <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 dark:text-white font-medium"
                >
                  <option value="">Choose League</option>
                  {leagues.map((l: League) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            )}

            {type === 'friendly' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                  Select Sport <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSportId}
                  onChange={(e) => setSelectedSportId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 dark:text-white font-medium"
                >
                  <option value="">Choose Sport</option>
                  {sports.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
              Select Season <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSeasonId}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 ${errors.season ? 'border-red-300 dark:border-red-600' : 'border-transparent focus:border-unill-purple-500'} dark:text-white font-medium`}
            >
              <option value="">Choose Season</option>
              {seasons.map((s: Season) => (
                <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>
              ))}
            </select>
            <InputError message={errors.season} />
            {seasons.length === 0 && (selectedLeague || selectedSportId) && (
              <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" />
                No seasons found. Create one in Admin Panel.
              </p>
            )}
          </div>

          {type === 'league' && selectedLeague && (
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                Select Match (Optional)
              </label>
              <select
                value={selectedMatch}
                onChange={(e) => setSelectedMatch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 dark:text-white font-medium"
              >
                <option value="">Create new match</option>
                {matches.filter((m: Match) => !fixtures.some((f: Fixture) => f.matchId === m.id) && m.participants && m.participants.length >= 2).map((m: Match) => (
                  <option key={m.id} value={m.id}>
                    Match #{m.matchNumber} - {m.participants.map(p => p.name || p.refId).join(' vs ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                Home Team <span className="text-red-500">*</span>
              </label>
              <select
                value={homeTeamId}
                onChange={(e) => {
                  const team = filteredTeams.find((t: TeamOption) => t.id === e.target.value);
                  setHomeTeamId(e.target.value);
                  setHomeTeamName(team?.name || '');
                  setErrors(prev => ({ ...prev, homeTeam: '', sameTeam: '' }));
                }}
                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 ${errors.homeTeam || errors.sameTeam ? 'border-red-300 dark:border-red-600' : 'border-transparent focus:border-blue-500'} dark:text-white font-medium`}
              >
                <option value="">Select Home Team</option>
                {filteredTeams.map((team: TeamOption) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
                {type === 'league' && homeTeamName && !filteredTeams.some((t: TeamOption) => t.id === homeTeamId) && (
                  <option value={homeTeamId}>{homeTeamName} (Placeholder)</option>
                )}
              </select>
              <InputError message={errors.homeTeam} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                Away Team <span className="text-red-500">*</span>
              </label>
              <select
                value={awayTeamId}
                onChange={(e) => {
                  const team = filteredTeams.find((t: TeamOption) => t.id === e.target.value);
                  setAwayTeamId(e.target.value);
                  setAwayTeamName(team?.name || '');
                  setErrors(prev => ({ ...prev, awayTeam: '', sameTeam: '' }));
                }}
                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 ${errors.awayTeam || errors.sameTeam ? 'border-red-300 dark:border-red-600' : 'border-transparent focus:border-blue-500'} dark:text-white font-medium`}
              >
                <option value="">Select Away Team</option>
                {filteredTeams.filter((t: TeamOption) => t.id !== homeTeamId).map((team: TeamOption) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
                {type === 'league' && awayTeamName && !filteredTeams.some((t: TeamOption) => t.id === awayTeamId) && (
                  <option value={awayTeamId}>{awayTeamName} (Placeholder)</option>
                )}
              </select>
              <InputError message={errors.awayTeam} />
            </div>
          </div>

          {errors.sameTeam && (
            <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm animate-in slide-in-from-top-1">
              <FiAlertCircle className="w-4 h-4" />
              <span>{errors.sameTeam}</span>
            </div>
          )}

          {homeTeamId && awayTeamId && homeTeamId !== awayTeamId && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-green-800 dark:text-green-200">Home</span>
                  <span className="font-bold text-gray-900 dark:text-white">{filteredTeams.find((t: TeamOption) => t.id === homeTeamId)?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiArrowRight className="w-5 h-5 text-green-600" />
                  <span className="font-black text-xl text-green-600">VS</span>
                  <FiArrowRight className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">{filteredTeams.find((t: TeamOption) => t.id === awayTeamId)?.name}</span>
                  <span className="text-sm font-bold text-green-800 dark:text-green-200">Away</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    setErrors(prev => ({ ...prev, date: '' }));
                  }}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 ${errors.date ? 'border-red-300 dark:border-red-600' : 'border-transparent focus:border-blue-500'} dark:text-white font-medium`}
                />
              </div>
              <InputError message={errors.date} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                Venue <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => {
                    setVenue(e.target.value);
                    setErrors(prev => ({ ...prev, venue: '' }));
                  }}
                  placeholder="Stadium name"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 ${errors.venue ? 'border-red-300 dark:border-red-600' : 'border-transparent focus:border-blue-500'} dark:text-white font-medium`}
                />
              </div>
              <InputError message={errors.venue} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
              Blog Content (Optional)
            </label>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-transparent focus-within:border-blue-500">
              <ReactQuill
                value={blogContent}
                onChange={setBlogContent}
                theme="snow"
                className="min-h-[120px]"
                readOnly={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5" />
                  <span>{fixture ? 'Update Fixture' : 'Create Fixture'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};