import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Fixture } from '@/models';
import { fetchGames } from '../adminThunk';

interface State { live: Fixture[]; upcoming: Fixture[]; loading: boolean; error: string | null }
const initialState: State = { live: [], upcoming: [], loading: false, error: null };

const slice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setGames: (s, a: PayloadAction<{ live: Fixture[]; upcoming: Fixture[] }>) => {
      s.live = a.payload.live;
      s.upcoming = a.payload.upcoming;
      s.loading = false;
      s.error = null;
    },
    updateFixture: (s, a: PayloadAction<Fixture>) => {
      const idx = s.live.findIndex(f => f.id === a.payload.id);
      if (idx > -1) s.live[idx] = a.payload;
    },
    setGamesLoading: (s, a: PayloadAction<boolean>) => {
      s.loading = a.payload;
    },
    setGamesError: (s, a: PayloadAction<string>) => {
      s.error = a.payload;
      s.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.live = action.payload.live;
        state.upcoming = action.payload.upcoming;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load games';
      });
  },
});

export const { setGames, updateFixture, setGamesLoading, setGamesError } = slice.actions;
export default slice.reducer;
