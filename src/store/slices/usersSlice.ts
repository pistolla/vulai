import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUsers } from '../adminThunk';

export interface AdminUserRow {
  uid: string; name: string; email: string; role: 'correspondent' | 'fan' | 'sport-team'; status: 'active' | 'pending'; university?: string;
}
interface State { rows: AdminUserRow[] }
const initialState: State = { rows: [] };
const slice = createSlice({
  name: 'users',
  initialState,
  reducers: { setUsers: (s, a: PayloadAction<AdminUserRow[]>) => { s.rows = a.payload; } },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.rows = action.payload;
    });
  },
});
export const { setUsers } = slice.actions;
export default slice.reducer;
