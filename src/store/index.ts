import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import adminSlice from './slices/adminSlice';
import correspondentSlice from './slices/correspondentSlice';
import fanSlice from './slices/fanSlice';
import sportTeamSlice from './slices/sportTeamSlice';
import usersSlice     from './slices/usersSlice';
import merchSlice     from './slices/merchSlice';
import reviewSlice    from './slices/reviewSlice';
import gamesSlice     from './slices/gamesSlice';
import teamSlice from './slices/teamSlice';
import contactSlice from './slices/contactSlice';
import { listenerMiddleware } from './listeners';

export const store = configureStore({
  reducer: {
    auth:    authSlice,
    admin:   adminSlice,
    users:   usersSlice,
    merch:   merchSlice,
    review:  reviewSlice,
    games:   gamesSlice,
    team: teamSlice,
    correspondent: correspondentSlice,
    fan: fanSlice,
    sportTeam: sportTeamSlice,
    contact: contactSlice
  },
  middleware: (gDM) => gDM({
    serializableCheck: false,
    immutableCheck: false,
  }).prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
