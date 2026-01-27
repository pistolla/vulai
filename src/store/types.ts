import { AuthState } from './slices/authSlice';
import { CorrespondentState } from './slices/correspondentSlice';
// Add other state types as needed

export type RootState = {
  auth: AuthState;
  correspondent: CorrespondentState;
  // Add other slices here
  admin: any; // placeholder
  users: any;
  merch: any;
  merchDocuments: any;
  review: any;
  games: any;
  team: any;
  fan: any;
  sportTeam: any;
  contact: any;
  leagues: any;
  cart: any;
};

export type AppDispatch = any; // placeholder, will be defined in index.ts