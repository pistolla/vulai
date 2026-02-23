export type TeamThemeName = 'quantum' | 'crimson' | 'blue' | 'cardinal' | 'gold' | 'neon' | 'cyber';

export interface TeamThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export type TeamTheme = TeamThemeName | TeamThemeColors;

export interface Sport {
  id: string;
  name: string;
  category: 'team' | 'individual';
  description: string;
  image: string;
  players: number;
  season: string;
  positions: string[];
  stats: {
    wins: number;
    losses: number;
    championships: number;
  };
}

export interface PlayerStats {
  gamesPlayed: number;
  points: number;
  rebounds?: number;
  assists?: number;
  goals?: number;
  cleanSheets?: number;
  yellowCards?: number;
  redCards?: number;
  manOfTheMatch?: number;
  performanceHistory: { date: string; score: number }[];
}

export interface PlayerSocial {
  followers: number;
  following: number;
  badges: { id: string; name: string; icon: string; awardedAt: string }[];
  rank?: number;
  level: number;
  xp: number;
  nextLevelXp: number;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  year: string;
  number: number;
  height: string;
  weight: string;
  avatar: string;
  universityId: string;
  sportId: string;
  teamId?: string; // Reference to team for querying
  stats?: PlayerStats;
  social?: PlayerSocial;
  bio?: string;
  socialLinks?: {
    instagram: string;
    twitter: string;
  };
  bodyFat?: number;
  status?: string;
  injuryNote?: string;
  joinedAt?: string;
  kitNumber?: number;
}

// Player reference document stored in team subcollections (current_squad, bench_squad, retired_squad, current_formation)
export interface PlayerReference {
  playerId: string; // Reference to main players collection
  squadType: 'current_squad' | 'bench_squad' | 'retired_squad' | 'current_formation';
  addedAt: string;
  addedBy?: string;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string; // Human-readable URL slug for team pages
  sport: string;
  coach?: string;
  founded?: number;
  league?: string;
  record?: string;
  championships?: number;
  theme?: TeamTheme;
  logoURL?: string;
  // Players are now stored in root 'players' collection with teamId reference
  // This field may be populated for backward compatibility or denormalized queries
  players?: Player[];
}

export interface Match {
  id: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
  score?: {
    home: number;
    away: number;
  };
}

export interface NavItem {
  name: string;
  href: string;
  current?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}
