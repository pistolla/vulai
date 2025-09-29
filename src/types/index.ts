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

export interface Player {
  name: string;
  position: string;
  year: string;
  number: number;
  height: string;
  weight: string;
  avatar: string;
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
