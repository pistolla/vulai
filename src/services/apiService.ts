import { Sport, Team, Match } from '../types';
import { db } from "./firebase"; // your initialized Firestore
import {
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
  addDoc,
  query,
  collectionGroup,
  onSnapshot
} from "firebase/firestore";
import { CacheService } from './CacheService';

export interface HomeData {
  sports: Sport[];
  matches: Match[];
  stats: {
    sportsPrograms: number;
    studentAthletes: number;
    championships: number;
    facilities: number;
  };
}

export interface SportsData {
  sports: Sport[];
  trainingSchedule: Array<{
    day: string;
    activity: string;
    time: string;
  }>;
}

export interface TeamsData {
  teams: Team[];
}

export interface ScheduleData {
  matches: Match[];
  stats: {
    totalMatches: number;
    liveNow: number;
    homeGames: number;
    expectedAttendance: number;
  };
}

export interface AdminData {
  dashboard: {
    stats: {
      users: number;
      liveGames: number;
      merchSales: number;
      pendingReviews: number;
    };
    liveGames: any[];
    upcomingGames: any[];
    recentUsers: any[];
  };
  users: any[];
  merchandise: any[];
  reviews: any[];
}



export class ApiService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    if (typeof window === 'undefined') return;

    // Listen to collections and clear related cache keys
    const collectionsToWatch = [
      { name: 'home', cacheKey: '/api/home' },
      { name: 'sports', cacheKey: '/api/sports' },
      { name: 'teams', cacheKey: '/api/teams' },
      { name: 'universities', cacheKey: '/api/teams/universities' },
      { name: 'schedule', cacheKey: '/api/schedule' },
      { name: 'players', cacheKey: '/api/players' },
      { name: 'admin', cacheKey: '/api/admin' },
      { name: 'merchandise', cacheKey: '/api/admin' },
      { name: 'users', cacheKey: '/api/admin' }, // Users list is often in Admin data
      { name: 'reviews', cacheKey: '/api/admin' },
      { name: 'games', cacheKey: '/api/schedule' }, // Game changes affect schedule
      { name: 'teamApplications', cacheKey: '/api/admin' }
    ];

    collectionsToWatch.forEach(col => {
      const unsub = onSnapshot(collection(db, col.name), () => {
        console.log(`ApiService: Invalidating cache for ${col.cacheKey} due to change in ${col.name}`);
        CacheService.remove(col.cacheKey);
      }, (error) => {
        console.warn(`ApiService: Listener failed for ${col.name}`, error);
      });
      this.listeners.push(unsub);
    });

    // Special case for fixtures (collectionGroup matches)
    const unsubFixtures = onSnapshot(query(collectionGroup(db, 'matches')), () => {
      console.log('ApiService: Invalidating cache for /api/fixtures');
      CacheService.remove('/api/fixtures');
    });
    this.listeners.push(unsubFixtures);
  }

  private async fetchWithCaching<T>(endpoint: string): Promise<T> {
    const startTime = performance.now();
    console.group(`ApiService: Query [${endpoint}]`);

    // 1. Check Cache
    const cached = CacheService.get<T>(endpoint);
    if (cached) {
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(`[Stage 1/2] Cache HIT - Duration: ${duration}ms`);
      console.groupEnd();
      return cached;
    }
    console.log(`[Stage 1/2] Cache MISS`);

    try {
      // 2. Try Firebase first with timeout
      console.log(`[Stage 2/2] Firebase Fetch START`);
      const firebaseStartTime = performance.now();

      const firebasePromise = this.fetchFromFirebase<T>(endpoint);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase timeout')), 5000)
      );

      const result = await Promise.race([firebasePromise, timeoutPromise]);
      const firebaseDuration = (performance.now() - firebaseStartTime).toFixed(2);
      console.log(`[Stage 2/2] Firebase Fetch SUCCESS - Duration: ${firebaseDuration}ms`);

      // 3. Save to Cache on success
      CacheService.set(endpoint, result);
      console.log(`[Stage 2/2] Cache UPDATE complete`);

      const totalDuration = (performance.now() - startTime).toFixed(2);
      console.log(`Total Query Duration: ${totalDuration}ms`);
      console.groupEnd();
      return result;
    } catch (firebaseError) {
      const duration = (performance.now() - startTime).toFixed(2);
      console.warn(`[Stage 2/2] Firebase Fetch FAILED after ${duration}ms - Error:`, firebaseError);

      // Return default empty state instead of crashing
      console.log(`[Final Stage] Serving default empty state for ${endpoint}`);
      const defaultData = this.getDefaultData<T>(endpoint);
      console.groupEnd();
      return defaultData;
    }
  }

  private getDefaultData<T>(endpoint: string): T {
    const defaults: Record<string, any> = {
      "/api/home": {
        sports: [],
        matches: [],
        stats: { sportsPrograms: 0, studentAthletes: 0, championships: 0, facilities: 0 }
      },
      "/api/sports": { sports: [], trainingSchedule: [] },
      "/api/teams": { teams: [] },
      "/api/teams/universities": { universities: [] },
      "/api/schedule": {
        matches: [],
        stats: { totalMatches: 0, liveNow: 0, homeGames: 0, expectedAttendance: 0 }
      },
      "/api/fixtures": [],
      "/api/players": { players: [] },
      "/api/admin": {
        dashboard: {
          stats: { users: 0, liveGames: 0, merchSales: 0, pendingReviews: 0 },
          liveGames: [],
          upcomingGames: [],
          recentUsers: []
        },
        users: [],
        merchandise: [],
        reviews: []
      },
      "/api/admin/universities": { universities: [] },
      "/api/team/universities": { universities: [] }
    };

    return (defaults[endpoint] || {}) as T;
  }

  private async fetchFromFirebase<T>(endpoint: string): Promise<T> {
    let result: any;

    switch (endpoint) {
      case "/api/home": {
        const snap = await getDoc(doc(db, "home", "main"));
        result = snap.exists() ? snap.data() : null;
        // Ensure arrays are arrays
        if (result) {
          if (!Array.isArray(result.sports)) result.sports = [];
          if (!Array.isArray(result.matches)) result.matches = [];
          if (!result.stats) result.stats = { sportsPrograms: 0, studentAthletes: 0, championships: 0, facilities: 0 };
        }
        break;
      }

      case "/api/sports": {
        const snap = await getDocs(collection(db, "sports"));
        if (snap.docs.length === 0) {
          result = { sports: [], trainingSchedule: [] };
        } else if (snap.docs.length === 1 && snap.docs[0].data().sports) {
          // If single document has sports field
          result = snap.docs[0].data();
        } else {
          // Multiple documents, each is a sport
          result = { sports: snap.docs.map(d => d.data()), trainingSchedule: [] };
        }
        break;
      }

      case "/api/teams": {
        const snap = await getDocs(collection(db, "teams"));
        result = { teams: snap.docs.map(d => d.data()) };
        break;
      }

      case "/api/teams/universities": {
        const snap = await getDocs(collection(db, "universities"));
        result = { universities: snap.docs.map(d => d.data()) };
        break;
      }

      case "/api/schedule": {
        const snap = await getDocs(collection(db, "schedule"));
        result = {
          matches: snap.docs.map(d => d.data()),
          stats: {
            totalMatches: snap.docs.length,
            liveNow: snap.docs.filter(d => d.data().status === 'live').length,
            homeGames: snap.docs.filter(d => d.data().venue?.includes('Home')).length,
            expectedAttendance: snap.docs.length * 1000
          }
        };
        break;
      }

      case "/api/fixtures": {
        // Query across all seasonal subcollections: fixtures/{seasonName}/matches
        // To avoid conflicts with league matches, we look for matches that are children of 'fixtures'
        // For now, we fetch all and filter or rely on the fact that public root fixtures are what we want.
        const snap = await getDocs(collection(db, "fixtures"));
        // This only gets legacy flat fixtures. 
        // We also need seasonal ones.
        const seasonalSnap = await getDocs(query(collectionGroup(db, 'matches')));

        const legacy = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const seasonal = seasonalSnap.docs
          .filter(d => d.ref.path.startsWith('fixtures/'))
          .map(d => ({ id: d.id, ...d.data() }));

        result = [...legacy, ...seasonal];
        break;
      }

      case "/api/players": {
        const snap = await getDocs(collection(db, "players"));
        result = { players: snap.docs.map(d => d.data()) };
        break;
      }

      case "/api/admin": {
        const snap = await getDoc(doc(db, "admin", "dashboard"));
        result = snap.exists() ? snap.data() : null;
        break;
      }

      case "/api/admin/universities": {
        const snap = await getDocs(collection(db, "universities"));
        result = { universities: snap.docs.map(d => d.data()) };
        break;
      }

      default:
        throw new Error(`Unknown Firebase endpoint: ${endpoint}`);
    }

    if (!result) throw new Error("No data found in Firebase");
    return result as T;
  }

  // 🔹 Data retrieval methods
  async getHomeData(): Promise<HomeData> {
    return this.fetchWithCaching<HomeData>("/api/home");
  }

  async getSportsData(): Promise<SportsData> {
    return this.fetchWithCaching<SportsData>("/api/sports");
  }

  async getTeamsData(): Promise<TeamsData> {
    return this.fetchWithCaching<TeamsData>("/api/teams");
  }

  async getScheduleData(): Promise<ScheduleData> {
    return this.fetchWithCaching<ScheduleData>("/api/schedule");
  }

  async getAdminData(): Promise<AdminData> {
    return this.fetchWithCaching<AdminData>("/api/admin");
  }

  async getUniversities(): Promise<any[]> {
    const data = await this.fetchWithCaching<any>("/api/admin/universities");
    return data.universities || [];
  }

  async getTeams(): Promise<any[]> {
    const data = await this.fetchWithCaching<any>("/api/teams");
    return data.teams || [];
  }

  async getUniversityData(): Promise<any[]> {
    const data = await this.fetchWithCaching<any>("/api/team/universities");
    return data.universities || [];
  }

  async getSchedule(): Promise<any[]> {
    const data = await this.fetchWithCaching<any>("/api/schedule");
    return data.matches || [];
  }

  async getFixtures(): Promise<any[]> {
    return this.fetchWithCaching<any[]>("/api/fixtures");
  }

  async getSports(): Promise<any[]> {
    const data = await this.fetchWithCaching<any>("/api/sports");
    return data.sports || [];
  }

  async getPlayers(): Promise<any[]> {
    const data = await this.fetchWithCaching<any>("/api/players");
    return data.players || [];
  }

  // 🔹 Admin CRUD operations
  async createUser(userData: any): Promise<void> {
    console.log(`ApiService: [CRUD] Creating user in Firebase - uid: ${userData.uid}`);
    await setDoc(doc(db, "users", userData.uid), userData);
  }

  async updateUser(uid: string, userData: any): Promise<void> {
    console.log(`ApiService: [CRUD] Updating user in Firebase - uid: ${uid}`);
    await updateDoc(doc(db, "users", uid), userData);
  }

  async deleteUser(uid: string): Promise<void> {
    console.log(`ApiService: [CRUD] Deleting user in Firebase - uid: ${uid}`);
    await deleteDoc(doc(db, "users", uid));
  }

  async createMerchandise(item: any): Promise<void> {
    console.log(`ApiService: [CRUD] Creating merchandise in Firebase`);
    await addDoc(collection(db, "merchandise"), item);
  }

  async updateMerchandise(id: string, item: any): Promise<void> {
    console.log(`ApiService: [CRUD] Updating merchandise in Firebase - id: ${id}`);
    await updateDoc(doc(db, "merchandise", id), item);
  }

  async deleteMerchandise(id: string): Promise<void> {
    console.log(`ApiService: [CRUD] Deleting merchandise in Firebase - id: ${id}`);
    await deleteDoc(doc(db, "merchandise", id));
  }

  async approveReview(id: string): Promise<void> {
    console.log(`ApiService: [CRUD] Approving review in Firebase - id: ${id}`);
    await updateDoc(doc(db, "reviews", id), { status: "approved" });
  }

  async rejectReview(id: string): Promise<void> {
    console.log(`ApiService: [CRUD] Rejecting review in Firebase - id: ${id}`);
    await updateDoc(doc(db, "reviews", id), { status: "rejected" });
  }

  async updateGameScore(id: string, homeScore: number, awayScore: number): Promise<void> {
    console.log(`ApiService: [CRUD] Updating game score in Firebase - id: ${id}`);
    await updateDoc(doc(db, "games", id), { homeScore, awayScore });
  }

  async startGame(id: string): Promise<void> {
    console.log(`ApiService: [CRUD] Starting game in Firebase - id: ${id}`);
    await updateDoc(doc(db, "games", id), { status: "started" });
  }

  async endGame(id: string): Promise<void> {
    console.log(`ApiService: [CRUD] Ending game in Firebase - id: ${id}`);
    await updateDoc(doc(db, "games", id), { status: "ended" });
  }

  async submitTeamApplication(data: any): Promise<void> {
    console.log(`ApiService: [CRUD] Submitting team application in Firebase`);
    await addDoc(collection(db, "teamApplications"), data);
  }
}


export const apiService = new ApiService();