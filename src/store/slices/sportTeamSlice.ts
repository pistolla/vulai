import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SportTeamDashboard } from '@/models';

const initialState: SportTeamDashboard = { myTeam: null, athletes: [], fixtures: [] };

const sportTeamSlice = createSlice({
  name: 'sportTeam',
  initialState,
  reducers: {
    setSportTeamData: (_, action: PayloadAction<SportTeamDashboard>) => action.payload,
    clearSportTeamData: () => initialState,
  },
});

export const { setSportTeamData, clearSportTeamData } = sportTeamSlice.actions;
export default sportTeamSlice.reducer;
