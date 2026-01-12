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
} from "firebase/firestore";

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
 
  private async fetchWithFallback<T>(endpoint: string, fallbackPath: string): Promise<T> {
    try {
      // Try Firebase first with timeout
      const firebasePromise = this.fetchFromFirebase<T>(endpoint);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase timeout')), 5000)
      );

      const result = await Promise.race([firebasePromise, timeoutPromise]);
      return result;
    } catch (firebaseError) {
      console.warn(`Firebase fetch failed for ${endpoint}, falling back to JSON:`, firebaseError);
      // Fallback to JSON file
      try {
        const response = await fetch(fallbackPath, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return (await response.json()) as T;
      } catch (fallbackError) {
        console.error(`Fallback fetch also failed for ${endpoint}:`, fallbackError);
        throw new Error(`Failed to load data from both Firebase and fallback for ${endpoint}`);
      }
    }
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
        const snap = await getDocs(collection(db, "fixture"));
        result = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
    return this.fetchWithFallback<HomeData>("/api/home", "/data/home.json");
  }

  async getSportsData(): Promise<SportsData> {
    return this.fetchWithFallback<SportsData>("/api/sports", "/data/sports.json");
  }

  async getTeamsData(): Promise<TeamsData> {
    return this.fetchWithFallback<TeamsData>("/api/teams", "/data/teams.json");
  }

  async getScheduleData(): Promise<ScheduleData> {
    return this.fetchWithFallback<ScheduleData>("/api/schedule", "/data/schedule.json");
  }

  async getAdminData(): Promise<AdminData> {
    return this.fetchWithFallback<AdminData>("/api/admin", "/data/admin.json");
  }

  async getUniversities(): Promise<any[]> {
    const data = await this.fetchWithFallback<any>("/api/admin/universities", "/data/universities.json");
    return data.universities || [];
  }

  async getTeams(): Promise<any[]> {
    const data = await this.fetchWithFallback<any>("/api/teams", "/data/teams.json");
    return data.teams || [];
  }

  async getUniversityData(): Promise<any[]> {
    const data = await this.fetchWithFallback<any>("/api/team/universities", "/data/universities.json");
    return data.universities || [];
  }

  async getSchedule(): Promise<any[]> {
    const data = await this.fetchWithFallback<any>("/api/schedule", "/data/schedule.json");
    return data.matches || [];
  }

  async getFixtures(): Promise<any[]> {
    return this.fetchWithFallback<any[]>("/api/fixtures", "/data/schedule.json");
  }

  async getSports(): Promise<any[]> {
    const data = await this.fetchWithFallback<any>("/api/sports", "/data/sports.json");
    return data.sports || [];
  }

  async getPlayers(): Promise<any[]> {
    const data = await this.fetchWithFallback<any>("/api/players", "/data/players.json");
    return data.players || [];
  }

  // 🔹 Admin CRUD operations
  async createUser(userData: any): Promise<void> {
    await setDoc(doc(db, "users", userData.uid), userData);
  }

  async updateUser(uid: string, userData: any): Promise<void> {
    await updateDoc(doc(db, "users", uid), userData);
  }

  async deleteUser(uid: string): Promise<void> {
    await deleteDoc(doc(db, "users", uid));
  }

  async createMerchandise(item: any): Promise<void> {
    await addDoc(collection(db, "merchandise"), item);
  }

  async updateMerchandise(id: string, item: any): Promise<void> {
    await updateDoc(doc(db, "merchandise", id), item);
  }

  async deleteMerchandise(id: string): Promise<void> {
    await deleteDoc(doc(db, "merchandise", id));
  }

  async approveReview(id: string): Promise<void> {
    await updateDoc(doc(db, "reviews", id), { status: "approved" });
  }

  async rejectReview(id: string): Promise<void> {
    await updateDoc(doc(db, "reviews", id), { status: "rejected" });
  }

  async updateGameScore(id: string, homeScore: number, awayScore: number): Promise<void> {
    await updateDoc(doc(db, "games", id), { homeScore, awayScore });
  }

  async startGame(id: string): Promise<void> {
    await updateDoc(doc(db, "games", id), { status: "started" });
  }

  async endGame(id: string): Promise<void> {
    await updateDoc(doc(db, "games", id), { status: "ended" });
  }

  async submitTeamApplication(data: any): Promise<void> {
    await addDoc(collection(db, "teamApplications"), data);
  }
}


export const apiService = new ApiService();