import { db } from './firebase';
import {
  collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc,
  query, where, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { University, Team, Fixture, PlayerAvatar, Sport, ImportedData } from '@/models';
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

export const addPlayerToTeam = async (teamId: string, player: any) => {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) throw new Error('Team not found');
  const teamData = teamSnap.data();
  const players = teamData.players || [];
  players.push({ ...player, id: Date.now().toString() }); // Simple ID generation
  await updateDoc(teamRef, { players });
};

export const updatePlayerInTeam = async (teamId: string, playerId: string, playerData: any) => {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) throw new Error('Team not found');
  const teamData = teamSnap.data();
  const players = teamData.players || [];
  const playerIndex = players.findIndex((p: any) => p.id === playerId);
  if (playerIndex === -1) throw new Error('Player not found');
  players[playerIndex] = { ...players[playerIndex], ...playerData };
  await updateDoc(teamRef, { players });
};

export const deletePlayerFromTeam = async (teamId: string, playerId: string) => {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) throw new Error('Team not found');
  const teamData = teamSnap.data();
  const players = teamData.players || [];
  const filteredPlayers = players.filter((p: any) => p.id !== playerId);
  await updateDoc(teamRef, { players: filteredPlayers });
};

/* ---------- players ---------- */
export const loadPlayers = async (): Promise<any[]> => {
  const snap = await getDocs(collection(db, 'players'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addPlayer = async (player: any) => {
  await addDoc(collection(db, 'players'), { ...player, createdAt: serverTimestamp() });
};

export const updatePlayer = async (id: string, playerData: any) => {
  await updateDoc(doc(db, 'players', id), playerData);
};

export const deletePlayer = async (id: string) => {
  await deleteDoc(doc(db, 'players', id));
};

export const addPlayerHighlight = async (playerId: string, highlight: any) => {
  const playerRef = doc(db, 'players', playerId);
  const playerSnap = await getDoc(playerRef);
  if (!playerSnap.exists()) throw new Error('Player not found');
  const playerData = playerSnap.data();
  const highlights = playerData.highlights || [];
  highlights.push({ ...highlight, id: Date.now().toString() });
  await updateDoc(playerRef, { highlights });
};

export const updatePlayerHighlight = async (playerId: string, highlightId: string, highlightData: any) => {
  const playerRef = doc(db, 'players', playerId);
  const playerSnap = await getDoc(playerRef);
  if (!playerSnap.exists()) throw new Error('Player not found');
  const playerData = playerSnap.data();
  const highlights = playerData.highlights || [];
  const highlightIndex = highlights.findIndex((h: any) => h.id === highlightId);
  if (highlightIndex === -1) throw new Error('Highlight not found');
  highlights[highlightIndex] = { ...highlights[highlightIndex], ...highlightData };
  await updateDoc(playerRef, { highlights });
};

export const deletePlayerHighlight = async (playerId: string, highlightId: string) => {
  const playerRef = doc(db, 'players', playerId);
  const playerSnap = await getDoc(playerRef);
  if (!playerSnap.exists()) throw new Error('Player not found');
  const playerData = playerSnap.data();
  const highlights = playerData.highlights || [];
  const filteredHighlights = highlights.filter((h: any) => h.id !== highlightId);
  await updateDoc(playerRef, { highlights: filteredHighlights });
};

/* ---------- player avatars ---------- */
export const loadPlayerAvatars = async (): Promise<PlayerAvatar[]> => {
  const snap = await getDocs(collection(db, 'playerAvatars'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PlayerAvatar));
};

export const addPlayerAvatar = async (avatar: Omit<PlayerAvatar, 'id'>) =>
  addDoc(collection(db, 'playerAvatars'), { ...avatar, createdAt: serverTimestamp() });

export const updatePlayerAvatar = async (id: string, data: Partial<PlayerAvatar>) =>
  updateDoc(doc(db, 'playerAvatars', id), data);

export const deletePlayerAvatar = async (id: string) =>
  deleteDoc(doc(db, 'playerAvatars', id));

/* ---------- sports ---------- */
export const loadSports = async (): Promise<Sport[]> => {
  const snap = await getDocs(collection(db, 'sports'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Sport));
};

export const addSport = async (sport: Omit<Sport, 'id'>) =>
  addDoc(collection(db, 'sports'), { ...sport, createdAt: serverTimestamp() });

export const updateSport = async (id: string, data: Partial<Sport>) =>
  updateDoc(doc(db, 'sports', id), data);

export const deleteSport = async (id: string) =>
  deleteDoc(doc(db, 'sports', id));

/* ---------- games ---------- */
export const loadGames = async () => {
  const fixSnap = await getDocs(collection(db, 'fixtures'));
  const all = fixSnap.docs.map(d => ({ id: d.id, ...d.data() } as Fixture));
  return {
    live:     all.filter(f => f.status === 'live'),
    upcoming: all.filter(f => f.status === 'scheduled'),
  };
};

export const loadLiveGames = async (): Promise<Fixture[]> => {
  const liveSnap = await getDocs(collection(doc(db, 'admin'), 'liveGames'));
  return liveSnap.docs.map(d => ({ id: d.id, ...d.data() } as Fixture));
};

export const loadUpcomingGames = async (): Promise<Fixture[]> => {
  const upcomingSnap = await getDocs(collection(doc(db, 'admin'), 'upcomingGames'));
  return upcomingSnap.docs.map(d => ({ id: d.id, ...d.data() } as Fixture));
};

export const updateFixtureScore = async (id: string, home: number, away: number) =>
  updateDoc(doc(db, 'fixtures', id), { score: { home, away } });

export const startGame  = async (id: string) =>
  updateDoc(doc(db, 'fixtures', id), { status: 'live' });

export const endGame    = async (id: string) =>
  updateDoc(doc(db, 'fixtures', id), { status: 'completed' });

/* ---------- imported data ---------- */
export const loadImportedData = async (): Promise<ImportedData[]> => {
  const snap = await getDocs(collection(db, 'imported_data'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ImportedData));
};

export const processImportedData = async (id: string) =>
  updateDoc(doc(db, 'imported_data', id), { status: 'processed' });

/* ---------- processed documents ---------- */
export interface ProcessedDocument {
  id?: string;
  importedDataId: string;
  googleDriveFileId: string;
  extractedData: any;
  processedAt: string;
}

export const saveProcessedDocument = async (data: Omit<ProcessedDocument, 'id' | 'processedAt'>) =>
  addDoc(collection(db, 'processed_documents'), {
    ...data,
    processedAt: serverTimestamp(),
  });
