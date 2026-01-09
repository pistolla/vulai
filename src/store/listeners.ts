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
      // Listen to all fixtures for real-time updates
      const unsubAll = onSnapshot(collection(db, 'fixtures'), snap => {
        try {
          const allFixtures = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          const live = allFixtures.filter(f => f.status === 'live');
          const upcoming = allFixtures.filter(f => f.status === 'scheduled');
          listenerApi.dispatch(setGames({ live, upcoming }));
        } catch (error) {
          console.error('Error processing fixtures snapshot:', error);
        }
      }, error => {
        console.error('Fixtures listener error:', error);
      });

      // Store unsubscribe function if needed, but for now, let it persist
    } catch (error) {
      console.error('Failed to set up fixtures listener:', error);
    }

    // Auth listener is now handled in _app.tsx to ensure it runs on app start
    // This prevents duplicate listeners and ensures proper initialization
  },
});



