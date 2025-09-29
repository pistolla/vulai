import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from '@/models/User';

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'guest';
}

const initialState: AuthState = { user: null, status: 'loading' };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'guest';
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
