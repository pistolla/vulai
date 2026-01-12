import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MerchDocument } from '@/models';

interface State {
  documents: MerchDocument[];
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  documents: [],
  loading: false,
  error: null,
};

const slice = createSlice({
  name: 'merchDocuments',
  initialState,
  reducers: {
    setDocuments: (s, a: PayloadAction<MerchDocument[]>) => {
      s.documents = a.payload;
      s.loading = false;
      s.error = null;
    },
    addDocument: (s, a: PayloadAction<MerchDocument>) => {
      s.documents.push(a.payload);
    },
    updateDocument: (s, a: PayloadAction<MerchDocument>) => {
      const index = s.documents.findIndex(d => d.id === a.payload.id);
      if (index !== -1) {
        s.documents[index] = a.payload;
      }
    },
    removeDocument: (s, a: PayloadAction<string>) => {
      s.documents = s.documents.filter(d => d.id !== a.payload);
    },
    setDocumentsLoading: (s, a: PayloadAction<boolean>) => {
      s.loading = a.payload;
    },
    setDocumentsError: (s, a: PayloadAction<string>) => {
      s.error = a.payload;
      s.loading = false;
    },
  },
});

export const {
  setDocuments,
  addDocument,
  updateDocument,
  removeDocument,
  setDocumentsLoading,
  setDocumentsError,
} = slice.actions;
export default slice.reducer;