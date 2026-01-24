import { createAsyncThunk } from '@reduxjs/toolkit';
import { University, Team, Sport, ImportedData } from '@/models';
import {
  loadAdminDashboard, loadUsers, approveUser, disapproveUser, deleteUserDoc,
  loadMerch, addMerch, updateMerch, deleteMerch,
  loadReviews, approveReview, rejectReview,
  loadGames, updateFixtureScore, startGame, endGame,
  loadUniversities, addUniversity, updateUniversity, deleteUniversity,
  loadTeams, addTeam, updateTeam, deleteTeam,
  addPlayerToTeam, updatePlayerInTeam, deletePlayerFromTeam,
  loadPlayers, addPlayer, updatePlayer, deletePlayer,
  addPlayerHighlight, updatePlayerHighlight, deletePlayerHighlight,
  loadPlayerAvatars, addPlayerAvatar, updatePlayerAvatar, deletePlayerAvatar,
  loadSports, addSport, updateSport, deleteSport,
  loadImportedData, processImportedData, saveProcessedDocument,
  addSeasonToSport, loadSeasons
} from '@/services/firestoreAdmin';
import { Season } from '@/models';

/* ---------- dashboard ---------- */
export const fetchDashboard = createAsyncThunk('admin/fetchDashboard', loadAdminDashboard);

/* ---------- users ---------- */
export const fetchUsers = createAsyncThunk('users/fetch', loadUsers);
export const approveUserT = createAsyncThunk('users/approve', approveUser);
export const disapproveUserT = createAsyncThunk('users/disapprove', disapproveUser);
export const deleteUserT = createAsyncThunk('users/delete', deleteUserDoc);

/* ---------- merchandise ---------- */
export const fetchMerch = createAsyncThunk('merch/fetch', loadMerch);
export const createMerchT = createAsyncThunk('merch/create', addMerch);
export const saveMerchT = createAsyncThunk('merch/save', ({ id, data }: { id: string; data: Partial<any> }) => updateMerch(id, data));
export const removeMerchT = createAsyncThunk('merch/delete', deleteMerch);

/* ---------- reviews ---------- */
export const fetchReviews = createAsyncThunk('review/fetch', loadReviews);
export const approveReviewT = createAsyncThunk('review/approve', approveReview);
export const rejectReviewT = createAsyncThunk('review/reject', rejectReview);

/* ---------- universities ---------- */
export const fetchUniversities = createAsyncThunk('universities/fetch', loadUniversities);
export const createUniversityT = createAsyncThunk('universities/create', addUniversity);
export const saveUniversityT = createAsyncThunk('universities/save', ({ id, data }: { id: string; data: Partial<University> }) => updateUniversity(id, data));
export const removeUniversityT = createAsyncThunk('universities/delete', deleteUniversity);

/* ---------- teams ---------- */
export const fetchTeams = createAsyncThunk('teams/fetch', loadTeams);
export const createTeamT = createAsyncThunk('teams/create', addTeam);
export const saveTeamT = createAsyncThunk('teams/save', ({ id, data }: { id: string; data: Partial<Team> }) => updateTeam(id, data));
export const removeTeamT = createAsyncThunk('teams/delete', deleteTeam);
export const addPlayerToTeamT = createAsyncThunk('teams/addPlayer', ({ teamId, player }: { teamId: string; player: any }) => addPlayerToTeam(teamId, player));
export const updatePlayerInTeamT = createAsyncThunk('teams/updatePlayer', ({ teamId, playerId, playerData }: { teamId: string; playerId: string; playerData: any }) => updatePlayerInTeam(teamId, playerId, playerData));
export const deletePlayerFromTeamT = createAsyncThunk('teams/deletePlayer', ({ teamId, playerId }: { teamId: string; playerId: string }) => deletePlayerFromTeam(teamId, playerId));

/* ---------- games ---------- */
export const fetchGames = createAsyncThunk('games/fetch', loadGames);
export const updateScoreT = createAsyncThunk('games/score', ({ id, home, away }: { id: string; home: number; away: number }) => updateFixtureScore(id, home, away));
export const startGameT = createAsyncThunk('games/start', startGame);
export const endGameT = createAsyncThunk('games/end', endGame);

/* ---------- players ---------- */
export const fetchPlayers = createAsyncThunk('players/fetch', loadPlayers);
export const createPlayerT = createAsyncThunk('players/create', addPlayer);
export const savePlayerT = createAsyncThunk('players/save', ({ id, data }: { id: string; data: any }) => updatePlayer(id, data));
export const removePlayerT = createAsyncThunk('players/delete', deletePlayer);
export const addPlayerHighlightT = createAsyncThunk('players/addHighlight', ({ playerId, highlight }: { playerId: string; highlight: any }) => addPlayerHighlight(playerId, highlight));
export const savePlayerHighlightT = createAsyncThunk('players/saveHighlight', ({ playerId, highlightId, highlightData }: { playerId: string; highlightId: string; highlightData: any }) => updatePlayerHighlight(playerId, highlightId, highlightData));
export const removePlayerHighlightT = createAsyncThunk('players/removeHighlight', ({ playerId, highlightId }: { playerId: string; highlightId: string }) => deletePlayerHighlight(playerId, highlightId));

/* ---------- player avatars ---------- */
export const fetchPlayerAvatars = createAsyncThunk('playerAvatars/fetch', loadPlayerAvatars);
export const createPlayerAvatarT = createAsyncThunk('playerAvatars/create', addPlayerAvatar);
export const savePlayerAvatarT = createAsyncThunk('playerAvatars/save', ({ id, data }: { id: string; data: Partial<any> }) => updatePlayerAvatar(id, data));
export const removePlayerAvatarT = createAsyncThunk('playerAvatars/delete', deletePlayerAvatar);

/* ---------- sports ---------- */
export const fetchSports = createAsyncThunk('sports/fetch', loadSports);
export const createSportT = createAsyncThunk('sports/create', addSport);
export const saveSportT = createAsyncThunk('sports/save', ({ id, data }: { id: string; data: Partial<Sport> }) => updateSport(id, data));
export const removeSportT = createAsyncThunk('sports/delete', deleteSport);

export const fetchSeasons = createAsyncThunk('seasons/fetch', async (sportId: string) => loadSeasons(sportId));
export const createSeasonT = createAsyncThunk('seasons/create', async ({ sportId, season }: { sportId: string; season: Omit<Season, 'id'> }) => {
  const res = await addSeasonToSport(sportId, season);
  return { id: res.id, ...season };
});

/* ---------- imported data ---------- */
export const fetchImportedData = createAsyncThunk('importedData/fetch', loadImportedData);
export const processImportedDataT = createAsyncThunk('importedData/process', processImportedData);
export const saveProcessedDocumentT = createAsyncThunk('processedDocuments/save', saveProcessedDocument);
