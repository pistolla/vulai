import { TeamTheme } from "@/pages/team/fan/[slug]";

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
  stats?: PlayerStats;
  social?: PlayerSocial;
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  players: Player[];
  coach?: string;
  founded?: number;
  league?: string;
  record?: string;
  championships?: number;
  theme?: TeamTheme
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
