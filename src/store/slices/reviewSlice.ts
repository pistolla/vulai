import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface ReviewRow {
  id: string; title: string; correspondent: string; type: string; submittedAt: string;
}
interface State { rows: ReviewRow[] }
const initialState: State = { rows: [] };
const slice = createSlice({
  name: 'review',
  initialState,
  reducers: { setReviews: (s, a: PayloadAction<ReviewRow[]>) => { s.rows = a.payload; } },
});
export const { setReviews } = slice.actions;
export default slice.reducer;
