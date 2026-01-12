import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import adminSlice from './slices/adminSlice';
import correspondentSlice from './slices/correspondentSlice';
import fanSlice from './slices/fanSlice';
import sportTeamSlice from './slices/sportTeamSlice';
import usersSlice     from './slices/usersSlice';
import merchSlice     from './slices/merchSlice';
import merchDocumentsSlice from './slices/merchDocumentsSlice';
import reviewSlice    from './slices/reviewSlice';
import gamesSlice     from './slices/gamesSlice';
import teamSlice from './slices/teamSlice';
import contactSlice from './slices/contactSlice';
import { listenerMiddleware } from './listeners';
import leaguesSlice from './slices/leagueSlice';

export const store = configureStore({
  reducer: {
    auth:    authSlice,
    admin:   adminSlice,
    users:   usersSlice,
    merch:   merchSlice,
    merchDocuments: merchDocumentsSlice,
    review:  reviewSlice,
    games:   gamesSlice,
    team: teamSlice,
    correspondent: correspondentSlice,
    fan: fanSlice,
    sportTeam: sportTeamSlice,
    contact: contactSlice,
    leagues: leaguesSlice
  },
  middleware: (gDM) => gDM({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      ignoredPaths: ['persist'],
    },
    immutableCheck: false,
  }).prepend(listenerMiddleware.middleware),
});

export type AppDispatch = typeof store.dispatch;

export type { RootState } from './types';
