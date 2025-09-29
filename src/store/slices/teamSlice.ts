import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TeamTheme = 'quantum' | 'crimson' | 'neon' | 'cyber';
interface TeamState {
  theme: TeamTheme;
  followedPlayers: string[]; // playerIds
  selectedMatchId: string | null;
}

const initialState: TeamState = {
  theme: 'quantum',
  followedPlayers: [],
  selectedMatchId: null,
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTheme: (s, a: PayloadAction<TeamTheme>) => {
      s.theme = a.payload;
    },
    toggleFollowPlayer: (s, a: PayloadAction<string>) => {
      const idx = s.followedPlayers.indexOf(a.payload);
      if (idx === -1) s.followedPlayers.push(a.payload);
      else s.followedPlayers.splice(idx, 1);
    },
    setSelectedMatch: (s, a: PayloadAction<string | null>) => {
      s.selectedMatchId = a.payload;
    },
  },
});

export const { setTheme, toggleFollowPlayer, setSelectedMatch } = teamSlice.actions;
export default teamSlice.reducer;