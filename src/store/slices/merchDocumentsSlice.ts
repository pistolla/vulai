import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MerchDocument } from '@/models';
import {
  fetchMerchDocuments,
  createMerchDocument,
  updateMerchDocument,
  deleteMerchDocument,
  approveMerchDocument,
  rejectMerchDocument
} from '../correspondentThunk';

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
  extraReducers: (builder) => {
    // fetchMerchDocuments
    builder.addCase(fetchMerchDocuments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMerchDocuments.fulfilled, (state, action) => {
      state.documents = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(fetchMerchDocuments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch documents';
    });

    // createMerchDocument
    builder.addCase(createMerchDocument.fulfilled, (state, action) => {
      state.documents.push(action.payload);
    });

    // updateMerchDocument
    builder.addCase(updateMerchDocument.fulfilled, (state, action) => {
      const index = state.documents.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.documents[index] = action.payload;
      }
    });

    // deleteMerchDocument
    builder.addCase(deleteMerchDocument.fulfilled, (state, action) => {
      state.documents = state.documents.filter(d => d.id !== action.payload);
    });

    // approveMerchDocument
    builder.addCase(approveMerchDocument.fulfilled, (state, action) => {
      const doc = state.documents.find(d => d.id === action.payload.id);
      if (doc) {
        doc.status = 'approved';
        doc.approvals = doc.approvals || [];
        doc.approvals.push(action.payload.approval);
      }
    });

    // rejectMerchDocument
    builder.addCase(rejectMerchDocument.fulfilled, (state, action) => {
      const doc = state.documents.find(d => d.id === action.payload.id);
      if (doc) {
        doc.status = 'rejected';
        doc.approvals = doc.approvals || [];
        doc.approvals.push(action.payload.approval);
      }
    });
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