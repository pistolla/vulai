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
  predicate: () => true, // runs once
  effect: async (_, listenerApi) => {
    try {
      const q = query(collection(db,'fixtures'), where('status','==','live'));
      const unsubLive = onSnapshot(q, snap => {
        const live = snap.docs.map(d => ({id:d.id,...d.data()} as any));
        listenerApi.dispatch(setGames({ live, upcoming:[] })); // merge in component
      });
    } catch (error) {
      console.error('Failed to set up live fixtures listener:', error);
    }

    subscribeAuth(async (user) => {
      try {
        listenerApi.dispatch(setUser(user));

        /* clear previous role data */
        listenerApi.dispatch(clearAdminData());
        listenerApi.dispatch(clearCorrespondentData());
        listenerApi.dispatch(clearFanData());
        listenerApi.dispatch(clearSportTeamData());

        if (!user) return;

        /* load role-specific slice */
        switch (user.role) {
          case 'admin': {
            try {
              const data = await loadAdminData();
              listenerApi.dispatch(setAdminData(data));
            } catch (error) {
              console.error('Failed to load admin data:', error);
            }
            break;
          }
          case 'correspondent':
              try {
                const unsub = onSnapshot(doc(db,'liveCommentary',/*fixtureId*/), (snap)=>{
                    if(snap.exists()){
                        listenerApi.dispatch(setActiveCommentary(snap.data() as LiveCommentary));
                    }
                });
                /* store unsub if you need to clean it later */
              } catch (error) {
                console.error('Failed to set up live commentary listener:', error);
              }
              break;
          case 'fan': {
            try {
              const data = await loadFanData(user.uid);
              listenerApi.dispatch(setFanData(data));
            } catch (error) {
              console.error('Failed to load fan data:', error);
            }
            break;
          }
          case 'sport-team': {
            if (!user.teamId) break;
            try {
              const data = await loadSportTeamData(user.teamId);
              listenerApi.dispatch(setSportTeamData(data));
            } catch (error) {
              console.error('Failed to load sport team data:', error);
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  },
});



