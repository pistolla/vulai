import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FanDashboard, Ticket } from '@/models';
import { fetchFanData, followTeam as followTeamThunk, buyTicket } from '../fanThunk';

const initialState: FanDashboard = { myTickets: [], followedTeams: [], newsFeed: [] };

const fanSlice = createSlice({
  name: 'fan',
  initialState,
  reducers: {
    setFanData: (_, action: PayloadAction<FanDashboard>) => action.payload,
    clearFanData: () => initialState,
    followTeamLocal: (s, { payload }: PayloadAction<string>) => {
      if (!s.followedTeams.includes(payload)) s.followedTeams.push(payload);
    },
    unfollowTeam: (s, { payload }: PayloadAction<string>) => {
      s.followedTeams = s.followedTeams.filter((t) => t !== payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFanData.fulfilled, (state, action) => {
        state.followedTeams = action.payload.followedTeams;
        state.myTickets = action.payload.myTickets as Ticket[];
        state.newsFeed = action.payload.newsFeed;
      })
      .addCase(followTeamThunk.fulfilled, (state, action) => {
        if (!state.followedTeams.includes(action.payload)) {
          state.followedTeams.push(action.payload);
        }
      })
      .addCase(buyTicket.fulfilled, (state, action) => {
        state.myTickets.push(action.payload as unknown as Ticket);
      });
  },
});

export const { setFanData, clearFanData, followTeamLocal, unfollowTeam } = fanSlice.actions;
export default fanSlice.reducer;
