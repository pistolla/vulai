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
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    // Validate the stored user object has required fields
    if (parsed && typeof parsed === 'object' && parsed.uid && parsed.email && parsed.role) {
      return parsed as AuthUser;
    }
    return null;
  } catch (error) {
    console.error('Failed to load user from storage:', error);
    // Clear corrupted data
    localStorage.removeItem('auth_user');
    return null;
  }
};

const saveUserToStorage = (user: AuthUser | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (user && user.uid && user.email && user.role) {
      // Ensure we only save valid user objects
      const userToSave = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        status: user.status,
        universityId: user.universityId,
        teamId: user.teamId,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        twoFactorEnabled: user.twoFactorEnabled,
      };
      localStorage.setItem('auth_user', JSON.stringify(userToSave));
    } else {
      localStorage.removeItem('auth_user');
    }
  } catch (error) {
    console.error('Failed to save user to storage:', error);
    // Clear any corrupted data
    localStorage.removeItem('auth_user');
  }
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  status: loadUserFromStorage() ? 'authenticated' : 'guest'
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
    setStatus(state, action: PayloadAction<AuthState['status']>) {
      state.status = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.status = 'guest';
      saveUserToStorage(null);
    },
  },
});

export const { setUser, setStatus, clearUser } = authSlice.actions;
export default authSlice.reducer;
