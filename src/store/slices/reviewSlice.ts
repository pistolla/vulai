import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchReviews } from '../adminThunk';

export interface ReviewRow {
  id: string; title: string; correspondent: string; type: string; submittedAt: string;
}
interface State { rows: ReviewRow[] }
const initialState: State = { rows: [] };
const slice = createSlice({
  name: 'review',
  initialState,
  reducers: { setReviews: (s, a: PayloadAction<ReviewRow[]>) => { s.rows = a.payload; } },
  extraReducers: (builder) => {
    builder.addCase(fetchReviews.fulfilled, (state, action) => {
      state.rows = action.payload;
    });
  },
});
export const { setReviews } = slice.actions;
export default slice.reducer;
