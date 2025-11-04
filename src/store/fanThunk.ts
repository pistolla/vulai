import { createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '@/services/firebase';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { RootState } from '.';

export const fetchFanData = createAsyncThunk('fan/fetch', async (uid: string) => {
  try {
    // Fetch followed teams
    const followedTeamsSnap = await getDocs(collection(db, 'fans', uid, 'followedTeams'));
    const followedTeams = followedTeamsSnap.docs.map(doc => doc.id);

    // Fetch tickets
    const ticketsSnap = await getDocs(query(collection(db, 'tickets'), where('fanId', '==', uid)));
    const myTickets = ticketsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch news feed (placeholder - implement based on followed teams)
    const newsFeed: any[] = [];

    return {
      followedTeams,
      myTickets,
      newsFeed,
      merch: [] // Keep empty for now, can be populated from global merch state
    };
  } catch (error) {
    console.error('Error fetching fan data:', error);
    // Return empty data on error to prevent app crash
    return { merch: [], followedTeams: [], myTickets: [], newsFeed: [] };
  }
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