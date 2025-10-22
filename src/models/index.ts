export * from './User';

export interface University {
  id: string;
  name: string;
  logoURL?: string;
}

export interface Team {
  id: string;
  universityId: string;
  name: string;
  sport: string;
  logoURL?: string;
  foundedYear: number;
}

export interface Athlete {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: string;
  year: 'FR' | 'SO' | 'JR' | 'SR' | 'GR';
}

export interface Fixture {
  homeTeamName: string;
  awayTeamName: string;
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  sport: string;
  scheduledAt: string; // ISO
  venue: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed';
  score?: { home: number; away: number };
}

export interface News {
  id: string;
  authorId: string; // correspondent
  universityId?: string;
  teamId?: string;
  title: string;
  body: string;
  tags: string[];
  publishedAt: string;
}

export interface Ticket {
  id: string;
  fixtureId: string;
  fanId: string;
  seat: string;
  price: number;
  purchasedAt: string;
}

/* role-scoped slices */
export interface AdminDashboard {
  universities: University[];
  teams: Team[];
  fixtures: Fixture[];
}

export interface CorrespondentDashboard {
  myArticles: News[];
  draftArticles: News[];
  groups: Record<string, Group[]>;
  stages: Record<string, Stage[]>;
  matches: Record<string, Match[]>;
  points: Record<string, any[]>;
}

export interface FanDashboard {
  myTickets: Ticket[];
  followedTeams: string[]; // teamIds
  newsFeed: News[];
}

export interface SportTeamDashboard {
  myTeam: Team | null;
  athletes: Athlete[];
  fixtures: Fixture[];
}

/* ----- live commentary ----- */
export interface LiveCommentary {
  id: string;               // same as fixtureId for 1-1
  fixtureId: string;
  lastUpdateAt: string;     // ISO
  status: 'idle' | 'live' | 'finished';
  events: CommentaryEvent[];
}

export interface CommentaryEvent {
  id: string;
  minute: number;           // game clock
  type: 'goal' | 'card' | 'substitution' | 'period' | 'text';
  teamId: string;
  body: string;
  createdAt: string;        // ISO
}

/* ----- drive video ----- */
export interface FixtureVideo {
  fixtureId: string;
  driveFileId: string;
  driveWebViewLink: string;
  uploadedBy: string;       // correspondent uid
  uploadedAt: string;       // ISO
}

/* ----- bulk athlete upload ----- */
export interface CsvAthleteRow {
  jerseyNumber: number;
  firstName: string;
  lastName: string;
  position?: string;
  year: 'FR' | 'SO' | 'JR' | 'SR' | 'GR';
}

export type SportType = 'team' | 'individual';
export type MatchStatus = 'pending' | 'ongoing' | 'completed';
export type StageType = 'round_robin' | 'knockout';

export interface Participant {
  refType: 'team' | 'individual';
  refId: string;
  name?: string;
  score: number;
  stats?: Record<string, any>;
}

export interface Match {
  id?: string;
  matchNumber: number;
  date: string; // ISO
  venue?: string;
  status: MatchStatus;
  participants: Participant[];
  winnerId?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export interface Stage {
  id?: string;
  name: string;
  order: number;
  type: StageType;
  matches?: Match[];
  createdAt?: any;
}

export interface Group {
  id?: string;
  name: string;
  description?: string;
  stages?: Stage[];
}

export interface League {
  id?: string;
  name: string;
  sportType: SportType;
  description?: string;
}
