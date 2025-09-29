import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { University, Team, Fixture } from '@/models';

interface AdminState {
  universities: University[];
  teams: Team[];
  fixtures: Fixture[];
  stats: { users: number; liveGames: number; merchSales: number; pendingReviews: number };
}

const initialState: AdminState = {
  universities: [],
  teams: [],
  fixtures: [],
  stats: { users: 0, liveGames: 0, merchSales: 0, pendingReviews: 0 },
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    /* ADD THESE TWO LINES */
    setAdminData: (state, action: PayloadAction<Partial<AdminState>>) => {
      Object.assign(state, action.payload);
    },
    clearAdminData: () => initialState,
  },
});

export const { setAdminData, clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;