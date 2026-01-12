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
    console.log("📥 Fetching leagues...");

    try {
      const snap = await getDocs(collection(db, 'leagues'));
      const leagues = snap.docs.map((d) => ({ id: d.id, ...d.data() } as League));
      console.log(`✅ Fetched ${leagues.length} leagues`);
      return leagues;
    } catch (e: any) {
      console.error("❌ Fetching leagues failed:", e.message || e);
      return [];
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

  async updateMatchParticipants(leagueId: string, groupId: string, stageId: string, matchId: string, participants: Participant[]) {
    await this.updateMatch(leagueId, groupId, stageId, matchId, { participants });
  }

  async getMatch(leagueId: string, groupId: string, stageId: string, matchId: string): Promise<Match | null> {
    const snap = await getDoc(doc(db, `leagues/${leagueId}/groups/${groupId}/stages/${stageId}/matches/${matchId}`));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Match) : null;
  }

  async findMatchById(matchId: string): Promise<Match | null> {
    // Since matches are nested, we need to search across all leagues/groups/stages
    // This is not efficient but works for the demo
    try {
      const leaguesSnap = await getDocs(collection(db, 'leagues'));
      for (const leagueDoc of leaguesSnap.docs) {
        const groupsSnap = await getDocs(collection(db, `leagues/${leagueDoc.id}/groups`));
        for (const groupDoc of groupsSnap.docs) {
          const stagesSnap = await getDocs(collection(db, `leagues/${leagueDoc.id}/groups/${groupDoc.id}/stages`));
          for (const stageDoc of stagesSnap.docs) {
            const matchSnap = await getDoc(doc(db, `leagues/${leagueDoc.id}/groups/${groupDoc.id}/stages/${stageDoc.id}/matches/${matchId}`));
            if (matchSnap.exists()) {
              return { id: matchSnap.id, ...matchSnap.data() } as Match;
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to find match by id:', error);
      return null;
    }
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
