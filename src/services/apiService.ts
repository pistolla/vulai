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
  /**
   * Universal Firestore fetch handler.
   * The `endpoint` param decides which document or collection to read.
   */
  private async fetchWithFallback<T>(endpoint: string, fallbackPath: string): Promise<T> {
    try {
      let result: any;

      switch (endpoint) {
        case "/api/home": {
          const snap = await getDoc(doc(db, "home", "main"));
          result = snap.exists() ? snap.data() : null;
          break;
        }

        case "/api/sports": {
          const snap = await getDocs(collection(db, "sports"));
          result = snap.docs.map(d => d.data());
          break;
        }

        case "/api/teams": {
          const snap = await getDocs(collection(db, "teams"));
          result = snap.docs.map(d => d.data());
          break;
        }

        case "/api/schedule": {
          const snap = await getDocs(collection(db, "schedule"));
          result = snap.docs.map(d => d.data());
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
    } catch (error) {
      console.warn(`Firestore fetch failed for ${endpoint}, using fallback:`, error);
      const response = await fetch(fallbackPath);
      return (await response.json()) as T;
    }
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

  async getSchedule(): Promise<any[]> {
    const data = await this.fetchWithFallback<any>("/api/schedule", "/data/schedule.json");
    return data.matches || [];
  }

  async getSports(): Promise<any[]> {
    const data = await this.fetchWithFallback<any>("/api/sports", "/data/sports.json");
    return data.sports || [];
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