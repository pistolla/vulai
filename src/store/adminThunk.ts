import { createAsyncThunk } from '@reduxjs/toolkit';
import { University } from '@/models';
import {
  loadAdminDashboard, loadUsers, approveUser, deleteUserDoc,
  loadMerch, addMerch, updateMerch, deleteMerch,
  loadReviews, approveReview, rejectReview,
  loadGames, updateFixtureScore, startGame, endGame,
  loadUniversities, addUniversity, updateUniversity, deleteUniversity,
} from '@/services/firestoreAdmin';

/* ---------- dashboard ---------- */
export const fetchDashboard = createAsyncThunk('admin/fetchDashboard', loadAdminDashboard);

/* ---------- users ---------- */
export const fetchUsers     = createAsyncThunk('users/fetch', loadUsers);
export const approveUserT   = createAsyncThunk('users/approve', approveUser);
export const deleteUserT    = createAsyncThunk('users/delete', deleteUserDoc);

/* ---------- merchandise ---------- */
export const fetchMerch     = createAsyncThunk('merch/fetch', loadMerch);
export const createMerchT   = createAsyncThunk('merch/create', addMerch);
export const saveMerchT     = createAsyncThunk('merch/save', ({ id, data }: { id: string; data: Partial<any> }) => updateMerch(id, data));
export const removeMerchT   = createAsyncThunk('merch/delete', deleteMerch);

/* ---------- reviews ---------- */
export const fetchReviews   = createAsyncThunk('review/fetch', loadReviews);
export const approveReviewT = createAsyncThunk('review/approve', approveReview);
export const rejectReviewT  = createAsyncThunk('review/reject',  rejectReview);

/* ---------- universities ---------- */
export const fetchUniversities = createAsyncThunk('universities/fetch', loadUniversities);
export const createUniversityT = createAsyncThunk('universities/create', addUniversity);
export const saveUniversityT   = createAsyncThunk('universities/save', ({ id, data }: { id: string; data: Partial<University> }) => updateUniversity(id, data));
export const removeUniversityT = createAsyncThunk('universities/delete', deleteUniversity);

/* ---------- games ---------- */
export const fetchGames     = createAsyncThunk('games/fetch', loadGames);
export const updateScoreT   = createAsyncThunk('games/score', ({ id, home, away }: { id: string; home: number; away: number }) => updateFixtureScore(id, home, away));
export const startGameT     = createAsyncThunk('games/start',  startGame);
export const endGameT       = createAsyncThunk('games/end',    endGame);
