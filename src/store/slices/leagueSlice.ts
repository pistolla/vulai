import { League } from "@/models";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchLeagues, createLeague } from "../correspondentThunk";

interface LeaguesState {
    leagues: League[];
    loading: boolean;
    error?: string | null;
  }
  
  const initialLeaguesState: LeaguesState = {
    leagues: [],
    loading: false,
    error: null,
  };
  
  export const leaguesSlice = createSlice({
    name: 'leagues',
    initialState: initialLeaguesState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(fetchLeagues.pending, (state) => {
        state.loading = true;
      });
      builder.addCase(fetchLeagues.fulfilled, (state, action: PayloadAction<League[]>) => {
        state.loading = false;
        state.leagues = action.payload;
      });
      builder.addCase(fetchLeagues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load leagues';
      });
  
      builder.addCase(createLeague.fulfilled, (state, action: PayloadAction<League>) => {
        state.leagues.push(action.payload);
      });
    },
  });

export default leaguesSlice.reducer;