import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { apiService } from '@/services/apiService';
import { db } from '@/services/firebase';
import { addDoc, collection, updateDoc, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { loadLiveGames, loadUpcomingGames, addLiveGame, addUpcomingGame, updateLiveGame, updateUpcomingGame, deleteLiveGame, deleteUpcomingGame, syncAdminGameCollections } from '@/services/firestoreAdmin';
import { firebaseLeagueService } from '@/services/firebaseCorrespondence';
import { Season } from '@/models';
import ExportButtons from './ExportButtons';

import { Modal } from '@/components/common/Modal';

// Game Form Component
function GameForm({ formData, setFormData, teams, players, sports, onSubmit, submitLabel, leagues, seasons }: any) {
  const [leaguesData, setLeaguesData] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  const currentSport = sports.find((s: any) => s.name.toLowerCase() === formData.sport.toLowerCase());
  const isTeamSport = currentSport?.category === 'team';
  const participants = isTeamSport ? teams : players;

  useEffect(() => {
    if (leagues) setLeaguesData(leagues);
  }, [leagues]);

  useEffect(() => {
    if (formData.selectedLeague) {
      const league = leaguesData.find(l => l.id === formData.selectedLeague);
      setGroups(league?.groups || []);
    } else {
      setGroups([]);
    }
    setStages([]);
    setMatches([]);
  }, [formData.selectedLeague, leaguesData]);

  useEffect(() => {
    if (formData.selectedGroup) {
      const group = groups.find(g => g.id === formData.selectedGroup);
      setStages(group?.stages || []);
    } else {
      setStages([]);
    }
    setMatches([]);
  }, [formData.selectedGroup, groups]);

  useEffect(() => {
    if (formData.selectedStage) {
      const stage = stages.find(s => s.id === formData.selectedStage);
      setMatches(stage?.matches || []);
    } else {
      setMatches([]);
    }
  }, [formData.selectedStage, stages]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Type</label>
          <select
            value={formData.type || 'friendly'}
            onChange={(e) => setFormData({ ...formData, type: e.target.value, sport: e.target.value === 'league' ? '' : formData.sport, selectedLeague: '', selectedGroup: '', selectedStage: '', selectedMatch: '' })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="friendly">Friendly</option>
            <option value="league">League</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Season</label>
          <select
            value={formData.seasonId || ''}
            onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select Season</option>
            {seasons?.map((s: Season) => (
              <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>
            ))}
          </select>
        </div>
        {formData.type === 'league' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Sport</label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value, selectedLeague: '', selectedGroup: '', selectedStage: '', selectedMatch: '' })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Sport</option>
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="volleyball">Volleyball</option>
                <option value="rugby">Rugby</option>
                <option value="hockey">Hockey</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">League</label>
              <select
                value={formData.selectedLeague}
                onChange={(e) => setFormData({ ...formData, selectedLeague: e.target.value, selectedGroup: '', selectedStage: '', selectedMatch: '' })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select League</option>
                {leaguesData.filter((l: any) => l.sportType === 'team' && l.sport === formData.sport).map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Group</label>
              <select
                value={formData.selectedGroup}
                onChange={(e) => setFormData({ ...formData, selectedGroup: e.target.value, selectedStage: '', selectedMatch: '' })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Group</option>
                {groups.map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Stage</label>
              <select
                value={formData.selectedStage}
                onChange={(e) => setFormData({ ...formData, selectedStage: e.target.value, selectedMatch: '' })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Stage</option>
                {stages.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Match</label>
              <select
                value={formData.selectedMatch}
                onChange={(e) => setFormData({ ...formData, selectedMatch: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Match</option>
                {matches.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.participants.map((p: any) => p.name).join(' vs ')}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Sport</label>
            <select
              value={formData.sport}
              onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="volleyball">Volleyball</option>
              <option value="rugby">Rugby</option>
              <option value="hockey">Hockey</option>
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Home Team</label>
          <input
            type="text"
            required
            value={formData.homeTeam}
            onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
            list="participants-list"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Type or select home team"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Away Team</label>
          <input
            type="text"
            required
            value={formData.awayTeam}
            onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
            list="participants-list"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Type or select away team"
          />
        </div>
        <datalist id="participants-list">
          {participants.map((p: any) => (
            <option key={p.id} value={p.name || `${p.firstName} ${p.lastName}`} />
          ))}
        </datalist>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Date</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Time</label>
          <input
            type="time"
            required
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700">Venue</label>
          <input
            type="text"
            required
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      {formData.homeTeam && formData.awayTeam && formData.date && formData.time && formData.venue && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Game Preview</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>{formData.homeTeam}</strong> vs <strong>{formData.awayTeam}</strong><br />
            {formData.sport} • {new Date(formData.date).toLocaleDateString()} at {formData.time}<br />
            Venue: {formData.venue}
          </p>
        </div>
      )}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function ShimmerGameCard() {
  return (
    <div className="p-4 rounded-lg bg-gray-50 border-l-4 border-gray-300 mb-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-5 bg-gray-200 rounded w-48"></div>
        <div className="flex items-center space-x-2">
          <div className="h-6 bg-gray-200 rounded w-12"></div>
          <div className="w-10 h-6 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="flex justify-end space-x-2">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  );
}

// Prediction Form Component
function PredictionForm({ game, onSave }: { game: any; onSave: (data: any) => void }) {
  const [predictions, setPredictions] = useState(game.predictions || { homeWinOdds: 0, drawOdds: 0, awayWinOdds: 0 });
  const [ranking, setRanking] = useState(game.ranking || 0);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave({ predictions, ranking });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h4 className="text-lg font-medium">{game.homeTeamName} vs {game.awayTeamName}</h4>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Home Win Odds</label>
          <input
            type="number"
            step="0.01"
            value={predictions.homeWinOdds}
            onChange={(e) => setPredictions({ ...predictions, homeWinOdds: +e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Draw Odds</label>
          <input
            type="number"
            step="0.01"
            value={predictions.drawOdds}
            onChange={(e) => setPredictions({ ...predictions, drawOdds: +e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Away Win Odds</label>
          <input
            type="number"
            step="0.01"
            value={predictions.awayWinOdds}
            onChange={(e) => setPredictions({ ...predictions, awayWinOdds: +e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Match Ranking</label>
        <input
          type="number"
          value={ranking}
          onChange={(e) => setRanking(+e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </div>
    </form>
  );
}

export default function GamesTab({ updateScore, startG, endG }: any) {
  const { loading: reduxLoading } = useAppSelector(s => s.admin);
  const [live, setLive] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  const [allFixtures, setAllFixtures] = useState<any[]>([]);

  const [selectedFixture, setSelectedFixture] = useState<any>(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;
  const [sportFilter, setSportFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newGame, setNewGame] = useState({
    type: 'friendly',
    sport: 'football',
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    venue: '',
    seasonId: '',
    selectedLeague: '',
    selectedGroup: '',
    selectedStage: '',
    selectedMatch: ''
  });

  const resetNewGame = () => {
    setNewGame({
      type: 'friendly',
      sport: 'football',
      homeTeam: '',
      awayTeam: '',
      date: '',
      time: '',
      venue: '',
      seasonId: '',
      selectedLeague: '',
      selectedGroup: '',
      selectedStage: '',
      selectedMatch: ''
    });
  };

  // Load seasons for a specific sport
  const loadSeasonsForSport = async (sportId: string) => {
    try {
      const seasonsSnap = await getDocs(collection(db, `sports/${sportId}/seasons`));
      const sportSeasons = seasonsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Season));
      setSeasons(sportSeasons);
      // Auto-select active season if none selected
      if (!newGame.seasonId) {
        const active = sportSeasons.find(s => s.isActive);
        if (active) setNewGame({ ...newGame, seasonId: active.id });
      }
    } catch (e) {
      console.error('Failed to load seasons for sport:', e);
      setSeasons([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load teams for dropdowns
        const teamsData = await apiService.getTeams();
        setTeams(teamsData);

        // Load players
        const playersSnap = await getDocs(collection(db, 'players'));
        const playersData = playersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPlayers(playersData);

        // Load sports
        const sportsSnap = await getDocs(collection(db, 'sports'));
        const sportsData = sportsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSports(sportsData);

        // Load leagues
        const leaguesSnap = await getDocs(collection(db, 'leagues'));
        const leaguesData = leaguesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLeagues(leaguesData);

        // Load seasons from all sports
        const allSeasons: Season[] = [];
        for (const sport of sportsData) {
          const seasonsSnap = await getDocs(collection(db, `sports/${sport.id}/seasons`));
          const sportSeasons = seasonsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Season));
          allSeasons.push(...sportSeasons);
        }
        setSeasons(allSeasons);

        // Load fixtures from seasonal paths
        const fixturesData: any[] = [];
        for (const season of allSeasons) {
          const fixturesSnap = await getDocs(collection(db, `fixtures/${season.id}/matches`));
          const seasonFixtures = fixturesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          fixturesData.push(...seasonFixtures);
        }
        // Also check legacy fixtures
        try {
          const legacySnap = await getDocs(collection(db, 'fixtures'));
          const legacyFixtures = legacySnap.docs.filter(d => !d.ref.path.includes('/matches')).map(d => ({ id: d.id, ...d.data() }));
          fixturesData.push(...legacyFixtures);
        } catch (e) {
          // Legacy fixtures collection may not exist
        }
        setAllFixtures(fixturesData);

        // Sync admin collections
        await syncAdminGameCollections();

        // Load admin collections
        const liveData = await loadLiveGames();
        const upcomingData = await loadUpcomingGames();
        setLive(liveData);
        setUpcoming(upcomingData);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLive([]);
        setUpcoming([]);
        setTeams([]);
        setPlayers([]);
        setSports([]);
        setLeagues([]);
        setSeasons([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load seasons when sport changes (for friendly matches) or league changes (for league matches)
  useEffect(() => {
    if (newGame.type === 'friendly' && newGame.sport) {
      // Find sport ID from sport name
      const sport = sports.find(s => s.name.toLowerCase() === newGame.sport.toLowerCase());
      if (sport) {
        loadSeasonsForSport(sport.id);
      }
    } else if (newGame.type === 'league' && newGame.selectedLeague) {
      // Load seasons based on league's sportType
      const league = leagues.find(l => l.id === newGame.selectedLeague);
      if (league) {
        const sport = sports.find(s => s.name.toLowerCase() === league.sportType.toLowerCase());
        if (sport) {
          loadSeasonsForSport(sport.id);
        }
      }
    } else {
      // Clear seasons when switching types without selection
      setSeasons([]);
      setNewGame({ ...newGame, seasonId: '' });
    }
  }, [newGame.type, newGame.sport, newGame.selectedLeague, sports, leagues]);

  const handleAddGame = async () => {
    if (!newGame.homeTeam || !newGame.awayTeam) {
      alert('Please select both home and away teams');
      return;
    }
    if (newGame.homeTeam === newGame.awayTeam) {
      alert('Home and away teams cannot be the same');
      return;
    }
    if (!newGame.seasonId) {
      alert('Please select a season');
      return;
    }
    if (newGame.type === 'league' && !newGame.selectedMatch) {
      alert('Please select a match for league fixtures');
      return;
    }
    try {
      const gameData = {
        ...newGame,
        type: newGame.type,
        matchId: newGame.type === 'league' ? newGame.selectedMatch : undefined,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        scheduledAt: `${newGame.date}T${newGame.time}:00`,
        seasonId: newGame.seasonId
      };
      // Use seasonal path: fixtures/{seasonId}/matches
      const fixtureRef = await addDoc(collection(db, `fixtures/${newGame.seasonId}/matches`), gameData);
      // Ensure ID is inside the object
      await updateDoc(fixtureRef, { id: fixtureRef.id });
      alert('Game added successfully');
      resetNewGame();
      setShowAddModal(false);
      // Reload fixtures from seasonal paths
      const fixturesData: any[] = [];
      for (const season of seasons) {
        const fixturesSnap = await getDocs(collection(db, `fixtures/${season.id}/matches`));
        const seasonFixtures = fixturesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        fixturesData.push(...seasonFixtures);
      }
      setAllFixtures(fixturesData);
      // Sync again
      const liveGamesSnap = await getDocs(collection(doc(db, 'admin'), 'liveGames'));
      const existingLiveIds = liveGamesSnap.docs.map(d => d.data().fixtureId);
      for (const f of fixturesData.filter((f: any) => f.status === 'live' || f.status === 'active')) {
        if (!existingLiveIds.includes(f.id)) {
          await addLiveGame(f);
        }
      }
      const upcomingGamesSnap = await getDocs(collection(doc(db, 'admin'), 'upcomingGames'));
      const existingUpcomingIds = upcomingGamesSnap.docs.map(d => d.data().fixtureId);
      const today = new Date().toDateString();
      for (const f of fixturesData.filter((f: any) => new Date(f.scheduledAt).toDateString() === today && f.status === 'scheduled')) {
        if (!existingUpcomingIds.includes(f.id)) {
          await addUpcomingGame(f);
        }
      }
      const liveData = await loadLiveGames();
      const upcomingData = await loadUpcomingGames();
      setLive(liveData);
      setUpcoming(upcomingData);
    } catch (error) {
      alert('Failed to add game: ' + (error as Error).message);
    }
  };

  const handleEditGame = async () => {
    if (!editingGame.homeTeam || !editingGame.awayTeam) {
      alert('Please select both home and away teams');
      return;
    }
    if (editingGame.homeTeam === editingGame.awayTeam) {
      alert('Home and away teams cannot be the same');
      return;
    }
    if (!editingGame.seasonId) {
      alert('Season ID is required to update game');
      return;
    }
    try {
      const gameData = {
        ...editingGame,
        scheduledAt: `${editingGame.date}T${editingGame.time}:00`
      };
      // Use seasonal path: fixtures/{seasonId}/matches/{fixtureId}
      await updateDoc(doc(db, `fixtures/${editingGame.seasonId}/matches`, editingGame.fixtureId), gameData);
      alert('Game updated successfully');
      setShowEditModal(false);
      setEditingGame(null);
      // Reload fixtures from seasonal paths
      const fixturesData: any[] = [];
      for (const season of seasons) {
        const fixturesSnap = await getDocs(collection(db, `fixtures/${season.id}/matches`));
        const seasonFixtures = fixturesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        fixturesData.push(...seasonFixtures);
      }
      setAllFixtures(fixturesData);
      // Reload
      const liveData = await loadLiveGames();
      const upcomingData = await loadUpcomingGames();
      setLive(liveData);
      setUpcoming(upcomingData);
    } catch (error) {
      alert('Failed to update game: ' + (error as Error).message);
    }
  };

  const handleDeleteGame = async (fixtureId: string, seasonId?: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    try {
      // Use seasonal path: fixtures/{seasonId}/matches/{fixtureId}
      if (seasonId) {
        await deleteDoc(doc(db, `fixtures/${seasonId}/matches`, fixtureId));
      } else {
        // Fallback to legacy path
        await deleteDoc(doc(db, 'fixtures', fixtureId));
      }
      // Also delete from admin collection
      const liveGame = live.find(l => l.fixtureId === fixtureId);
      if (liveGame) {
        await deleteLiveGame(liveGame.id);
      } else {
        const upcomingGame = upcoming.find(u => u.fixtureId === fixtureId);
        if (upcomingGame) {
          await deleteUpcomingGame(upcomingGame.id);
        }
      }
      // Reload fixtures from seasonal paths
      const fixturesData: any[] = [];
      for (const season of seasons) {
        const fixturesSnap = await getDocs(collection(db, `fixtures/${season.id}/matches`));
        const seasonFixtures = fixturesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        fixturesData.push(...seasonFixtures);
      }
      setAllFixtures(fixturesData);
      // Reload
      const liveData = await loadLiveGames();
      const upcomingData = await loadUpcomingGames();
      setLive(liveData);
      setUpcoming(upcomingData);
    } catch (error) {
      alert('Failed to delete game: ' + (error as Error).message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGames.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedGames.size} games?`)) return;
    try {
      const deletePromises = Array.from(selectedGames).map(id => handleDeleteGame(id));
      await Promise.all(deletePromises);
      alert('Games deleted successfully');
      setSelectedGames(new Set());
    } catch (error) {
      alert('Failed to delete games: ' + (error as Error).message);
    }
  };

  const handleSavePredictions = async (data: any) => {
    try {
      if (selectedGame.status === 'live' || selectedGame.status === 'active') {
        await updateLiveGame(selectedGame.id, data);
      } else {
        await updateUpcomingGame(selectedGame.id, data);
      }
      // Reload
      const liveData = await loadLiveGames();
      const upcomingData = await loadUpcomingGames();
      setLive(liveData);
      setUpcoming(upcomingData);
      setShowPredictionModal(false);
      setSelectedGame(null);
    } catch (error) {
      alert('Failed to save predictions: ' + (error as Error).message);
    }
  };

  const handleBulkStart = async () => {
    if (selectedGames.size === 0) return;
    try {
      const startPromises = Array.from(selectedGames).map(id => startG(id));
      await Promise.all(startPromises);
      alert('Games started successfully');
      setSelectedGames(new Set());
    } catch (error) {
      alert('Failed to start games: ' + (error as Error).message);
    }
  };

  const toggleGameSelection = (fixtureId: string) => {
    const newSelected = new Set(selectedGames);
    if (newSelected.has(fixtureId)) {
      newSelected.delete(fixtureId);
    } else {
      newSelected.add(fixtureId);
    }
    setSelectedGames(newSelected);
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const toggleLiveStatus = async (gameId: string, isLive: boolean) => {
    try {
      if (isLive) {
        // End the game
        await endG(gameId);
      } else {
        // Start the game
        await startG(gameId);
      }
    } catch (error) {
      alert('Failed to toggle game status: ' + (error as Error).message);
    }
  };

  // Filter games based on search and filters
  const filteredLive = live.filter((game: any) =>
    ((game.homeTeamName || game.homeTeam || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.awayTeamName || game.awayTeam || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.sport || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!sportFilter || game.sport === sportFilter) &&
    (!statusFilter || game.status === statusFilter)
  );
  const filteredUpcoming = upcoming.filter((game: any) =>
    ((game.homeTeamName || game.homeTeam || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.awayTeamName || game.awayTeam || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.sport || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!sportFilter || game.sport === sportFilter) &&
    (!statusFilter || game.status === statusFilter)
  );

  const hasLiveGames = filteredLive.length > 0;
  const hasUpcomingGames = filteredUpcoming.length > 0;
  const isLoading = reduxLoading.games;

  // Pagination for upcoming games
  const totalPages = Math.ceil(filteredUpcoming.length / gamesPerPage);
  const paginatedUpcoming = filteredUpcoming.slice((currentPage - 1) * gamesPerPage, currentPage * gamesPerPage);

  // Export data
  const allGames = [...filteredLive, ...filteredUpcoming];
  const exportData = allGames.map((game: any) => ({
    homeTeam: game.homeTeamName || game.homeTeam,
    awayTeam: game.awayTeamName || game.awayTeam,
    sport: game.sport,
    status: game.status || 'upcoming',
    score: game.score ? `${game.score.home} - ${game.score.away}` : 'N/A',
    homeGoals: game.stats?.homeGoals ?? 'N/A',
    awayGoals: game.stats?.awayGoals ?? 'N/A',
    homeAssists: game.stats?.homeAssists ?? 'N/A',
    awayAssists: game.stats?.awayAssists ?? 'N/A',
    homePossession: game.stats?.possession?.home ?? 'N/A',
    awayPossession: game.stats?.possession?.away ?? 'N/A',
    homeShots: game.stats?.shots?.home ?? 'N/A',
    awayShots: game.stats?.shots?.away ?? 'N/A',
    venue: game.venue || 'TBD',
    homeWinOdds: game.predictions?.homeWinOdds ?? 'N/A',
    drawOdds: game.predictions?.drawOdds ?? 'N/A',
    awayWinOdds: game.predictions?.awayWinOdds ?? 'N/A',
    ranking: game.ranking ?? 'N/A'
  }));
  const exportHeaders = ['homeTeam', 'awayTeam', 'sport', 'status', 'score', 'homeGoals', 'awayGoals', 'homeAssists', 'awayAssists', 'homePossession', 'awayPossession', 'homeShots', 'awayShots', 'venue', 'homeWinOdds', 'drawOdds', 'awayWinOdds', 'ranking'];

  return (
    <div id="content-games" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Game Schedule</h2><p className="text-gray-600 dark:text-gray-400">Update upcoming and live game information.</p></div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Sports</option>
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="volleyball">Volleyball</option>
            <option value="rugby">Rugby</option>
            <option value="hockey">Hockey</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="live">Live</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
          {selectedGames.size > 0 && (
            <div className="flex space-x-2">
              <button onClick={handleBulkStart} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm">Start Selected ({selectedGames.size})</button>
              <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm">Delete Selected ({selectedGames.size})</button>
            </div>
          )}
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Add New Game</button>
        </div>
      </div>

      {/* Add Game Modal */}
      {showAddModal && (
        <Modal isOpen={showAddModal} title="Add New Game" onClose={() => { setShowAddModal(false); resetNewGame(); }} fullScreen={true}>
          <GameForm
            formData={newGame}
            setFormData={setNewGame}
            teams={teams}
            players={players}
            sports={sports}
            leagues={leagues}
            seasons={seasons}
            onSubmit={handleAddGame}
            submitLabel="Add Game"
          />
        </Modal>
      )}

      {/* Edit Game Modal */}
      {showEditModal && editingGame && (
        <Modal isOpen={showEditModal} title="Edit Game" onClose={() => { setShowEditModal(false); setEditingGame(null); }} fullScreen={true}>
          <GameForm
            formData={editingGame}
            setFormData={setEditingGame}
            teams={teams}
            players={players}
            sports={sports}
            leagues={leagues}
            seasons={seasons}
            onSubmit={handleEditGame}
            submitLabel="Update Game"
          />
        </Modal>
      )}

      {/* Prediction Modal */}
      {showPredictionModal && selectedGame && (
        <Modal isOpen={showPredictionModal} title="Game Predictions & Ranking" onClose={() => { setShowPredictionModal(false); setSelectedGame(null); }} fullScreen={true}>
          <PredictionForm game={selectedGame} onSave={handleSavePredictions} />
        </Modal>
      )}
      {allGames.length > 0 && <ExportButtons data={exportData} headers={exportHeaders} filename="games" />}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Live Games</h3>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : hasLiveGames ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Select</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teams</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sport</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Goals</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assists</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Possession</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Shots</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Predictions</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLive.map((g: any) => (
                    <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedGames.has(g.fixtureId)}
                          onChange={() => toggleGameSelection(g.fixtureId)}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{g.homeTeamName || g.homeTeam} vs {g.awayTeamName || g.awayTeam}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.sport}</td>
                      <td className="px-4 py-2 text-sm text-red-600 dark:text-red-400 font-bold">{g.score?.home ?? 0} - {g.score?.away ?? 0}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.stats?.homeGoals ?? 0} - {g.stats?.awayGoals ?? 0}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.stats?.homeAssists ?? 0} - {g.stats?.awayAssists ?? 0}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.stats?.possession?.home ?? 0}% - {g.stats?.possession?.away ?? 0}%</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.stats?.shots?.home ?? 0} - {g.stats?.shots?.away ?? 0}</td>
                      <td className="px-4 py-2 text-sm">
                        <button onClick={() => { setSelectedGame(g); setShowPredictionModal(true); }} className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700">Predictions</button>
                      </td>
                      <td className="px-4 py-2 text-sm space-x-2">
                        <button onClick={() => { const h = prompt('Home score'); const a = prompt('Away score'); if (h !== null && a !== null) updateScore(g.fixtureId, +h, +a); }} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">Update Score</button>
                        <button onClick={() => endG(g.fixtureId)} className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700">End Game</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">No live games</p>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Games</h3>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : hasUpcomingGames ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Select</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teams</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sport</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Venue</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Predictions</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedUpcoming.map((g: any) => (
                    <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedGames.has(g.fixtureId)}
                          onChange={() => toggleGameSelection(g.fixtureId)}
                          className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{g.homeTeamName || g.homeTeam} vs {g.awayTeamName || g.awayTeam}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.sport}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{new Date(g.scheduledAt).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{g.venue}</td>
                      <td className="px-4 py-2 text-sm">
                        <button onClick={() => { setSelectedGame(g); setShowPredictionModal(true); }} className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700">Predictions</button>
                      </td>
                      <td className="px-4 py-2 text-sm space-x-2">
                        <button onClick={() => startG(g.fixtureId)} className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">Start</button>
                        <button onClick={() => { setEditingGame({ ...g, date: g.scheduledAt.split('T')[0], time: g.scheduledAt.split('T')[1].substring(0, 5) }); setShowEditModal(true); }} className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">Edit</button>
                        <button onClick={() => handleDeleteGame(g.fixtureId, g.seasonId)} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">No upcoming games</p>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}