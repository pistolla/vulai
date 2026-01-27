export * from './User';

export interface University {
  id: string;
  name: string;
  logoURL?: string;
  location?: string;
  established?: number;
  website?: string;
  description?: string;
}

export interface Team {
  id: string;
  universityId: string;
  name: string;
  sport: string;
  logoURL?: string;
  foundedYear?: number;
  coach?: string;
  league?: string;
  record?: string;
  championships?: string;
  season?: string;
  stats?: any;
  players?: any[];
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

export interface GoalTiming {
  teamId: string;
  minute: number;
  playerId?: string;
  playerName?: string;
}

export interface Fixture {
  homeTeamName: string;
  awayTeamName: string;
  id: string;
  correspondentId?: string;
  homeTeamId: string;
  awayTeamId: string;
  sport: string;
  scheduledAt: string; // ISO
  venue: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed';
  score?: { home: number; away: number };
  stats?: {
    homeGoals: number;
    awayGoals: number;
    homeAssists: number;
    awayAssists: number;
    possession: { home: number; away: number };
    shots: { home: number; away: number };
  };
  type: 'league' | 'friendly';
  matchId?: string; // for league fixtures, links to Match
  leagueId?: string; // for league fixtures, links to League
  groupId?: string; // for league fixtures, links to Group
  stageId?: string; // for league fixtures, links to Stage
  blogContent?: string;
  approved?: boolean;
  seasonId?: string; // Links to Season
  pointsAdded?: { home: number; away: number };
  pointsDeducted?: { home: number; away: number };
  goalTimings?: GoalTiming[];
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
  groups?: Record<string, Group[]>;
  stages?: Record<string, Stage[]>;
  matches?: Record<string, Match[]>;
  points?: Record<string, any[]>;
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
export type MatchStatus = 'pending' | 'ongoing' | 'completed' | 'scheduled' | 'postponed';
export type StageType = 'round_robin' | 'knockout';

export interface Participant {
  refType: 'team' | 'individual';
  refId: string;
  name?: string;
  score: number;
  stats?: Record<string, any>;
}

export interface MatchPlayer {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  position: string;
  entranceTime?: string; // ISO datetime when they entered the match
  jerseyNumber?: number;
}

export interface Match {
  id?: string;
  matchNumber: number;
  date: string; // ISO
  time?: string;
  venue?: string;
  status: MatchStatus;
  participants: Participant[];
  players?: MatchPlayer[]; // Players participating in the match
  winnerId?: string | null;
  blogContent?: string;
  seasonId?: string; // For season-based league matches
  fixtureId?: string; // Links to Fixture for bidirectional query
  groupId?: string; // Links to Group for bidirectional query
  stageId?: string; // Links to Stage for bidirectional query
  createdAt?: any;
  updatedAt?: any;
  nextMatchId?: string; // ID of the match the winner advances to
  targetSlot?: 0 | 1;  // Which participant slot (0 or 1) to fill in the next match
}

export interface Stage {
  id?: string;
  name: string;
  order: number;
  type: StageType;
  matches?: Match[];
  parentStageId?: string; // For tournament brackets
  createdAt?: any;
}

export interface Group {
  id?: string;
  name: string;
  description?: string;
  stages?: Stage[];
  subGroups?: Group[]; // recursive nesting
  createdAt?: string
}

export interface League {
  id?: string;
  name: string;
  sportType: SportType;
  sportName?: string;
  description?: string;
  hasGroups: boolean; // Toggle for groups/divisions
  createdAt?: any;
  updatedAt?: any;
  groups?: Group[]; // array, optional for creation
}

export interface PlayerAvatar {
  id: string;
  playerId: string;
  base64Image: string;
  fullSizeImage: string;
  threeDAssets: string; // JSON or URL to 3D assets
  movementDetails: string; // JSON for Three.js movement data
}

export interface Season {
  id: string;
  name: string; // e.g. "2023/2024", "Season 1"
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Sport {
  id: string;
  name: string;
  category: 'team' | 'individual';
  description: string;
  image: string;
  base64Image?: string;
  players: number;
  season?: string; // Legacy field
  seasons?: Season[]; // To be populated if needed
  positions: string[];
  stats?: {
    wins: number;
    losses: number;
    championships: number;
  };
}

/* ----- imported data ----- */
export interface ImportedData {
  id: string;
  correspondentId: string;
  correspondentName: string;
  correspondentEmail: string;
  universityName: string;
  driveLink: string;
  fileExtension: 'pdf' | 'excel' | 'csv' | 'json';
  dataType: 'League' | 'team data' | 'players data' | 'merchandise' | 'match results';
  description: string;
  dateOfUpload: string; // ISO
  status: 'pending' | 'processed';
}

/* ----- merchandise documents ----- */
export type DocumentType = 'order' | 'invoice' | 'stock_record' | 'transport_document' | 'return_of_goods' | 'purchase_order' | 'delivery_notes';
export type DocumentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed';
export type MerchType = 'team' | 'unil';

export interface DocumentApproval {
  userId: string;
  status: 'approved' | 'rejected';
  timestamp: string; // ISO
  comment?: string;
}

export interface MerchDocument {
  id: string;
  type: DocumentType;
  merchType: MerchType;
  status: DocumentStatus;
  createdBy: string; // user id
  createdAt: string; // ISO
  updatedAt: string; // ISO
  approvals: DocumentApproval[];
  data: any; // type-specific data
}

// Type-specific data interfaces
export interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'pay_on_delivery' | 'pay_on_order' | 'card' | 'paypal' | 'mobile';
  notes?: string;
  orderHash?: string;
}

export interface OrderItem {
  merchId: string;
  merchName: string;
  quantity: number;
  price: number;
  subtotal: number;
  size?: string;
}

export interface InvoiceData {
  orderId: string;
  invoiceNumber: string;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  dueDate: string; // ISO
  items: InvoiceItem[];
  total: number;
  tax?: number;
  discount?: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  subtotal: number;
  size?: string;
}

export interface StockRecordData {
  merchId: string;
  merchName: string;
  quantity: number;
  type: 'in' | 'out';
  reason: string;
  reference?: string; // e.g., order id
  size?: string;
}

export interface TransportDocumentData {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  shippedAt: string; // ISO
  estimatedDelivery: string; // ISO
  status: 'shipped' | 'in_transit' | 'delivered';
}

export interface ReturnOfGoodsData {
  orderId: string;
  items: ReturnItem[];
  reason: string;
  returnDate: string; // ISO
  refundAmount?: number;
  status: 'requested' | 'approved' | 'received' | 'refunded';
}

export interface ReturnItem {
  merchId: string;
  merchName: string;
  quantity: number;
  condition: 'new' | 'used' | 'damaged';
  size?: string;
}

export interface PurchaseOrderData {
  supplierName: string;
  supplierEmail: string;
  supplierPhone?: string;
  deliveryAddress: string;
  items: OrderItem[];
  total: number;
  expectedDeliveryDate: string;
  notes?: string;
  originalOrderId?: string;
}

export interface DeliveryNotesData {
  orderId: string;
  deliveryDate: string;
  deliveredBy: string;
  receivedBy: string;
  items: OrderItem[];
  notes?: string;
}

export interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[]; // URLs
  image?: string; // Primary image URL (legacy/convenience)
  category: 'Footwear' | 'Headgear' | 'Garments Upper Body' | 'Garments Lower Body' | 'Underwear' | 'Gadgets' | 'Equipment' | 'Assortment' | 'Apparel' | 'Accessories';
  inStock: boolean;
  likes: number;
  type?: 'team' | 'unil';
  teamId?: string;
  catalog?: string;
  university?: string;
  team?: string;
  availableSizes?: string[];
  selectedSize?: string;
}
