import { createListenerMiddleware } from '@reduxjs/toolkit';
import { subscribeAuth } from '@/services/firebase';
import { setUser } from './slices/authSlice';
import { setAdminData, clearAdminData } from './slices/adminSlice';
import { setCorrespondentData, clearCorrespondentData, setActiveCommentary } from './slices/correspondentSlice';
import { setFanData, clearFanData } from './slices/fanSlice';
import { setSportTeamData, clearSportTeamData } from './slices/sportTeamSlice';
import { loadAdminData, loadCorrespondentData, loadFanData, loadSportTeamData } from '@/services/firestore';
import { onSnapshot, collection, query, where, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { setGames, updateFixture } from '@/store/slices/gamesSlice';
import { LiveCommentary } from '@/models';

export const listenerMiddleware = createListenerMiddleware();

/* central auth -> role hydrator */
listenerMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    // Only run when auth state changes
    return (currentState as any).auth.user !== (previousState as any).auth.user;
  },
  effect: async (_, listenerApi) => {
    try {
      const q = query(collection(db,'fixtures'), where('status','==','live'));
      const unsubLive = onSnapshot(q, snap => {
        try {
          const live = snap.docs.map(d => ({id:d.id,...d.data()} as any));
          listenerApi.dispatch(setGames({ live, upcoming:[] })); // merge in component
        } catch (error) {
          console.error('Error processing live fixtures snapshot:', error);
        }
      }, error => {
        console.error('Live fixtures listener error:', error);
      });
    } catch (error) {
      console.error('Failed to set up live fixtures listener:', error);
    }

    // Auth listener is now handled in _app.tsx to ensure it runs on app start
    // This prevents duplicate listeners and ensures proper initialization
  },
});



