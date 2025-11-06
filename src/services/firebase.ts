import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  UserCredential,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile as fbUpdateProfile,
  updatePassword as fbUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  RecaptchaVerifier,
  updatePhoneNumber as fbUpdatePhoneNumber,
  PhoneAuthProvider,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, updateDoc, collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { AuthUser, UserProfile, UserRole } from '@/models/User';
import { League, University } from '@/models';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAfueNrXFi1MR5RwbLSYVOwAkW2IfiM9RI",
  authDomain: "unill-20c41.firebaseapp.com",
  projectId: "unill-20c41",
  storageBucket: "unill-20c41.firebasestorage.app",
  messagingSenderId: "775721930353",
  appId: "1:775721930353:web:c9a75b90494363bcee55d0",
  measurementId: "G-F7X1S54R7N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

if (!getApps().length) initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();

const fetchTopLevelLeagues = async (): Promise<League[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, `leagues`));

    // The .map() function will return a new array
    const leagues: League[] = querySnapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
      // It's good practice to spread the data and then potentially add/override specific fields
      const data = d.data();
      return {
        id: d.id,
        // Assuming League interface matches d.data() structure.
        // If not, explicitly map fields like:
        // name: data.name as string,
        // sportType: data.sportType as string,
        // ...
        ...data
      } as League; // Cast to your League type
    });

    console.log("Fetched and mapped top-level leagues:", leagues);
    return leagues;

  } catch (error) {
    console.error("Error fetching or mapping leagues:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};



/* ---------- helpers ---------- */
const mapRawUser = (u: any): AuthUser => ({
  uid: u.uid,
  email: u.email!,
  role: u.role,
  universityId: u.universityId,
  teamId: u.teamId,
  displayName: u.displayName,
  photoURL: u.photoURL,
});

/* ---------- public API ---------- */
export const register = async (
  email: string,
  password: string,
  role: UserRole,
  meta: { universityId?: string; teamId?: string; displayName?: string }
): Promise<AuthUser> => {
  const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user); // Send verification email
  const profile: UserProfile = {
    email,
    role,
    universityId: meta.universityId,
    displayName: meta.displayName || email.split('@')[0]

  };
  await setDoc(doc(db, 'users', cred.user.uid), profile);
  return mapRawUser({ uid: cred.user.uid, ...profile });
};

export const login = async (email: string, password: string): Promise<AuthUser> => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  if (!cred.user.emailVerified) {
    throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
  }
  const snap = await getDoc(doc(db, 'users', cred.user.uid));
  if (!snap.exists()) throw new Error('No profile');
  return mapRawUser({ uid: cred.user.uid, ...snap.data() });
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const signOut = async () => {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/* client-side only – called once in store */
export const subscribeAuth = (cb: (u: AuthUser | null) => void) =>
  onAuthStateChanged(auth, async (raw) => {
    if (!raw) return cb(null);
    const snap = await getDoc(doc(db, 'users', raw.uid));
    if (!snap.exists()) return cb(null);
    cb(mapRawUser({ uid: raw.uid, ...snap.data() }));
  });

  /* ---------- Social login ---------- */
  const googleProvider    = new GoogleAuthProvider();
  const facebookProvider  = new FacebookAuthProvider();
  const twitterProvider   = new TwitterAuthProvider();
  
  const socialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider | TwitterAuthProvider) => {
    const cred = await signInWithPopup(auth, provider);
    const uid  = cred.user.uid;

    /* create / merge profile doc */
    await setDoc(
      doc(db, 'users', uid),
      {
        email:       cred.user.email,
        displayName: cred.user.displayName,
        role:        'fan', // default
        photoURL:    cred.user.photoURL,
        createdAt:   serverTimestamp(),
      },
      { merge: true }
    );
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) throw new Error('Profile creation failed');
    return mapRawUser({ uid, ...snap.data() });
  };
  
  export const loginGoogle   = () => socialLogin(googleProvider);
  export const loginFacebook = () => socialLogin(facebookProvider);
export const fetchUniversities = async (): Promise<University[]> => {
  const { getDocs, collection } = await import('firebase/firestore');
  const snap = await getDocs(collection(db, 'universities'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as University));
};
  export const loginTwitter  = () => socialLogin(twitterProvider);
  export const storage = getStorage();

/* ---------- Profile Management ---------- */
export const updateProfile = async (data: { displayName?: string; universityId?: string }) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // Update Firebase Auth profile
  if (data.displayName) {
    await fbUpdateProfile(user, { displayName: data.displayName });
  }

  // Update Firestore profile
  const profileUpdate: Partial<UserProfile> = {};
  if (data.displayName) profileUpdate.displayName = data.displayName;
  if (data.universityId) profileUpdate.universityId = data.universityId;

  await updateDoc(doc(db, 'users', user.uid), profileUpdate);
};

export const updatePassword = async (currentPassword: string, newPassword: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No authenticated user');

  // Re-authenticate user
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update password
  await fbUpdatePassword(user, newPassword);
};

export const updatePhoneNumber = async (phoneNumber: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // For phone number updates, we need to use a verification process
  // This is a simplified version - in production you'd want proper SMS verification
  const phoneCredential = PhoneAuthProvider.credential('', ''); // Would need verification ID and code
  await fbUpdatePhoneNumber(user, phoneCredential);

  // Update Firestore profile
  await updateDoc(doc(db, 'users', user.uid), { phoneNumber });
};

export const enable2FA = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // Generate a random secret for TOTP (simplified - in production use proper TOTP library)
  const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Update Firestore profile
  await updateDoc(doc(db, 'users', user.uid), {
    twoFactorEnabled: true,
    twoFactorSecret: secret
  });

  return secret;
};

export const disable2FA = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // Update Firestore profile
  await updateDoc(doc(db, 'users', user.uid), {
    twoFactorEnabled: false,
    twoFactorSecret: null
  });
};
