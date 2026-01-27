import { createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '@/services/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { AuthUser } from '@/models/User';
import { setUser } from './slices/authSlice';
import { RootState } from './index';

export const updateUserProfile = createAsyncThunk(
    'auth/updateerProfile',
    async (updates: Partial<AuthUser>, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const uid = state.auth.user?.uid;

            if (!uid) {
                throw new Error('No authenticated user found');
            }

            const userRef = doc(db, 'users', uid);

            // Update Firestore
            await updateDoc(userRef, updates);

            // Fetch the latest user data to ensure consistency or just merge partially
            // For efficiency, we'll merge the existing state with updates
            const currentUser = state.auth.user!;
            const updatedUser: AuthUser = {
                ...currentUser,
                ...updates
            };

            // Update Redux state
            dispatch(setUser(updatedUser));

            return updatedUser;
        } catch (error: any) {
            console.error('Update profile error:', error);
            return rejectWithValue(error.message || 'Failed to update profile');
        }
    }
);
