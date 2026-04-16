import { Fixture, League, Match, Team, Season } from "@/models";
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { fetchLeagues, fetchFixtures, createFixture, updateFixture } from "@/store/correspondentThunk";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { apiService } from "@/services/apiService";
import { db } from "@/services/firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import dynamic from 'next/dynamic';
import { useToast } from "@/components/common/ToastProvider";
import { FiCalendar, FiMapPin, FiUsers, FiCheckCircle, FiAlertCircle, FiArrowRight, FiX, FiPlus } from 'react-icons/fi';

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

interface PlayerOption {
  id: string;
  name: string;
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
  
  // NEW: Multi-participant state
  const [participants, setParticipants] = useState<any[]>(
    fixture?.participants || 
    match?.participants || 
    [
      { refType: 'team', refId: '', name: '', score: 0 },
      { refType: 'team', refId: '', name: '', score: 0 }
    ]
  );
  
  const [scheduledAt, setScheduledAt] = useState(fixture?.scheduledAt || match?.date || '');
  const [venue, setVenue] = useState(fixture?.venue || match?.venue || '');
  const [blogContent, setBlogContent] = useState(fixture?.blogContent || '');
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamOption[]>([]);
  const [players, setPlayers] = useState<PlayerOption[]>([]);
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
    loadPlayers();
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

  const loadPlayers = async () => {
    try {
      const allPlayers = await apiService.getPlayers();
      setPlayers(allPlayers.map((p: any) => ({
        id: p.id || p.uid,
        name: p.name || `${p.firstName} ${p.lastName}`
      })));
    } catch (e) {
      console.error('Failed to load players:', e);
    }
  };

  const addParticipant = () => {
    setParticipants([...participants, { refType: 'team', refId: '', name: '', score: 0 }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, data: any) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], ...data };
    
    // Auto-update name if refId changed
    if (data.refId) {
      if (updated[index].refType === 'team') {
        const team = teams.find(t => t.id === data.refId);
        if (team) updated[index].name = team.name;
      } else {
        const player = players.find(p => p.id === data.refId);
        if (player) updated[index].name = player.name;
      }
    }
    
    setParticipants(updated);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeague, sports.length, leagues.length, type]);

  useEffect(() => {
    // Only run for friendly type
    if (type !== 'friendly') return;
    
    if (selectedSportId) {
      loadSeasonsForSport(selectedSportId);
      filterTeamsBySport(selectedSportId);
    } else {
      setFilteredTeams(teams);
      setSeasons([]);
      setSelectedSeasonId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (match && match.participants && match.participants.length >= 2) {
        
        // Sync participants from match to fixture
        setParticipants(match.participants.map(p => ({
          ...p,
          score: p.score || 0
        })));
        
        if (match.seasonId) setSelectedSeasonId(match.seasonId);
        if (match.groupId) setSelectedGroupId(match.groupId);
        if (match.stageId) setSelectedStageId(match.stageId);
        if (match.date) setScheduledAt(match.date);
        if (match.venue) setVenue(match.venue);
      }
    }
  }, [selectedMatch, matches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    const newErrors: Record<string, string> = {};
    if (!selectedSeasonId) newErrors.season = 'Season is required';
    if (participants.length < 1) newErrors.participants = 'At least one participant is required';
    if (participants.some(p => !p.refId)) newErrors.participants = 'All participants must be selected';
    if (!scheduledAt) newErrors.date = 'Date and time is required';
    if (!venue.trim()) newErrors.venue = 'Venue is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      warning('Please fill in all required fields', 'Check the highlighted fields below');
      return;
    }
    
    setIsLoading(true);

    try {
      const p1 = participants[0];
      const p2 = participants[1];

      const leagueObj = leagues.find((l: any) => l.id === selectedLeague);
      let sportNameFinal = '';
      if (type === 'league') {
        sportNameFinal = leagueObj?.sportName || leagueObj?.name || 'Unknown';
      } else {
        sportNameFinal = sports.find((s: any) => s.id === selectedSportId)?.name || 'Friendly';
      }

      const fixtureData: Omit<Fixture, 'id' | 'correspondentId'> = {
        participants,
        // Legacy fallbacks for compatibility
        homeTeamName: p1?.name || '',
        awayTeamName: p2?.name || '',
        homeTeamId: p1?.refId || '',
        awayTeamId: p2?.refId || '',
        
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
        players: fixture?.players || []
      };

      if (fixture) {
        await dispatch(updateFixture({ id: fixture.id, fixture: fixtureData }));
        success('Fixture updated successfully', 'Changes have been saved');
      } else {
        await dispatch(createFixture(fixtureData));
        success('Fixture created successfully', 'The fixture is now scheduled');
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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">
                Participants <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addParticipant}
                className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline"
              >
                <FiPlus className="w-3 h-3" /> Add Competitor
              </button>
            </div>

            <div className="space-y-3">
              {participants.map((p, index) => (
                <div key={index} className="flex gap-2 items-start animate-in slide-in-from-left-2 duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="w-24">
                    <select
                      value={p.refType}
                      onChange={(e) => updateParticipant(index, { refType: e.target.value as any, refId: '', name: '' })}
                      className="w-full px-2 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 dark:text-white text-[10px] font-black uppercase tracking-tighter"
                    >
                      <option value="team">Team</option>
                      <option value="individual">Player</option>
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <select
                      value={p.refId}
                      onChange={(e) => updateParticipant(index, { refId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 dark:text-white font-medium text-sm"
                    >
                      <option value="">Select {p.refType === 'team' ? 'Team' : 'Player'}</option>
                      {p.refType === 'team' ? (
                        filteredTeams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))
                      ) : (
                        players.map(pl => (
                          <option key={pl.id} value={pl.id}>{pl.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    disabled={participants.length <= 1}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-400 hover:text-red-500 transition-all disabled:opacity-30"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <InputError message={errors.participants} />
          </div>

          {participants.length >= 2 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {participants.map((p, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">{p.refType} {i + 1}</span>
                      <span className="font-bold text-gray-900 dark:text-white text-center px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm">{p.name || '???'}</span>
                    </div>
                    {i < participants.length - 1 && (
                      <div className="flex items-center">
                        <span className="font-black text-lg text-blue-300 dark:text-blue-700 italic">VS</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
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