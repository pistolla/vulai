import { createAsyncThunk } from '@reduxjs/toolkit';
import { db, storage } from '@/services/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { RootState } from '.';

/* ---------- vitals ---------- */
export const updatePlayerVitals = createAsyncThunk(
  'player/updateVitals',
  async ({ playerId, data }: { playerId: string; data: Partial<any> }) => {
    await updateDoc(doc(db, 'players', playerId), { ...data, updatedAt: serverTimestamp() });
    return { playerId, ...data };
  }
);

/* ---------- gallery image ---------- */
export const uploadPlayerImage = createAsyncThunk(
  'player/uploadImage',
  async ({ playerId, file, caption }: { playerId: string; file: File; caption: string }, { getState }) => {
    const uid = (getState() as RootState).auth.user!.uid;
    const storageRef = ref(storage, `playerGallery/${playerId}/${Date.now()}_${file.name}`);
    const snap = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snap.ref);
    const imgDoc = await addDoc(collection(db, 'playerGallery', playerId, 'images'), {
      url,
      caption,
      uploadedAt: serverTimestamp(),
      uploadedBy: uid,
    });
    return { id: imgDoc.id, url, caption };
  }
);

/* ---------- trophy ---------- */
export const addPlayerTrophy = createAsyncThunk(
  'player/addTrophy',
  async ({ playerId, trophy }: { playerId: string; trophy: Omit<any, 'id'> }) => {
    const ref = await addDoc(collection(db, 'playerTrophies', playerId, 'trophies'), {
      ...trophy,
      createdAt: serverTimestamp(),
    });
    return { id: ref.id, ...trophy };
  }
);

/* ---------- training log ---------- */
export const addTrainingLog = createAsyncThunk(
  'player/addTrainingLog',
  async ({ playerId, log }: { playerId: string; log: Omit<any, 'id' | 'recordedBy'> }, { getState }) => {
    const uid = (getState() as RootState).auth.user!.uid;
    const ref = await addDoc(collection(db, 'trainingLogs', playerId, 'logs'), {
      ...log,
      recordedBy: uid,
      date: log.date || serverTimestamp(),
    });
    return { id: ref.id, ...log, recordedBy: uid };
  }
);