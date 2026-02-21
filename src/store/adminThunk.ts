import { createAsyncThunk } from '@reduxjs/toolkit';
import { University, Team, Sport, ImportedData } from '@/models';
import {
  loadAdminDashboard, loadUsers, approveUser, disapproveUser, deleteUserDoc,
  loadMerch, addMerch, updateMerch, deleteMerch,
  loadOrders, updateOrderStatus,
  loadContactMessages, updateContactMessageStatus,
  loadReviews, approveReview, rejectReview,
  loadGames, updateFixtureScore, startGame, endGame,
  loadUniversities, addUniversity, updateUniversity, deleteUniversity,
  loadTeams, addTeam, updateTeam, deleteTeam,
  addPlayerToSquad, removePlayerFromSquad, getTeamSquads, movePlayerBetweenSquads,
  loadPlayers, addPlayer, updatePlayer, deletePlayer,
  addPlayerHighlight, updatePlayerHighlight, deletePlayerHighlight,
  loadPlayerAvatars, addPlayerAvatar, updatePlayerAvatar, deletePlayerAvatar,
  loadSports, addSport, updateSport, deleteSport,
  loadImportedData, processImportedData, saveProcessedDocument,
  addSeasonToSport, loadSeasons, updateSeason, deleteSeason,
  loadAllBookkeepingDocs
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

/* ---------- orders ---------- */
export const fetchOrders = createAsyncThunk('orders/fetch', loadOrders);
export const updateOrderStatusT = createAsyncThunk('orders/updateStatus', ({ orderId, status }: { orderId: string; status: string }) =>
  updateOrderStatus(orderId, status)
);

/* ---------- contact messages ---------- */
export const fetchContactMessages = createAsyncThunk('contactMessages/fetch', loadContactMessages);
export const updateContactMessageStatusT = createAsyncThunk('contactMessages/updateStatus', ({ messageId, status }: { messageId: string; status: string }) =>
  updateContactMessageStatus(messageId, status)
);

/* ---------- reviews ---------- */
export const fetchReviews = createAsyncThunk('review/fetch', loadReviews);
export const approveReviewT = createAsyncThunk('review/approve', approveReview);
export const rejectReviewT = createAsyncThunk('review/reject', rejectReview);

/* ---------- universities ---------- */
export const fetchUniversities = createAsyncThunk('universities/fetch', loadUniversities);
export const createUniversityT = createAsyncThunk('universities/create', addUniversity);
export const saveUniversityT = createAsyncThunk('universities/save', async ({ id, data }: { id: string; data: Partial<University> }) => {
  await updateUniversity(id, data);
  return { id, ...data };
});
export const removeUniversityT = createAsyncThunk('universities/delete', async (id: string) => {
  await deleteUniversity(id);
  return id;
});

/* ---------- teams ---------- */
export const fetchTeams = createAsyncThunk('teams/fetch', loadTeams);
export const createTeamT = createAsyncThunk('teams/create', addTeam);
export const saveTeamT = createAsyncThunk('teams/save', async ({ id, data }: { id: string; data: Partial<Team> }) => {
  await updateTeam(id, data);
  return { id, ...data };
});
export const removeTeamT = createAsyncThunk('teams/delete', async (id: string) => {
  await deleteTeam(id);
  return id;
});

/* ---------- team squad subcollections (current_squad, bench_squad, retired_squad, current_formation) ---------- */
export const addPlayerToSquadT = createAsyncThunk('teams/addPlayerToSquad',
  ({ teamId, playerId, squadType, addedBy, notes }: { teamId: string; playerId: string; squadType: string; addedBy?: string; notes?: string }) =>
    addPlayerToSquad(teamId, playerId, squadType as any, addedBy, notes)
);
export const removePlayerFromSquadT = createAsyncThunk('teams/removePlayerFromSquad',
  ({ teamId, playerId, squadType }: { teamId: string; playerId: string; squadType: string }) =>
    removePlayerFromSquad(teamId, playerId, squadType as any)
);
export const fetchTeamSquadsT = createAsyncThunk('teams/fetchSquads', getTeamSquads);
export const movePlayerBetweenSquadsT = createAsyncThunk('teams/movePlayer',
  ({ teamId, playerId, fromSquad, toSquad, addedBy }: { teamId: string; playerId: string; fromSquad: string; toSquad: string; addedBy?: string }) =>
    movePlayerBetweenSquads(teamId, playerId, fromSquad as any, toSquad as any, addedBy)
);

/* ---------- players - stored in root 'players' collection ---------- */

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
export const saveSportT = createAsyncThunk('sports/save', async ({ id, data }: { id: string; data: Partial<Sport> }) => {
  await updateSport(id, data);
  return { id, ...data };
});
export const removeSportT = createAsyncThunk('sports/delete', async (id: string) => {
  await deleteSport(id);
  return id;
});

export const fetchSeasons = createAsyncThunk('seasons/fetch', async (sportId: string) => loadSeasons(sportId));
export const createSeasonT = createAsyncThunk('seasons/create', async ({ sportId, season }: { sportId: string; season: Omit<Season, 'id'> }) => {
  const res = await addSeasonToSport(sportId, season);
  return { id: res.id, ...season };
});
export const updateSeasonT = createAsyncThunk('seasons/update', async ({ sportId, seasonId, data }: { sportId: string; seasonId: string; data: Partial<Season> }) => {
  await updateSeason(sportId, seasonId, data);
  return { id: seasonId, ...data };
});
export const removeSeasonT = createAsyncThunk('seasons/delete', async ({ sportId, seasonId }: { sportId: string; seasonId: string }) => {
  await deleteSeason(sportId, seasonId);
  return seasonId;
});

/* ---------- imported data ---------- */
export const fetchImportedData = createAsyncThunk('importedData/fetch', loadImportedData);
export const processImportedDataT = createAsyncThunk('importedData/process', processImportedData);
export const saveProcessedDocumentT = createAsyncThunk('processedDocuments/save', saveProcessedDocument);

/* ---------- financial / balance sheet ---------- */
export const fetchFinancialOverview = createAsyncThunk(
  'admin/fetchFinancialOverview',
  async () => {
    const docs = await loadAllBookkeepingDocs();
    return docs;
  }
);
