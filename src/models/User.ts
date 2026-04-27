export type UserRole = 'admin' | 'correspondent' | 'fan' | 'sport-team' | 'marketer';

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
  status?: 'pending' | 'active';
  universityId?: string;   // fan & correspondent
  teamId?: string;         // sport-team
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  twoFactorEnabled?: boolean;
  needsPasswordReset?: boolean;
}

/* Firestore document shapes */
export interface UserProfile extends Omit<AuthUser, 'uid'> {}
