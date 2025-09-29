import { createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '@/services/firebase';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { RootState } from '.';

export const fetchFanData = createAsyncThunk('fan/fetch', async (uid: string) => {
  /* dummy – merge with real fan sub-collections */
  return { merch: [], followedTeams: [], myTickets: [], newsFeed: [] };
});

export const followTeam = createAsyncThunk('fan/follow', async (teamId: string, { getState }) => {
  const uid = (getState() as RootState).auth.user!.uid;
  await setDoc(doc(db, 'fans', uid, 'followedTeams', teamId), { followedAt: serverTimestamp() }, { merge: true });
  return teamId;
});

export const buyTicket = createAsyncThunk(
  'fan/buyTicket',
  async ({ fixtureId, seat, price }: { fixtureId: string; seat: string; price: number }, { getState }) => {
    const uid = (getState() as RootState).auth.user!.uid;
    const ref = doc(collection(db, 'tickets'));
    const ticket = { id: ref.id, fixtureId, fanId: uid, seat, price, purchasedAt: serverTimestamp() };
    await setDoc(ref, ticket);
    return ticket;
  }
);