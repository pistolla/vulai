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
   blogContent?: string;
   approved?: boolean;
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
export type MatchStatus = 'pending' | 'ongoing' | 'completed';
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
  venue?: string;
  status: MatchStatus;
  participants: Participant[];
  players?: MatchPlayer[]; // Players participating in the match
  winnerId?: string | null;
  blogContent?: string;
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
  createdAt?: string
}

export interface League {
  id?: string;
  name: string;
  sportType: SportType;
  description?: string;
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

export interface Sport {
  id: string;
  name: string;
  category: 'team' | 'individual';
  description: string;
  image: string;
  base64Image?: string;
  players: number;
  season: string;
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
  paymentMethod: 'pay_on_delivery' | 'pay_on_order';
  notes?: string;
}

export interface OrderItem {
  merchId: string;
  merchName: string;
  quantity: number;
  price: number;
  subtotal: number;
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
}

export interface StockRecordData {
  merchId: string;
  merchName: string;
  quantity: number;
  type: 'in' | 'out';
  reason: string;
  reference?: string; // e.g., order id
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
