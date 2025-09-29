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
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { AuthUser, UserProfile, UserRole } from '@/models/User';


import { getAnalytics } from "firebase/analytics";
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
  const profile: UserProfile = {
    email,
    role,
    universityId: meta.universityId,
    teamId: meta.teamId,
    displayName: meta.displayName || email.split('@')[0],
  };
  await setDoc(doc(db, 'users', cred.user.uid), profile);
  return mapRawUser({ uid: cred.user.uid, ...profile });
};

export const login = async (email: string, password: string): Promise<AuthUser> => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, 'users', cred.user.uid));
  if (!snap.exists()) throw new Error('No profile');
  return mapRawUser({ uid: cred.user.uid, ...snap.data() });
};

export const signOut = () => fbSignOut(auth);

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
    return mapRawUser({ uid, ...cred.user });
  };
  
  export const loginGoogle   = () => socialLogin(googleProvider);
  export const loginFacebook = () => socialLogin(facebookProvider);
  export const loginTwitter  = () => socialLogin(twitterProvider);
