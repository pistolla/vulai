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
