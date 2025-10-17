import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CorrespondentDashboard, LiveCommentary, FixtureVideo, Group, Match, Stage } from '@/models';
import { pushCommentaryEvent, attachDriveVideo } from '@/store/correspondentThunk';

interface ExtendedCorrState extends CorrespondentDashboard {
  activeCommentary: LiveCommentary | null;
  fixtureVideos: Record<string, FixtureVideo>; // fixtureId -> video
}

const initialState: ExtendedCorrState = {
  myArticles: [],
  draftArticles: [],
  activeCommentary: null,
  fixtureVideos: {},
  groups: Record<string, Group[]>,
  stages: Record<string, Stage[]>,
  matches: Record<string, Match[]>,
  points: Record<string, any[]>
};

const correspondentSlice = createSlice({
  name: 'correspondent',
  initialState,
  reducers: {
    setGroups(state, action: PayloadAction<{ leagueId: string; groups: Group[] }>) {
      state.groups[action.payload.leagueId] = action.payload.groups;
    },
    setStages(state, action: PayloadAction<{ leagueId: string; groupId: string; stages: Stage[] }>) {
      state.stages[`${action.payload.leagueId}_${action.payload.groupId}`] = action.payload.stages;
    },
    setMatches(state, action: PayloadAction<{ leagueId: string; groupId: string; stageId: string; matches: Match[] }>) {
      state.matches[`${action.payload.leagueId}_${action.payload.groupId}_${action.payload.stageId}`] = action.payload.matches;
    },
    setPoints(state, action: PayloadAction<{ leagueId: string; groupId: string; points: any[] }>) {
      state.points[`${action.payload.leagueId}_${action.payload.groupId}`] = action.payload.points;
    },
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

export const { setCorrespondentData, clearCorrespondentData, setActiveCommentary, setGroups, setStages, setMatches, setPoints } =
  correspondentSlice.actions;
export default correspondentSlice.reducer;



