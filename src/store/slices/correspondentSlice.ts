import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CorrespondentDashboard, LiveCommentary, FixtureVideo, Group, Match, Stage, League, Fixture } from '@/models';
import { pushCommentaryEvent, attachDriveVideo, createLeague, fetchLeagues, createGroup, createStage, createMatch, updateMatchScores, fetchPointsTable, fetchFixtures, createFixture, updateFixture } from '@/store/correspondentThunk';

// Define proper type for points data
interface PointsEntry {
  refId: string;
  points: number;
}

interface ExtendedCorrState extends CorrespondentDashboard {
  activeCommentary: LiveCommentary | null;
  fixtureVideos: Record<string, FixtureVideo>; // fixtureId -> video
  leagues: League[];
  groups: Record<string, Group[]>;
  stages: Record<string, Stage[]>;
  matches: Record<string, Match[]>;
  points: Record<string, PointsEntry[]>;
  fixtures: Fixture[];
}

const initialState: ExtendedCorrState = {
  myArticles: [],
  draftArticles: [],
  groups: {},
  stages: {},
  matches: {},
  points: {},
  activeCommentary: null,
  fixtureVideos: {},
  leagues: [],
  fixtures: [],
};

export type CorrespondentState = ExtendedCorrState;

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
    setPoints(state, action: PayloadAction<{ leagueId: string; groupId: string; seasonId?: string; points: PointsEntry[] }>) {
      const key = `${action.payload.leagueId}_${action.payload.groupId}${action.payload.seasonId ? '_' + action.payload.seasonId : ''}`;
      state.points[key] = action.payload.points;
    },
    setCorrespondentData: (_, action: PayloadAction<CorrespondentDashboard>) => ({
      myArticles: action.payload.myArticles || [],
      draftArticles: action.payload.draftArticles || [],
      groups: action.payload.groups || {},
      stages: action.payload.stages || {},
      matches: action.payload.matches || {},
      points: action.payload.points || {},
      activeCommentary: null,
      fixtureVideos: {},
      leagues: [],
      fixtures: [],
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
      })
      .addCase(fetchLeagues.fulfilled, (s, { payload }) => {
        console.log(`Correspondent slice: Leagues updated with ${payload.length} leagues`);
        s.leagues = payload;
      })
      .addCase(createLeague.fulfilled, (s, { payload }) => {
        s.leagues.push(payload);
      })
      .addCase(createGroup.fulfilled, (s, { payload }) => {
        const { leagueId, ...group } = payload;
        if (!s.groups[leagueId]) s.groups[leagueId] = [];
        s.groups[leagueId].push(group);
      })
      .addCase(createStage.fulfilled, (s, { payload }) => {
        const { leagueId, groupId, ...stage } = payload;
        const key = `${leagueId}_${groupId}`;
        if (!s.stages[key]) s.stages[key] = [];
        s.stages[key].push(stage);
      })
      .addCase(createMatch.fulfilled, (s, { payload }) => {
        const { leagueId, groupId, stageId, ...match } = payload;
        const key = `${leagueId}_${groupId}_${stageId}`;
        if (!s.matches[key]) s.matches[key] = [];
        s.matches[key].push(match);
      })
      .addCase(updateMatchScores.fulfilled, (s, { payload }) => {
        const { leagueId, groupId, stageId, matchId, participants } = payload;
        const key = `${leagueId}_${groupId}_${stageId}`;
        const match = s.matches[key]?.find(m => m.id === matchId);
        if (match) {
          match.participants = participants;
        }
      })
      .addCase(fetchPointsTable.fulfilled, (s, { payload }) => {
        const { leagueId, groupId, seasonId, points } = payload;
        const key = `${leagueId}_${groupId}${seasonId ? '_' + seasonId : ''}`;
        s.points[key] = points;
      })
      .addCase(fetchFixtures.fulfilled, (s, { payload }) => {
        s.fixtures = payload;
      })
      .addCase(createFixture.fulfilled, (s, { payload }) => {
        s.fixtures.push(payload);
      })
      .addCase(updateFixture.fulfilled, (s, { payload }) => {
        const index = s.fixtures.findIndex(f => f.id === payload.id);
        if (index !== -1) {
          s.fixtures[index] = payload;
        }
      }),
});

export const { setCorrespondentData, clearCorrespondentData, setActiveCommentary, setGroups, setStages, setMatches, setPoints } =
  correspondentSlice.actions;
export default correspondentSlice.reducer;



