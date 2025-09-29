import { createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '@/services/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp, collection } from 'firebase/firestore';
import { News, Team, Ticket } from '@/models';
import { RootState } from './index';

/* ---------- correspondent ---------- */
export const publishArticle = createAsyncThunk(
  'correspondent/publish',
  async (article: Omit<News, 'id' | 'publishedAt'>, { getState }) => {
    const state = getState() as RootState;
    const authorId = state.auth.user!.uid;
    const ref = doc(db, 'news', doc(collection(db, '_')).id);
    const payload = { ...article, id: ref.id, authorId, publishedAt: serverTimestamp() };
    await setDoc(ref, payload);
    return payload as unknown as News;
  }
);

/* ---------- fan ---------- */
export const buyTicket = createAsyncThunk(
  'fan/buyTicket',
  async (dto: { fixtureId: string; seat: string; price: number }, { getState }) => {
    const state = getState() as RootState;
    const fanId = state.auth.user!.uid;
    const ref = doc(db, 'tickets', doc(collection(db, '_')).id);
    const ticket: Ticket = {
      id: ref.id,
      fixtureId: dto.fixtureId,
      fanId,
      seat: dto.seat,
      price: dto.price,
      purchasedAt: new Date().toISOString(),
    };
    await setDoc(ref, ticket);
    return ticket;
  }
);

/* ---------- admin ---------- */
export const createTeam = createAsyncThunk(
  'admin/createTeam',
  async (team: Omit<Team, 'id'>, { getState }) => {
    const ref = doc(db, 'teams', doc(collection(db, '_')).id);
    const payload = { ...team, id: ref.id };
    await setDoc(ref, payload);
    return payload;
  }
);

