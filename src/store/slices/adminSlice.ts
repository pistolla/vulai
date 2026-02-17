import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { University, Team, Fixture, PlayerAvatar, Sport, ImportedData } from '@/models';
import {
  fetchDashboard,
  fetchUsers,
  fetchMerch,
  fetchOrders,
  fetchReviews,
  fetchGames,
  fetchUniversities,
  fetchTeams,
  fetchPlayers,
  createPlayerT,
  savePlayerT,
  removePlayerT,
  fetchPlayerAvatars,
  fetchSports,
  fetchImportedData,
} from '@/store/adminThunk';

interface AdminState {
  universities: University[];
  teams: Team[];
  fixtures: Fixture[];
  players: any[];
  playerAvatars: PlayerAvatar[];
  sports: Sport[];
  importedData: ImportedData[];
  orders: any[]; // Merchandise orders
  stats: { users: number; liveGames: number; merchSales: number; pendingReviews: number };
  loading: {
    dashboard: boolean;
    users: boolean;
    merch: boolean;
    orders: boolean;
    reviews: boolean;
    games: boolean;
    players: boolean;
  };
}

const initialState: AdminState = {
  universities: [],
  teams: [],
  fixtures: [],
  players: [],
  playerAvatars: [],
  sports: [],
  importedData: [],
  orders: [],
  stats: { users: 0, liveGames: 0, merchSales: 0, pendingReviews: 0 },
  loading: {
    dashboard: false,
    users: false,
    merch: false,
    orders: false,
    reviews: false,
    games: false,
    players: false,
  },
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminData: (state, action: PayloadAction<Partial<AdminState>>) => {
      Object.assign(state, action.payload);
    },
    clearAdminData: () => initialState,
    setLoading: (state, action: PayloadAction<{ key: keyof AdminState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    // Dashboard loading states
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading.dashboard = true;
      })
      .addCase(fetchDashboard.fulfilled, (state) => {
        state.loading.dashboard = false;
      })
      .addCase(fetchDashboard.rejected, (state) => {
        state.loading.dashboard = false;
      });

    // Users loading states
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading.users = true;
      })
      .addCase(fetchUsers.fulfilled, (state) => {
        state.loading.users = false;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.loading.users = false;
      });

    // Merch loading states
    builder
      .addCase(fetchMerch.pending, (state) => {
        state.loading.merch = true;
      })
      .addCase(fetchMerch.fulfilled, (state) => {
        state.loading.merch = false;
      })
      .addCase(fetchMerch.rejected, (state) => {
        state.loading.merch = false;
      })
      
      // Orders loading states
      builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading.orders = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.loading.orders = false;
      });

    // Reviews loading states
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading.reviews = true;
      })
      .addCase(fetchReviews.fulfilled, (state) => {
        state.loading.reviews = false;
      })
      .addCase(fetchReviews.rejected, (state) => {
        state.loading.reviews = false;
      });

    // Games loading states
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading.games = true;
      })
      .addCase(fetchGames.fulfilled, (state) => {
        state.loading.games = false;
      })
      .addCase(fetchGames.rejected, (state) => {
        state.loading.games = false;
      });

    // Universities
    builder
      .addCase(fetchUniversities.fulfilled, (state, action) => {
        state.universities = action.payload;
      });

    // Teams
    builder
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.teams = action.payload;
      });

    // Players
    builder
      .addCase(fetchPlayers.pending, (state) => {
        state.loading.players = true;
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.players = action.payload;
        state.loading.players = false;
      })
      .addCase(fetchPlayers.rejected, (state) => {
        state.loading.players = false;
      })
      .addCase(createPlayerT.fulfilled, (state, action) => {
        state.players.push(action.payload);
      })
      .addCase(savePlayerT.fulfilled, (state, action) => {
        const index = state.players.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.players[index] = action.payload;
        }
      })
      .addCase(removePlayerT.fulfilled, (state, action) => {
        state.players = state.players.filter(p => p.id !== action.payload);
      });

    // Player Avatars
    builder
      .addCase(fetchPlayerAvatars.fulfilled, (state, action) => {
        state.playerAvatars = action.payload;
      });

    // Sports
    builder
      .addCase(fetchSports.fulfilled, (state, action) => {
        state.sports = action.payload;
      });

    // Imported Data
    builder
      .addCase(fetchImportedData.fulfilled, (state, action) => {
        state.importedData = action.payload;
      });
  },
});

export const { setAdminData, clearAdminData, setLoading } = adminSlice.actions;
export default adminSlice.reducer;