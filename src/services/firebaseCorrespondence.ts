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
  collectionGroup,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { League, Group, Stage, Match, Participant, Season, Fixture } from '@/models';

class FirebaseLeagueService {
  async listMatches(leagueId: string, groupId: string, stageId: string): Promise<Match[]> {
    const snap = await getDocs(collection(db, `leagues/${leagueId}/groups/${groupId}/stages/${stageId}/matches`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
  }

  async listSeasons(sportId: string): Promise<Season[]> {
    const snap = await getDocs(collection(db, `sports/${sportId}/seasons`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Season));
  }

  // Fallback: Try to get seasons from root-level seasons collection
  async listSeasonsFromRoot(sportId: string): Promise<Season[]> {
    try {
      const q = query(collection(db, 'seasons'), where('sportId', '==', sportId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Season));
    } catch (e) {
      // If query fails (collection doesn't exist or no index), try getting all
      console.warn('listSeasonsFromRoot query failed, trying collection scan:', e);
      try {
        const snap = await getDocs(collection(db, 'seasons'));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Season & { sportId?: string; sport?: string }));
        return data.filter(s => s.sportId === sportId || s.sport === sportId);
      } catch (e2) {
        console.warn('listSeasonsFromRoot collection scan failed:', e2);
        return [];
      }
    }
  }

  // Fallback: Try to get seasons by sport name
  async listSeasonsBySportName(sportName: string): Promise<Season[]> {
    try {
      const q = query(collection(db, 'seasons'), where('sport', '==', sportName));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Season));
    } catch (e) {
      console.warn('listSeasonsBySportName query failed:', e);
      return [];
    }
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

  async listLeagues(): Promise<League[]> {
    try {
      const snap = await getDocs(collection(db, 'leagues'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as League));
    } catch (e) {
      console.warn("Firestore: 'leagues' collection missing or inaccessible.", e);
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

  async updateStage(leagueId: string, groupId: string, stageId: string, data: Partial<Stage>) {
    await updateDoc(doc(db, `leagues/${leagueId}/groups/${groupId}/stages/${stageId}`), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteStage(leagueId: string, groupId: string, stageId: string) {
    await deleteDoc(doc(db, `leagues/${leagueId}/groups/${groupId}/stages/${stageId}`));
  }

  // ---------------- SUBGROUP CRUD ---------------- //

  async createSubGroup(leagueId: string, groupId: string, subGroup: Omit<Group, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, `leagues/${leagueId}/groups/${groupId}/subgroups`), {
      ...subGroup,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return ref.id;
  }

  async listSubGroups(leagueId: string, groupId: string): Promise<Group[]> {
    const snap = await getDocs(collection(db, `leagues/${leagueId}/groups/${groupId}/subgroups`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Group));
  }

  // ---------------- MATCH CRUD ---------------- //

  /**
   * Create a match in a league structure and also create a fixture in seasonal path
   * League path: leagues/{leagueId}/groups/{groupId}/stages/{stageId}/matches/{matchId}
   * Fixture path: fixtures/{seasonId}/matches/{matchId}
   */
  async createMatch(leagueId: string, groupId: string, stageId: string, match: Omit<Match, 'id'>, seasonId?: string): Promise<string> {
    const ref = await addDoc(collection(db, `leagues/${leagueId}/groups/${groupId}/stages/${stageId}/matches`), {
      ...match,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Also create a root fixture for public landing/schedule
    // Use seasonal collection path: fixtures/{seasonId}/matches
    const finalSeasonId = seasonId || match.seasonId;
    
    if (finalSeasonId) {
      // Create fixture in seasonal path
      await setDoc(doc(db, `fixtures/${finalSeasonId}/matches`, ref.id), {
        ...match,
        id: ref.id,
        matchId: ref.id,
        leagueId,
        groupId,
        stageId,
        seasonId: finalSeasonId,
        approved: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

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

  async deleteMatch(leagueId: string, groupId: string, stageId: string, matchId: string) {
    await deleteDoc(doc(db, `leagues/${leagueId}/groups/${groupId}/stages/${stageId}/matches/${matchId}`));
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

      // Update points table (with seasonal isolation)
      // Path: leagues/{leagueId}/seasons/{seasonId}/groups/{groupId}/points
      // Fallback (legacy): leagues/{leagueId}/groups/{groupId}/points
      const pointsPath = (match.seasonId)
        ? `leagues/${leagueId}/seasons/${match.seasonId}/groups/${groupId}/points`
        : `leagues/${leagueId}/groups/${groupId}/points`;

      if (!isDraw) {
        const pointsRef = doc(db, `${pointsPath}/${winner.refId}`);
        const pointsSnap = await transaction.get(pointsRef);
        const newPoints = pointsSnap.exists()
          ? (pointsSnap.data().points || 0) + 3
          : 3;
        transaction.set(pointsRef, { points: newPoints }, { merge: true });
      } else {
        // draw => 1 point each
        for (const p of updatedParticipants) {
          const pointsRef = doc(db, `${pointsPath}/${p.refId}`);
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

  async getPointsTable(leagueId: string, groupId: string, seasonId?: string): Promise<any[]> {
    const pointsPath = (seasonId)
      ? `leagues/${leagueId}/seasons/${seasonId}/groups/${groupId}/points`
      : `leagues/${leagueId}/groups/${groupId}/points`;

    const snap = await getDocs(collection(db, pointsPath));
    return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ refId: d.id, ...d.data() })) as any[];
  }

  async updatePoints(leagueId: string, groupId: string, refId: string, stats: any, seasonId?: string) {
    const pointsPath = (seasonId)
      ? `leagues/${leagueId}/seasons/${seasonId}/groups/${groupId}/points`
      : `leagues/${leagueId}/groups/${groupId}/points`;

    await setDoc(doc(db, `${pointsPath}/${refId}`), stats, { merge: true });
  }

  async getCommentary(fixtureId: string): Promise<any | null> {
    const snap = await getDoc(doc(db, 'commentaries', fixtureId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  // ---------------- FIXTURES (Seasonal) ---------------- //

  /**
   * List fixtures for a specific season
   * Path: fixtures/{seasonId}/matches
   */
  async listFixtures(seasonId: string): Promise<Fixture[]> {
    const snap = await getDocs(collection(db, `fixtures/${seasonId}/matches`));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Fixture));
  }

  /**
   * List all fixtures across all seasons for a correspondent
   * Uses collectionGroup to fetch all fixtures from fixtures/{seasonId}/matches
   */
  async listAllFixturesAcrossSeasons(correspondentId: string): Promise<Fixture[]> {
    // Use collectionGroup to query all 'matches' subcollections under 'fixtures'
    const fixtures: Fixture[] = [];
    
    try {
      // Query all matches subcollections under fixtures using collectionGroup
      const fixturesQuery = query(
        collectionGroup(db, 'matches'),
        where('correspondentId', '==', correspondentId)
      );
      const snap = await getDocs(fixturesQuery);
      
      // Filter to only include documents from the fixtures/{seasonId}/matches path
      // by checking if the parent collection is 'fixtures'
      for (const doc of snap.docs) {
        const pathParts = doc.ref.path.split('/');
        if (pathParts[0] === 'fixtures' && pathParts.length >= 4) {
          fixtures.push({ id: doc.id, ...doc.data() } as Fixture);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch fixtures using collectionGroup, falling back to iteration:', error);
      
      // Fallback: iterate over all sports and seasons
      const sportsSnap = await getDocs(collection(db, 'sports'));
      for (const sportDoc of sportsSnap.docs) {
        const seasonsSnap = await getDocs(collection(db, `sports/${sportDoc.id}/seasons`));
        for (const seasonDoc of seasonsSnap.docs) {
          const seasonFixtures = await this.listFixtures(seasonDoc.id);
          fixtures.push(...seasonFixtures.filter(f => f.correspondentId === correspondentId));
        }
      }
    }

    // Also check legacy root fixtures (for backward compatibility)
    try {
      const legacySnap = await getDocs(query(collection(db, 'fixtures'), where('correspondentId', '==', correspondentId)));
      fixtures.push(...legacySnap.docs.filter(d => !d.ref.path.includes('/matches')).map(d => ({ id: d.id, ...d.data() } as Fixture)));
    } catch (e) {
      // Legacy fixtures collection may not exist
    }

    return fixtures;
  }

  /**
   * Create a standalone fixture in a seasonal path
   * Path: fixtures/{seasonId}/matches
   * If matchId is provided (league match), create bidirectional linking with the match
   */
  async createFixture(seasonId: string, fixture: Omit<Fixture, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, `fixtures/${seasonId}/matches`), {
      ...fixture,
      seasonId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    // Ensure ID is inside the object
    await updateDoc(ref, { id: ref.id });

    // If this is a league match with a matchId, create bidirectional linking
    if (fixture.matchId && fixture.leagueId && fixture.groupId && fixture.stageId) {
      try {
        const matchRef = doc(db, `leagues/${fixture.leagueId}/groups/${fixture.groupId}/stages/${fixture.stageId}/matches/${fixture.matchId}`);
        await updateDoc(matchRef, {
          fixtureId: ref.id,
          updatedAt: Timestamp.now(),
        });
      } catch (error) {
        console.error('Failed to link fixture to match:', error);
      }
    }

    return ref.id;
  }

  /**
   * Update a fixture in a seasonal path
   * Path: fixtures/{seasonId}/matches/{fixtureId}
   */
  async updateFixture(seasonId: string, fixtureId: string, data: Partial<Fixture>) {
    const path = seasonId ? `fixtures/${seasonId}/matches/${fixtureId}` : `fixtures/${fixtureId}`;
    await updateDoc(doc(db, path), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async advanceWinner(leagueId: string, winnerRefId: string, winnerName: string, nextMatchId: string, slot: number = 0) {
    const leaguesSnap = await getDocs(collection(db, 'leagues'));
    for (const leagueDoc of leaguesSnap.docs) {
      if (leagueDoc.id !== leagueId) continue;
      const groupsSnap = await getDocs(collection(db, `leagues/${leagueDoc.id}/groups`));
      for (const groupDoc of groupsSnap.docs) {
        const stagesSnap = await getDocs(collection(db, `leagues/${leagueDoc.id}/groups/${groupDoc.id}/stages`));
        for (const stageDoc of stagesSnap.docs) {
          const matchRef = doc(db, `leagues/${leagueDoc.id}/groups/${groupDoc.id}/stages/${stageDoc.id}/matches/${nextMatchId}`);
          const matchSnap = await getDoc(matchRef);

          if (matchSnap.exists()) {
            const matchData = matchSnap.data() as Match;
            const participants = [...(matchData.participants || [])];
            participants[slot] = {
              refType: 'team',
              refId: winnerRefId,
              name: winnerName,
              score: 0
            };
            await updateDoc(matchRef, { participants });
            return;
          }
        }
      }
    }
  }

  /**
   * Get league statistics: groups, stages, matches, participants counts
   */
  async getLeagueStats(leagueId: string): Promise<{
    totalGroups: number;
    totalStages: number;
    totalMatches: number;
    totalParticipants: number;
    updatedAt: string | null;
  }> {
    let totalGroups = 0;
    let totalStages = 0;
    let totalMatches = 0;
    let totalParticipants = 0;
    let updatedAt: string | null = null;

    try {
      const groupsSnap = await getDocs(collection(db, `leagues/${leagueId}/groups`));
      totalGroups = groupsSnap.size;

      for (const groupDoc of groupsSnap.docs) {
        const stagesSnap = await getDocs(collection(db, `leagues/${leagueId}/groups/${groupDoc.id}/stages`));
        totalStages += stagesSnap.size;

        for (const stageDoc of stagesSnap.docs) {
          const matchesSnap = await getDocs(collection(db, `leagues/${leagueId}/groups/${groupDoc.id}/stages/${stageDoc.id}/matches`));
          totalMatches += matchesSnap.size;

          for (const matchDoc of matchesSnap.docs) {
            const matchData = matchDoc.data() as Match;
            totalParticipants += matchData.participants?.length || 0;
          }
        }
      }

      // Get league's updatedAt
      const leagueSnap = await getDoc(doc(db, 'leagues', leagueId));
      if (leagueSnap.exists()) {
        updatedAt = leagueSnap.data().updatedAt?.toDate?.()?.toISOString() || leagueSnap.data().updatedAt || null;
      }
    } catch (error) {
      console.error('Failed to get league stats:', error);
    }

    return { totalGroups, totalStages, totalMatches, totalParticipants, updatedAt };
  }

  /**
   * Get total fixtures for a league
   */
  async getLeagueFixturesCount(leagueId: string): Promise<number> {
    try {
      const fixturesQuery = query(
        collection(db, 'fixtures'),
        where('leagueId', '==', leagueId)
      );
      const fixturesSnap = await getDocs(fixturesQuery);
      return fixturesSnap.size;
    } catch (error) {
      console.error('Failed to get league fixtures count:', error);
      return 0;
    }
  }

  /**
   * Hide/unhide a league
   */
  async toggleLeagueVisibility(leagueId: string, isHidden: boolean) {
    await updateDoc(doc(db, 'leagues', leagueId), {
      isHidden,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Delete a league and all its subcollections
   */
  async deleteLeague(leagueId: string) {
    try {
      // Delete all groups, stages, and matches recursively
      const groupsSnap = await getDocs(collection(db, `leagues/${leagueId}/groups`));
      
      for (const groupDoc of groupsSnap.docs) {
        const stagesSnap = await getDocs(collection(db, `leagues/${leagueId}/groups/${groupDoc.id}/stages`));
        
        for (const stageDoc of stagesSnap.docs) {
          const matchesSnap = await getDocs(collection(db, `leagues/${leagueId}/groups/${groupDoc.id}/stages/${stageDoc.id}/matches`));
          
          for (const matchDoc of matchesSnap.docs) {
            await deleteDoc(matchDoc.ref);
          }
          
          await deleteDoc(stageDoc.ref);
        }
        
        await deleteDoc(groupDoc.ref);
      }

      // Delete the league itself
      await deleteDoc(doc(db, 'leagues', leagueId));
    } catch (error) {
      console.error('Failed to delete league:', error);
      throw error;
    }
  }
}

export const firebaseLeagueService = new FirebaseLeagueService();
