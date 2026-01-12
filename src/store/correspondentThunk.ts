import { parse } from 'papaparse'; // add: yarn add papaparse @types/papaparse
import { LiveCommentary, CommentaryEvent, FixtureVideo, CsvAthleteRow, Athlete, Group, League, Match, Participant, Stage, ImportedData, Fixture, MerchDocument } from '@/models';
import { db } from '@/services/firebase';
import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '.';
import { firebaseLeagueService } from '@/services/firebaseCorrespondence';

/* ---------- 1. excel (CSV) bulk athlete roster ---------- */
export const uploadAthleteCsv = createAsyncThunk(
  'correspondent/uploadAthleteCsv',
  async (
    { teamId, file }: { teamId: string; file: File },
    { getState }
  ) => {
    const state = getState() as RootState;
    const uid = state.auth.user!.uid; // correspondent

    const text = await file.text();
    const { data } = parse<CsvAthleteRow>(text, { header: true, dynamicTyping: true });

    const batch = data.map((row) => {
      const ath: Omit<Athlete, 'id'> = {
        teamId,
        firstName: row.firstName,
        lastName: row.lastName,
        jerseyNumber: row.jerseyNumber,
        position: row.position || '',
        year: row.year,
      };
      const ref = doc(collection(db, 'athletes'));
      return setDoc(ref, ath);
    });

    await Promise.all(batch);
    return data.length;
  }
);

/* ---------- 2. create / append live commentary ---------- */
export const startLiveCommentary = createAsyncThunk(
  'correspondent/startLiveCommentary',
  async (fixtureId: string) => {
    const ref = doc(db, 'liveCommentary', fixtureId);
    const payload: LiveCommentary = {
      id: fixtureId,
      fixtureId,
      status: 'live',
      lastUpdateAt: new Date().toISOString(),
      events: [],
    };
    await setDoc(ref, payload);
    return payload;
  }
);

export const pushCommentaryEvent = createAsyncThunk(
  'correspondent/pushEvent',
  async ({ fixtureId, event }: { fixtureId: string; event: Omit<CommentaryEvent, 'id' | 'createdAt'> }) => {
    const ref = doc(db, 'liveCommentary', fixtureId);
    const full: CommentaryEvent = {
      ...event,
      id: doc(collection(db, '_')).id,
      createdAt: new Date().toISOString(),
    };
    await updateDoc(ref, {
      events: arrayUnion(full),
      lastUpdateAt: serverTimestamp(),
    });
    return full;
  }
);

export const endLiveCommentary = createAsyncThunk(
  'correspondent/endLiveCommentary',
  async (fixtureId: string) => {
    const ref = doc(db, 'liveCommentary', fixtureId);
    await updateDoc(ref, { status: 'finished' });
    return fixtureId;
  }
);

/* ---------- 3. attach Google Drive video to fixture ---------- */
export const attachDriveVideo = createAsyncThunk(
  'correspondent/attachDriveVideo',
  async (
    { fixtureId, fileId, webViewLink }: { fixtureId: string; fileId: string; webViewLink: string },
    { getState }
  ) => {
    const uid = (getState() as RootState).auth.user!.uid;
    const payload: FixtureVideo = {
      fixtureId,
      driveFileId: fileId,
      driveWebViewLink: webViewLink,
      uploadedBy: uid,
      uploadedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'fixtureVideos', fixtureId), payload, { merge: true });
    return payload;
  }
);

export const fetchLeagues = createAsyncThunk('leagues/fetchAll', async () => {
  try {
    console.log('Thunk: Fetching leagues...');
    const result = await firebaseLeagueService.listLeagues();
    console.log(`Thunk: Successfully fetched ${result.length} leagues`);
    return result;
  } catch (error) {
    console.error('Thunk: Failed to fetch leagues:', error);
    throw error;
  }
});

export const createLeague = createAsyncThunk('leagues/create', async (payload: Omit<League, 'id'>) => {
  const id = await firebaseLeagueService.createLeague(payload);
  return { id, ...payload } as League;
});

export const createGroup = createAsyncThunk(
  'groups/create',
  async ({ leagueId, group }: { leagueId: string; group: Omit<Group, 'id'> }) => {
    const id = await firebaseLeagueService.createGroup(leagueId, group);
    return { leagueId, id, ...group } as any;
  },
);

export const createStage = createAsyncThunk(
  'stages/create',
  async ({ leagueId, groupId, stage }: { leagueId: string; groupId: string; stage: Omit<Stage, 'id'> }) => {
    const id = await firebaseLeagueService.createStage(leagueId, groupId, stage);
    return { leagueId, groupId, id, ...stage } as any;
  },
);

export const createMatch = createAsyncThunk(
  'matches/create',
  async ({ leagueId, groupId, stageId, match }: { leagueId: string; groupId: string; stageId: string; match: Omit<Match, 'id'> }) => {
    const id = await firebaseLeagueService.createMatch(leagueId, groupId, stageId, match);
    return { leagueId, groupId, stageId, id, ...match } as any;
  },
);

export const updateMatchScores = createAsyncThunk(
  'matches/updateScores',
  async ({ leagueId, groupId, stageId, matchId, participants }: { leagueId: string; groupId: string; stageId: string; matchId: string; participants: Participant[] }) => {
    await firebaseLeagueService.updateMatchScores(leagueId, groupId, stageId, matchId, participants);
    return { leagueId, groupId, stageId, matchId, participants } as any;
  },
);

export const fetchPointsTable = createAsyncThunk(
  'points/fetch',
  async ({ leagueId, groupId }: { leagueId: string; groupId: string }) => {
    return { leagueId, groupId, points: await firebaseLeagueService.getPointsTable(leagueId, groupId) } as any;
  },
);

/* ---------- submit imported data ---------- */
export const submitImportedData = createAsyncThunk(
  'correspondent/submitImportedData',
  async (data: Omit<ImportedData, 'id'>) => {
    const ref = doc(collection(db, 'imported_data'));
    const fullData: ImportedData = { ...data, id: ref.id };
    await setDoc(ref, fullData);
    return fullData;
  }
);

/* ---------- fixtures ---------- */
export const fetchFixtures = createAsyncThunk('fixtures/fetchAll', async () => {
  // For now, return empty array - implement Firebase service later
  return [] as Fixture[];
});

export const createFixture = createAsyncThunk('fixtures/create', async (fixture: Omit<Fixture, 'id'>) => {
  // TODO: Implement Firebase service for fixtures
  const id = doc(collection(db, 'fixtures')).id;
  const fullFixture: Fixture = { id, ...fixture };
  // await setDoc(doc(db, 'fixtures', id), fullFixture);
  return fullFixture;
});

export const updateFixture = createAsyncThunk('fixtures/update', async ({ id, fixture }: { id: string; fixture: Partial<Fixture> }) => {
  // TODO: Implement Firebase service for fixtures
  // await updateDoc(doc(db, 'fixtures', id), fixture);
  return { id, ...fixture } as Fixture;
});

/* ---------- merchandise documents ---------- */
export const fetchMerchDocuments = createAsyncThunk('merchDocuments/fetchAll', async () => {
  const snap = await getDocs(collection(db, 'merchandise_documents'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MerchDocument));
});

export const createMerchDocument = createAsyncThunk(
  'merchDocuments/create',
  async (document: Omit<MerchDocument, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'approvals'>, { getState }) => {
    const uid = (getState() as RootState).auth.user!.uid;
    const now = new Date().toISOString();
    const fullDoc: MerchDocument = {
      ...document,
      id: doc(collection(db, 'merchandise_documents')).id,
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
      approvals: [],
    };
    await setDoc(doc(db, 'merchandise_documents', fullDoc.id), fullDoc);
    return fullDoc;
  }
);

export const updateMerchDocument = createAsyncThunk(
  'merchDocuments/update',
  async ({ id, updates }: { id: string; updates: Partial<MerchDocument> }) => {
    const updateData = { ...updates, updatedAt: new Date().toISOString() };
    await updateDoc(doc(db, 'merchandise_documents', id), updateData);
    return { id, ...updateData } as MerchDocument;
  }
);

export const deleteMerchDocument = createAsyncThunk('merchDocuments/delete', async (id: string) => {
  await deleteDoc(doc(db, 'merchandise_documents', id));
  return id;
});

export const approveMerchDocument = createAsyncThunk(
  'merchDocuments/approve',
  async ({ id, comment }: { id: string; comment?: string }, { getState }) => {
    const uid = (getState() as RootState).auth.user!.uid;
    const approval = {
      userId: uid,
      status: 'approved' as const,
      timestamp: new Date().toISOString(),
      comment,
    };
    await updateDoc(doc(db, 'merchandise_documents', id), {
      approvals: arrayUnion(approval),
      status: 'approved',
      updatedAt: new Date().toISOString(),
    });
    return { id, approval };
  }
);

export const rejectMerchDocument = createAsyncThunk(
  'merchDocuments/reject',
  async ({ id, comment }: { id: string; comment?: string }, { getState }) => {
    const uid = (getState() as RootState).auth.user!.uid;
    const approval = {
      userId: uid,
      status: 'rejected' as const,
      timestamp: new Date().toISOString(),
      comment,
    };
    await updateDoc(doc(db, 'merchandise_documents', id), {
      approvals: arrayUnion(approval),
      status: 'rejected',
      updatedAt: new Date().toISOString(),
    });
    return { id, approval };
  }
);
