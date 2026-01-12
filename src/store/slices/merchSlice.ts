import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchMerch } from '../adminThunk';

export interface MerchItem {
  id: string;
  type: 'team' | 'unil';
  name: string;
  price: number;
  image: string;
  images: string[]; // Array of base64 images or URLs
  description: string;
  category: string;
  catalog: string;
  university?: string;
  team?: string;
}
interface State { items: MerchItem[]; loading: boolean; error: string | null }
const initialState: State = { items: [], loading: false, error: null };

const slice = createSlice({
  name: 'merch',
  initialState,
  reducers: {
    setMerch: (s, a: PayloadAction<MerchItem[]>) => {
      s.items = a.payload;
      s.loading = false;
      s.error = null;
    },
    setMerchLoading: (s, a: PayloadAction<boolean>) => {
      s.loading = a.payload;
    },
    setMerchError: (s, a: PayloadAction<string>) => {
      s.error = a.payload;
      s.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMerch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMerch.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchMerch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load merchandise';
      });
  },
});

export const { setMerch, setMerchLoading, setMerchError } = slice.actions;
export default slice.reducer;
