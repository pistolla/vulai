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

export const resendVerificationEmail = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  await sendEmailVerification(user);
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

/* ---------- Error Handling ---------- */
export const getAuthErrorMessage = (error: any): string => {
  const code = error.code;
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in credentials.';
    case 'auth/invalid-credential':
      return 'The credential is invalid or has expired.';
    case 'auth/credential-already-in-use':
      return 'This credential is already associated with a different user account.';
    case 'auth/invalid-verification-code':
      return 'The verification code is invalid.';
    case 'auth/invalid-verification-id':
      return 'The verification ID is invalid.';
    case 'auth/missing-verification-code':
      return 'Please enter the verification code.';
    case 'auth/code-expired':
      return 'The verification code has expired.';
    case 'auth/expired-action-code':
      return 'The action code has expired.';
    case 'auth/invalid-action-code':
      return 'The action code is invalid.';
    case 'auth/user-token-expired':
      return 'The user\'s token has expired.';
    case 'auth/user-token-revoked':
      return 'The user\'s token has been revoked.';
    case 'auth/invalid-user-token':
      return 'The user\'s token is invalid.';
    case 'auth/requires-recent-login':
      return 'This operation requires recent authentication. Please log in again.';
    case 'auth/provider-already-linked':
      return 'The account is already linked to another provider.';
    case 'auth/no-such-provider':
      return 'No such provider.';
    case 'auth/invalid-continue-uri':
      return 'The continue URL is invalid.';
    case 'auth/missing-continue-uri':
      return 'A continue URL must be provided.';
    case 'auth/unauthorized-continue-uri':
      return 'The continue URL is not authorized.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later.';
    case 'auth/captcha-check-failed':
      return 'The reCAPTCHA check failed.';
    case 'auth/web-storage-unsupported':
      return 'Web storage is not supported or is disabled.';
    case 'auth/app-deleted':
      return 'The Firebase app has been deleted.';
    case 'auth/app-not-authorized':
      return 'The app is not authorized to use Firebase Authentication.';
    case 'auth/argument-error':
      return 'An invalid argument was provided.';
    case 'auth/invalid-api-key':
      return 'The API key is invalid.';
    case 'auth/invalid-app-credential':
      return 'The app credential is invalid.';
    case 'auth/invalid-app-id':
      return 'The app ID is invalid.';
    case 'auth/invalid-auth-event':
      return 'An invalid authentication event occurred.';
    case 'auth/invalid-cert-hash':
      return 'The certificate hash is invalid.';
    case 'auth/invalid-custom-token':
      return 'The custom token is invalid.';
    case 'auth/invalid-dynamic-link-domain':
      return 'The dynamic link domain is invalid.';
    case 'auth/invalid-persistence-type':
      return 'The persistence type is invalid.';
    case 'auth/unsupported-persistence-type':
      return 'The persistence type is not supported.';
    case 'auth/missing-android-pkg-name':
      return 'An Android package name must be provided.';
    case 'auth/missing-ios-bundle-id':
      return 'An iOS bundle ID must be provided.';
    case 'auth/invalid-cordova-configuration':
      return 'The Cordova configuration is invalid.';
    case 'auth/missing-app-credential':
      return 'The app credential is missing.';
    case 'auth/invalid-app-name':
      return 'The app name is invalid.';
    case 'auth/invalid-client-id':
      return 'The client ID is invalid.';
    case 'auth/invalid-client-type':
      return 'The client type is invalid.';
    case 'auth/invalid-continue-uri':
      return 'The continue URL is invalid.';
    case 'auth/missing-continue-uri':
      return 'A continue URL must be provided.';
    case 'auth/unauthorized-continue-uri':
      return 'The continue URL is not authorized.';
    case 'auth/missing-iframe-start':
      return 'The iframe start is missing.';
    case 'auth/missing-iframe-src':
      return 'The iframe src is missing.';
    case 'auth/missing-iframe-opener':
      return 'The iframe opener is missing.';
    case 'auth/invalid-message-payload':
      return 'The message payload is invalid.';
    case 'auth/missing-message-payload':
      return 'The message payload is missing.';
    case 'auth/missing-phone-number':
      return 'A phone number must be provided.';
    case 'auth/invalid-phone-number':
      return 'The phone number is invalid.';
    case 'auth/missing-verification-code':
      return 'Please enter the verification code.';
    case 'auth/invalid-verification-code':
      return 'The verification code is invalid.';
    case 'auth/missing-verification-id':
      return 'The verification ID is missing.';
    case 'auth/invalid-verification-id':
      return 'The verification ID is invalid.';
    case 'auth/missing-app-token':
      return 'The app token is missing.';
    case 'auth/invalid-app-token':
      return 'The app token is invalid.';
    case 'auth/missing-recaptcha-token':
      return 'The reCAPTCHA token is missing.';
    case 'auth/invalid-recaptcha-token':
      return 'The reCAPTCHA token is invalid.';
    case 'auth/invalid-recaptcha-action':
      return 'The reCAPTCHA action is invalid.';
    case 'auth/missing-client-type':
      return 'The client type is missing.';
    case 'auth/missing-recaptcha-version':
      return 'The reCAPTCHA version is missing.';
    case 'auth/invalid-recaptcha-version':
      return 'The reCAPTCHA version is invalid.';
    case 'auth/invalid-req-type':
      return 'The request type is invalid.';
    case 'auth/missing-password':
      return 'A password must be provided.';
    case 'auth/missing-email':
      return 'An email address must be provided.';
    default:
      return error.message || 'An unknown error occurred.';
  }
};
