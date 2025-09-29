import { parse } from 'papaparse'; // add: yarn add papaparse @types/papaparse
import { LiveCommentary, CommentaryEvent, FixtureVideo, CsvAthleteRow, Athlete } from '@/models';
import { db } from '@/services/firebase';
import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp, collection } from 'firebase/firestore';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '.';

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