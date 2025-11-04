import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  runTransaction,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { League, Group, Stage, Match, Participant } from '@/models';

class FirebaseLeagueService {
  async listMatches(leagueId: string, groupId: string, stageId: string): Promise<Match[]> {
    const snap = await getDocs(collection(db, `leagues/${leagueId}/groups/${groupId}/stages/${stageId}/matches`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
  }
  // ---------------- LEAGUE CRUD ---------------- //

  async createLeague(data: Omit<League, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, 'leagues'), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return ref.id;
  }

  async getLeague(leagueId: string): Promise<League | null> {
    const snap = await getDoc(doc(db, 'leagues', leagueId));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as League) : null;
  }

  async updateLeague(leagueId: string, data: Partial<League>) {
    await updateDoc(doc(db, 'leagues', leagueId), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteLeague(leagueId: string) {
    await deleteDoc(doc(db, 'leagues', leagueId));
  }

  async listLeagues(): Promise<League[]> {
    console.log("📥 Fetching leagues with nested structure (arrays)...");

    const leagues: League[] = [];

    try {
      console.log("🔍 Checking Firestore db instance:", db);
      const leaguesCollection = collection(db, "leagues");
      console.log("🔍 Leagues collection reference:", leaguesCollection);

      let leaguesSnap;
      try {
        leaguesSnap = await getDocs(leaguesCollection); // This line needs an 'await' context
        console.log("Documents fetched successfully!");

        if (leaguesSnap.empty) {
          console.log("No documents found in the 'leagues' collection.");
          return []; // Return an empty array if no documents
        }
        console.log(`📚 Found ${leaguesSnap.docs.length} leagues`);
        if (leaguesSnap.docs.length === 0) {
          console.warn("⚠️ No leagues found in Firestore. Check if data exists or permissions.");
        }
      } catch (getDocsError: any) {
        console.error("❌ getDocs failed:", getDocsError.message || getDocsError);
        console.error("❌ getDocs error code:", getDocsError.code);
        console.error("❌ Full getDocs error:", getDocsError);
        throw getDocsError;
      }

      for (const leagueDoc of leaguesSnap.docs) {
        const leagueData = leagueDoc.data();
        console.log(`🏆 Processing league: ${leagueDoc.id}`, leagueData);

        const groupsSnap = await getDocs(collection(leagueDoc.ref, "groups"));
        console.log(`📁 League ${leagueDoc.id} has ${groupsSnap.docs.length} groups`);
        const groups: Group[] = [];

        for (const groupDoc of groupsSnap.docs) {
          const groupData = groupDoc.data();

          const stagesSnap = await getDocs(collection(groupDoc.ref, "stages"));
          const stages: Stage[] = [];

          for (const stageDoc of stagesSnap.docs) {
            const stageData = stageDoc.data();

            const matchesSnap = await getDocs(collection(stageDoc.ref, "matches"));
            const matches: Match[] = [];

            for (const matchDoc of matchesSnap.docs) {
              const matchData = matchDoc.data();

              const participantsSnap = await getDocs(
                collection(matchDoc.ref, "participants")
              );

              const participants: Participant[] = participantsSnap.docs.map((pDoc) => {
                const d = pDoc.data();
                return {
                  id: pDoc.id,
                  refType: d.refType,
                  refId: d.refId,
                  score: d.score,
                  createdAt: d.createdAt?.toDate?.() ?? null,
                };
              });

              matches.push({
                id: matchDoc.id,
                matchNumber: matchData.matchNumber ?? 0,
                date: matchData.date?.toDate?.() ?? null,
                venue: matchData.venue,
                status: matchData.status,
                winnerId: matchData.winnerId ?? null,
                participants,
                createdAt: matchData.createdAt?.toDate?.() ?? null,
              });
            }

            stages.push({
              id: stageDoc.id,
              name: stageData.name,
              order: stageData.order ?? 0,
              type: stageData.type ?? "knockout",
              matches,
              createdAt: stageData.createdAt?.toDate?.() ?? null,
            });
          }

          groups.push({
            id: groupDoc.id,
            name: groupData.name,
            stages,
            createdAt: groupData.createdAt?.toDate?.() ?? null,
          });
        }

        leagues.push({
          id: leagueDoc.id,
          name: leagueData.name,
          sportType: leagueData.sportType,
          groups,
          createdAt: leagueData.createdAt?.toDate?.() ?? null,
          updatedAt: leagueData.updatedAt?.toDate?.() ?? null,
        });
      }

      console.log(`✅ Loaded ${leagues.length} leagues successfully.`);
      return leagues;
    } catch (e: any) {
      console.error("❌ Fetching leagues failed:", e.message || e);
      console.error("❌ Full error:", e);
      throw e;
    }
  }

  // ---------------- GROUP CRUD ---------------- //

  async createGroup(leagueId: string, group: Omit<Group, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, `leagues/${leagueId}/groups`), {
      ...group,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return ref.id;
  }

  async listGroups(leagueId: string): Promise<Group[]> {
    const snap = await getDocs(collection(db, `leagues/${leagueId}/groups`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Group));
  }

  // ---------------- STAGE CRUD ---------------- //

  async createStage(leagueId: string, groupId: string, stage: Omit<Stage, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, `leagues/${leagueId}/groups/${groupId}/stages`), {
      ...stage,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return ref.id;
  }

  async listStages(leagueId: string, groupId: string): Promise<Stage[]> {
    const snap = await getDocs(collection(db, `leagues/${leagueId}/groups/${groupId}/stages`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Stage));
  }

  // ---------------- MATCH CRUD ---------------- //

  async createMatch(leagueId: string, groupId: string, stageId: string, match: Omit<Match, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, `leagues/${leagueId}/groups/${groupId}/stages/${stageId}/matches`), {
      ...match,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return ref.id;
  }

  async updateMatch(leagueId: string, groupId: string, stageId: string, matchId: string, match: Partial<Match>) {
    await updateDoc(doc(db, `leagues/${leagueId}/groups/${groupId}/stages/${stageId}/matches/${matchId}`), {
      ...match,
      updatedAt: Timestamp.now(),
    });
  }

  async getMatch(leagueId: string, groupId: string, stageId: string, matchId: string): Promise<Match | null> {
    const snap = await getDoc(doc(db, `leagues/${leagueId}/groups/${groupId}/stages/${stageId}/matches/${matchId}`));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Match) : null;
  }

  // ---------------- MATCH LOGIC ---------------- //

  /**
   * Update scores and determine winner + points
   */
  async updateMatchScores(
    leagueId: string,
    groupId: string,
    stageId: string,
    matchId: string,
    updatedParticipants: Participant[],
  ) {
    await runTransaction(db, async (transaction) => {
      const matchRef = doc(db, `leagues/${leagueId}/groups/${groupId}/stages/${stageId}/matches/${matchId}`);
      const matchSnap = await transaction.get(matchRef);
      if (!matchSnap.exists()) throw new Error('Match not found');

      const match = matchSnap.data() as Match;
      match.participants = updatedParticipants;

      // Compute winner
      const sorted = [...updatedParticipants].sort((a, b) => b.score - a.score);
      const winner = sorted[0];
      const isDraw = sorted.length > 1 && sorted[0].score === sorted[1].score;

      transaction.update(matchRef, {
        participants: updatedParticipants,
        winnerId: isDraw ? null : winner.refId,
        status: 'completed',
        updatedAt: Timestamp.now(),
      });

      // Optionally update points table
      if (!isDraw) {
        const pointsRef = doc(db, `leagues/${leagueId}/groups/${groupId}/points/${winner.refId}`);
        const pointsSnap = await transaction.get(pointsRef);
        const newPoints = pointsSnap.exists()
          ? (pointsSnap.data().points || 0) + 3
          : 3;
        transaction.set(pointsRef, { points: newPoints }, { merge: true });
      } else {
        // draw => 1 point each
        for (const p of updatedParticipants) {
          const pointsRef = doc(db, `leagues/${leagueId}/groups/${groupId}/points/${p.refId}`);
          const pointsSnap = await transaction.get(pointsRef);
          const newPoints = pointsSnap.exists()
            ? (pointsSnap.data().points || 0) + 1
            : 1;
          transaction.set(pointsRef, { points: newPoints }, { merge: true });
        }
      }
    });
  }

  // ---------------- POINTS ---------------- //

  async getPointsTable(leagueId: string, groupId: string): Promise<{ refId: string; points: number }[]> {
    const snap = await getDocs(collection(db, `leagues/${leagueId}/groups/${groupId}/points`));
    return snap.docs.map((d) => ({ refId: d.id, ...d.data() })) as { refId: string; points: number }[];
  }
}

export const firebaseLeagueService = new FirebaseLeagueService();
