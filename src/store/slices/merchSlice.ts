import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface MerchItem {
  id: string; name: string; price: number; image: string; description: string;
}
interface State { items: MerchItem[] }
const initialState: State = { items: [] };
const slice = createSlice({
  name: 'merch',
  initialState,
  reducers: { setMerch: (s, a: PayloadAction<MerchItem[]>) => { s.items = a.payload; } },
});
export const { setMerch } = slice.actions;
export default slice.reducer;
