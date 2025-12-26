import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { University, Team, Fixture } from '@/models';
import {
  fetchDashboard,
  fetchUsers,
  fetchMerch,
  fetchReviews,
  fetchGames,
  fetchUniversities,
  fetchTeams,
} from '@/store/adminThunk';

interface AdminState {
  universities: University[];
  teams: Team[];
  fixtures: Fixture[];
  stats: { users: number; liveGames: number; merchSales: number; pendingReviews: number };
  loading: {
    dashboard: boolean;
    users: boolean;
    merch: boolean;
    reviews: boolean;
    games: boolean;
  };
}

const initialState: AdminState = {
  universities: [],
  teams: [],
  fixtures: [],
  stats: { users: 0, liveGames: 0, merchSales: 0, pendingReviews: 0 },
  loading: {
    dashboard: false,
    users: false,
    merch: false,
    reviews: false,
    games: false,
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
  },
});

export const { setAdminData, clearAdminData, setLoading } = adminSlice.actions;
export default adminSlice.reducer;