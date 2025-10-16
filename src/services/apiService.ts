import { Sport, Team, Match } from '../types';

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

class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  private async fetchWithFallback<T>(endpoint: string, fallbackPath: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`API call failed for ${endpoint}, loading fallback data:`, error);
      // Load fallback JSON file
      const fallbackResponse = await fetch(fallbackPath);
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback data not found: ${fallbackPath}`);
      }
      return await fallbackResponse.json();
    }
  }

  async getHomeData(): Promise<HomeData> {
    return this.fetchWithFallback<HomeData>('/api/home', '/data/home.json');
  }

  async getSportsData(): Promise<SportsData> {
    return this.fetchWithFallback<SportsData>('/api/sports', '/data/sports.json');
  }

  async getTeamsData(): Promise<TeamsData> {
    return this.fetchWithFallback<TeamsData>('/api/teams', '/data/teams.json');
  }

  async getScheduleData(): Promise<ScheduleData> {
    return this.fetchWithFallback<ScheduleData>('/api/schedule', '/data/schedule.json');
  }

  async getAdminData(): Promise<AdminData> {
    return this.fetchWithFallback<AdminData>('/api/admin', '/data/admin.json');
  }

  async getUniversities(): Promise<any[]> {
    return this.fetchWithFallback<any>('/api/admin/universities', '/data/universities.json').then(data => data.universities || []);
  }

  async getTeams(): Promise<any[]> {
    return this.fetchWithFallback<any>('/api/admin/teams', '/data/teams.json').then(data => data.teams || []);
  }

  async getSchedule(): Promise<any[]> {
    return this.fetchWithFallback<any>('/api/admin/schedule', '/data/schedule.json').then(data => data.matches || []);
  }

  async getSports(): Promise<any[]> {
    return this.fetchWithFallback<any>('/api/admin/sports', '/data/sports.json').then(data => data.sports || []);
  }

  // CRUD operations for admin
  async createUser(userData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return await response.json();
    } catch (error) {
      console.error('Create user failed:', error);
      throw error;
    }
  }

  async updateUser(uid: string, userData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/users/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return await response.json();
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/users/${uid}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  }

  async createMerchandise(item: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/merchandise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error('Failed to create merchandise');
      return await response.json();
    } catch (error) {
      console.error('Create merchandise failed:', error);
      throw error;
    }
  }

  async updateMerchandise(id: string, item: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/merchandise/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error('Failed to update merchandise');
      return await response.json();
    } catch (error) {
      console.error('Update merchandise failed:', error);
      throw error;
    }
  }

  async deleteMerchandise(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/merchandise/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete merchandise');
    } catch (error) {
      console.error('Delete merchandise failed:', error);
      throw error;
    }
  }

  async approveReview(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/reviews/${id}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve review');
    } catch (error) {
      console.error('Approve review failed:', error);
      throw error;
    }
  }

  async rejectReview(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/reviews/${id}/reject`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reject review');
    } catch (error) {
      console.error('Reject review failed:', error);
      throw error;
    }
  }

  async updateGameScore(id: string, homeScore: number, awayScore: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/games/${id}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home: homeScore, away: awayScore }),
      });
      if (!response.ok) throw new Error('Failed to update game score');
    } catch (error) {
      console.error('Update game score failed:', error);
      throw error;
    }
  }

  async startGame(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/games/${id}/start`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to start game');
    } catch (error) {
      console.error('Start game failed:', error);
      throw error;
    }
  }

  async endGame(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/games/${id}/end`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to end game');
    } catch (error) {
      console.error('End game failed:', error);
      throw error;
    }
  }

  async submitTeamApplication(data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/team-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to submit team application');
      return await response.json();
    } catch (error) {
      console.error('Submit team application failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();