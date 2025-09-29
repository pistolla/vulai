export type UserRole = 'admin' | 'correspondent' | 'fan' | 'sport-team';

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
  universityId?: string;   // fan & correspondent
  teamId?: string;         // sport-team
  displayName?: string;
  photoURL?: string;
}

/* Firestore document shapes */
export interface UserProfile extends Omit<AuthUser, 'uid'> {}
