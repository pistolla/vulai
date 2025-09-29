import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FanDashboard } from '@/models';

const initialState: FanDashboard = { myTickets: [], followedTeams: [], newsFeed: [] };

const fanSlice = createSlice({
  name: 'fan',
  initialState,
  reducers: {
    setFanData: (_, action: PayloadAction<FanDashboard>) => action.payload,
    clearFanData: () => initialState,
    followTeam: (s, { payload }: PayloadAction<string>) => {
      if (!s.followedTeams.includes(payload)) s.followedTeams.push(payload);
    },
    unfollowTeam: (s, { payload }: PayloadAction<string>) => {
      s.followedTeams = s.followedTeams.filter((t) => t !== payload);
    },
  },
});

export const { setFanData, clearFanData, followTeam, unfollowTeam } = fanSlice.actions;
export default fanSlice.reducer;
