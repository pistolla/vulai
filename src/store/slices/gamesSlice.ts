import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Fixture } from '@/models';
interface State { live: Fixture[]; upcoming: Fixture[] }
const initialState: State = { live: [], upcoming: [] };
const slice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setGames: (s, a: PayloadAction<{ live: Fixture[]; upcoming: Fixture[] }>) => {
      s.live = a.payload.live;
      s.upcoming = a.payload.upcoming;
    },
    updateFixture: (s, a: PayloadAction<Fixture>) => {
      const idx = s.live.findIndex(f => f.id === a.payload.id);
      if (idx > -1) s.live[idx] = a.payload;
    },
  },
});
export const { setGames, updateFixture } = slice.actions;
export default slice.reducer;
