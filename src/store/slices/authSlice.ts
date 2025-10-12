import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from '@/models/User';

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'guest';
}

const loadUserFromStorage = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveUserToStorage = (user: AuthUser | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  } catch (error) {
    console.error('Failed to save user to storage:', error);
  }
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  status: loadUserFromStorage() ? 'authenticated' : 'loading'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'guest';
      saveUserToStorage(action.payload);
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
