import { db } from './firebase';
import {
  collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc,
  query, where, serverTimestamp, Timestamp, collectionGroup, QueryDocumentSnapshot, DocumentData
} from 'firebase/firestore';
import { University, Team, Fixture, PlayerAvatar, Sport, ImportedData, Season, MerchItem } from '@/models';
import { AdminUserRow } from '@/store/slices/usersSlice';
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
    universities: uniSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as University)),
    teams: teamSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as Team)),
    fixtures: fixSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as Fixture)),
    stats: {
      users: userSnap.size,
      liveGames: fixSnap.docs.filter((d: QueryDocumentSnapshot<DocumentData>) => d.data().status === 'live').length,
      merchSales: merchSnap.docs.filter((d: QueryDocumentSnapshot<DocumentData>) => (d.data().sold || 0) > 0).length,
      pendingReviews: reviewSnap.size,
    },
  };
};

/* ---------- users ---------- */
export const loadUsers = async (): Promise<AdminUserRow[]> => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.displayName || '',
      email: data.email,
      role: data.role,
      status: data.role === 'correspondent' && data.status !== true ? 'pending' : 'active',
      university: data.universityId || '',
    };
  });
};

export const approveUser = async (uid: string) =>
  updateDoc(doc(db, 'users', uid), { status: true });

export const disapproveUser = async (uid: string) =>
  updateDoc(doc(db, 'users', uid), { status: false });

export const deleteUserDoc = async (uid: string) => {
  const response = await fetch(`/api/admin/delete-user?uid=${uid}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete user');
  }
};

/* ---------- merchandise ---------- */
export const loadMerch = async (): Promise<MerchItem[]> => {
  const snap = await getDocs(collection(db, 'merchandise'));
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as MerchItem));
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
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      correspondent: data.correspondentName,
      type: data.type,
      submittedAt: (data.submittedAt as Timestamp).toDate().toISOString(),
    };
  });
};

export const approveReview = async (id: string) =>
  updateDoc(doc(db, 'reviews', id), { status: 'approved', reviewedAt: serverTimestamp() });

export const rejectReview = async (id: string) =>
  updateDoc(doc(db, 'reviews', id), { status: 'rejected', reviewedAt: serverTimestamp() });

/* ---------- universities ---------- */
export const loadUniversities = async (): Promise<University[]> => {
  const snap = await getDocs(collection(db, 'universities'));
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as University));
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
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as Team));
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
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() }));
};

export const addPlayer = async (player: any) => {
  const docRef = await addDoc(collection(db, 'players'), { ...player, createdAt: serverTimestamp() });
  return { id: docRef.id, ...player };
};

export const updatePlayer = async (id: string, playerData: any) => {
  await updateDoc(doc(db, 'players', id), playerData);
  return { id, ...playerData };
};

export const deletePlayer = async (id: string) => {
  await deleteDoc(doc(db, 'players', id));
  return id;
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
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as PlayerAvatar));
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
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as Sport));
};

export const addSport = async (sport: Omit<Sport, 'id'>) =>
  addDoc(collection(db, 'sports'), { ...sport, createdAt: serverTimestamp() });

export const updateSport = async (id: string, data: Partial<Sport>) =>
  updateDoc(doc(db, 'sports', id), data);

export const deleteSport = async (id: string) =>
  deleteDoc(doc(db, 'sports', id));

export const addSeasonToSport = async (sportId: string, season: Omit<Season, 'id'>) =>
  addDoc(collection(db, `sports/${sportId}/seasons`), { ...season, createdAt: serverTimestamp() });

export const loadSeasons = async (sportId: string): Promise<Season[]> => {
  const snap = await getDocs(collection(db, `sports/${sportId}/seasons`));
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as Season));
};

/* ---------- games ---------- */
export const loadGames = async () => {
  const [fixSnap, seasonalSnap] = await Promise.all([
    getDocs(collection(db, 'fixtures')),
    getDocs(query(collectionGroup(db, 'matches')))
  ]);

  const legacy = fixSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as Fixture));
  const seasonal = seasonalSnap.docs
    .filter((d: QueryDocumentSnapshot<DocumentData>) => d.ref.path.startsWith('fixtures/'))
    .map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as Fixture));

  const all = [...legacy, ...seasonal];
  return {
    live: all.filter(f => f.status === 'live'),
    upcoming: all.filter(f => f.status === 'scheduled'),
  };
};

export const loadLiveGames = async (): Promise<any[]> => {
  const liveSnap = await getDocs(collection(doc(db, 'admin'), 'liveGames'));
  return liveSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() }));
};

export const loadUpcomingGames = async (): Promise<any[]> => {
  const upcomingSnap = await getDocs(collection(doc(db, 'admin'), 'upcomingGames'));
  return upcomingSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() }));
};

export const addLiveGame = async (fixture: any) => {
  await addDoc(collection(doc(db, 'admin'), 'liveGames'), {
    fixtureId: fixture.id,
    ...fixture,
    predictions: { homeWinOdds: 0, drawOdds: 0, awayWinOdds: 0 },
    ranking: 0,
    createdAt: serverTimestamp()
  });
};

export const addUpcomingGame = async (fixture: any) => {
  await addDoc(collection(doc(db, 'admin'), 'upcomingGames'), {
    fixtureId: fixture.id,
    ...fixture,
    predictions: { homeWinOdds: 0, drawOdds: 0, awayWinOdds: 0 },
    ranking: 0,
    createdAt: serverTimestamp()
  });
};

export const updateLiveGame = async (id: string, data: any) => {
  await updateDoc(doc(db, 'admin', 'liveGames', id), data);
};

export const updateUpcomingGame = async (id: string, data: any) => {
  await updateDoc(doc(db, 'admin', 'upcomingGames', id), data);
};

export const deleteLiveGame = async (id: string) => {
  await deleteDoc(doc(db, 'admin', 'liveGames', id));
};

export const deleteUpcomingGame = async (id: string) => {
  await deleteDoc(doc(db, 'admin', 'upcomingGames', id));
};

// Sync function to update admin collections based on fixtures
export const syncAdminGameCollections = async () => {
  const fixturesSnap = await getDocs(collection(db, 'fixtures'));
  const fixtures = fixturesSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as Fixture));

  // Sync live games
  const liveGamesSnap = await getDocs(collection(doc(db, 'admin'), 'liveGames'));
  const existingLiveIds = liveGamesSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.data().fixtureId);
  for (const f of fixtures.filter((f: Fixture) => f.status === 'live')) {
    if (!existingLiveIds.includes(f.id)) {
      await addLiveGame(f);
    }
  }

  // Sync upcoming games
  const upcomingGamesSnap = await getDocs(collection(doc(db, 'admin'), 'upcomingGames'));
  const existingUpcomingIds = upcomingGamesSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.data().fixtureId);
  const today = new Date().toDateString();
  for (const f of fixtures.filter((f: Fixture) => new Date(f.scheduledAt).toDateString() === today && f.status === 'scheduled')) {
    if (!existingUpcomingIds.includes(f.id)) {
      await addUpcomingGame(f);
    }
  }

  // Optionally, remove old entries (e.g., completed games from live, past dates from upcoming)
  // For live, remove if fixture status is not live
  for (const doc of liveGamesSnap.docs) {
    const data = doc.data();
    const fixture = fixtures.find((f: Fixture) => f.id === data.fixtureId);
    if (!fixture || fixture.status !== 'live') {
      await deleteLiveGame(doc.id);
    }
  }

  // For upcoming, remove if not today or status changed
  for (const doc of upcomingGamesSnap.docs) {
    const data = doc.data();
    const fixture = fixtures.find((f: Fixture) => f.id === data.fixtureId);
    if (!fixture || new Date(fixture.scheduledAt).toDateString() !== today || fixture.status !== 'scheduled') {
      await deleteUpcomingGame(doc.id);
    }
  }
};

export const updateFixtureScore = async (id: string, home: number, away: number) =>
  updateDoc(doc(db, 'fixtures', id), { score: { home, away } });

export const startGame = async (id: string) =>
  updateDoc(doc(db, 'fixtures', id), { status: 'live' });

export const endGame = async (id: string) =>
  updateDoc(doc(db, 'fixtures', id), { status: 'completed' });

/* ---------- imported data ---------- */
export const loadImportedData = async (): Promise<ImportedData[]> => {
  const snap = await getDocs(collection(db, 'imported_data'));
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as ImportedData));
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
