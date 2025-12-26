import { db } from './firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, where, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { University, Team, Fixture } from '@/models';
import { AdminUserRow } from '@/store/slices/usersSlice';
import { MerchItem } from '@/store/slices/merchSlice';
import { ReviewRow } from '@/store/slices/reviewSlice';

/* ---------- dashboard ---------- */
export const loadAdminDashboard = async () => {
  const [uniSnap, teamSnap, fixSnap, userSnap, merchSnap, reviewSnap] = await Promise.all([
    getDocs(collection(db, 'universities')),
    getDocs(collection(db, 'teams')),
    getDocs(collection(db, 'fixtures')),
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'merchandise')),
    getDocs(query(collection(db, 'reviews'), where('status', '==', 'pending'))),
  ]);
  return {
    universities: uniSnap.docs.map(d => ({ id: d.id, ...d.data() } as University)),
    teams:        teamSnap.docs.map(d => ({ id: d.id, ...d.data() } as Team)),
    fixtures:     fixSnap.docs.map(d => ({ id: d.id, ...d.data() } as Fixture)),
    stats:        {
      users:          userSnap.size,
      liveGames:      fixSnap.docs.filter(d => d.data().status === 'live').length,
      merchSales:     merchSnap.docs.filter(d => (d.data().sold || 0) > 0).length,
      pendingReviews: reviewSnap.size,
    },
  };
};

/* ---------- users ---------- */
export const loadUsers = async (): Promise<AdminUserRow[]> => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      uid:   d.id,
      name:  data.displayName || '',
      email: data.email,
      role:  data.role,
      status: data.role === 'correspondent' && !data.approved ? 'pending' : 'active',
      university: data.universityId || '',
    };
  });
};

export const approveUser = async (uid: string) =>
  updateDoc(doc(db, 'users', uid), { approved: true });

export const deleteUserDoc = async (uid: string) =>
  deleteDoc(doc(db, 'users', uid));

/* ---------- merchandise ---------- */
export const loadMerch = async (): Promise<MerchItem[]> => {
  const snap = await getDocs(collection(db, 'merchandise'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MerchItem));
};

export const addMerch = async (item: Omit<MerchItem, 'id'>) =>
  addDoc(collection(db, 'merchandise'), { ...item, createdAt: serverTimestamp() });

export const updateMerch = async (id: string, data: Partial<MerchItem>) =>
  updateDoc(doc(db, 'merchandise', id), data);

export const deleteMerch = async (id: string) =>
  deleteDoc(doc(db, 'merchandise', id));

/* ---------- reviews ---------- */
export const loadReviews = async (): Promise<ReviewRow[]> => {
  const snap = await getDocs(query(collection(db, 'reviews'), where('status', '==', 'pending')));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id:          d.id,
      title:       data.title,
      correspondent: data.correspondentName,
      type:        data.type,
      submittedAt: (data.submittedAt as Timestamp).toDate().toISOString(),
    };
  });
};

export const approveReview = async (id: string) =>
  updateDoc(doc(db, 'reviews', id), { status: 'approved', reviewedAt: serverTimestamp() });

export const rejectReview  = async (id: string) =>
  updateDoc(doc(db, 'reviews', id), { status: 'rejected', reviewedAt: serverTimestamp() });

/* ---------- universities ---------- */
export const loadUniversities = async (): Promise<University[]> => {
  const snap = await getDocs(collection(db, 'universities'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as University));
};

export const addUniversity = async (uni: Omit<University, 'id'> & { logoURL?: string }) =>
  addDoc(collection(db, 'universities'), { ...uni, createdAt: serverTimestamp() });

export const updateUniversity = async (id: string, data: Partial<University & { logoURL?: string }>) =>
  updateDoc(doc(db, 'universities', id), data);

export const deleteUniversity = async (id: string) =>
  deleteDoc(doc(db, 'universities', id));

/* ---------- teams ---------- */
export const loadTeams = async (): Promise<Team[]> => {
  const snap = await getDocs(collection(db, 'teams'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Team));
};

export const addTeam = async (team: Omit<Team, 'id'> & { logoURL?: string }) =>
  addDoc(collection(db, 'teams'), { ...team, createdAt: serverTimestamp() });

export const updateTeam = async (id: string, data: Partial<Team & { logoURL?: string }>) =>
  updateDoc(doc(db, 'teams', id), data);

export const deleteTeam = async (id: string) =>
  deleteDoc(doc(db, 'teams', id));

/* ---------- games ---------- */
export const loadGames = async () => {
  const fixSnap = await getDocs(collection(db, 'fixtures'));
  const all = fixSnap.docs.map(d => ({ id: d.id, ...d.data() } as Fixture));
  return {
    live:     all.filter(f => f.status === 'live'),
    upcoming: all.filter(f => f.status === 'scheduled'),
  };
};

export const updateFixtureScore = async (id: string, home: number, away: number) =>
  updateDoc(doc(db, 'fixtures', id), { score: { home, away } });

export const startGame  = async (id: string) =>
  updateDoc(doc(db, 'fixtures', id), { status: 'live' });

export const endGame    = async (id: string) =>
  updateDoc(doc(db, 'fixtures', id), { status: 'completed' });
