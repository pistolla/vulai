import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CorrespondentDashboard, LiveCommentary, FixtureVideo } from '@/models';
import { pushCommentaryEvent, attachDriveVideo } from '@/store/thunks';

interface ExtendedCorrState extends CorrespondentDashboard {
  activeCommentary: LiveCommentary | null;
  fixtureVideos: Record<string, FixtureVideo>; // fixtureId -> video
}

const initialState: ExtendedCorrState = {
  myArticles: [],
  draftArticles: [],
  activeCommentary: null,
  fixtureVideos: {},
};

const correspondentSlice = createSlice({
  name: 'correspondent',
  initialState,
  reducers: {
    setCorrespondentData: (_, action: PayloadAction<CorrespondentDashboard>) => ({
      ...action.payload,
      activeCommentary: null,
      fixtureVideos: {},
    }),
    clearCorrespondentData: () => initialState,
    setActiveCommentary: (s, { payload }: PayloadAction<LiveCommentary | null>) => {
      s.activeCommentary = payload;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(pushCommentaryEvent.fulfilled, (s, { payload }) => {
        if (s.activeCommentary) s.activeCommentary.events.push(payload);
      })
      .addCase(attachDriveVideo.fulfilled, (s, { payload }) => {
        s.fixtureVideos[payload.fixtureId] = payload;
      }),
});

export const { setCorrespondentData, clearCorrespondentData, setActiveCommentary } =
  correspondentSlice.actions;
export default correspondentSlice.reducer;
