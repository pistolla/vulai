/**
 * Timeline Service — Client-side read and gamification service.
 *
 * This module runs ONLY in the browser. It:
 *  1. Subscribes to the `timeline_cards` collection
 *  2. Manages local fan gamification state (XP, streaks) in Firestore
 *  3. Submits card reactions (Fire, Clap, Heart, Wow, Trophy)
 */

import { db, auth } from './firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  addDoc,
  limit
} from 'firebase/firestore';
import { TimelineCard } from './timelinePipeline';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FanProfile {
  userId: string | null;
  sessionId: string;
  xp: number;
  level: number;
  dailyStreak: number;
  lastActiveDate: string;
  totalReactions: number;
  cardsViewed: number;
  achievements: string[];
}

export type ReactionType = 'fire' | 'clap' | 'heart' | 'wow' | 'trophy';

/* ------------------------------------------------------------------ */
/*  Session Management                                                */
/* ------------------------------------------------------------------ */

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  let sessionId = localStorage.getItem('unill_timeline_session');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('unill_timeline_session', sessionId);
  }
  return sessionId;
}

export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}

/* ------------------------------------------------------------------ */
/*  Timeline Subscription                                             */
/* ------------------------------------------------------------------ */

export function subscribeToTimeline(
  callback: (cards: TimelineCard[]) => void
): () => void {
  const q = query(
    collection(db, 'timeline_cards'),
    orderBy('priority', 'desc'),
    limit(20)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const cards = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as TimelineCard[];
      callback(cards);
    },
    (error) => {
      console.error('[TimelineService] Subscription error:', error);
      callback([]); // Fallback
    }
  );
}

/* ------------------------------------------------------------------ */
/*  Reactions                                                          */
/* ------------------------------------------------------------------ */

export async function submitReaction(
  cardId: string,
  reactionType: ReactionType
): Promise<void> {
  const sessionId = getOrCreateSessionId();
  const userId = getCurrentUserId();

  // 1. Write individual reaction for tracking/archival analysis
  await addDoc(collection(db, 'timeline_reactions'), {
    cardId,
    userId,
    sessionId,
    reactionType,
    createdAt: serverTimestamp(),
  });

  // 2. Increment denormalized counter on the card document
  const cardRef = doc(db, 'timeline_cards', cardId);
  try {
    await updateDoc(cardRef, {
      [`reactions.${reactionType}`]: increment(1),
    });
  } catch (err) {
    console.error('[TimelineService] Failed to increment reaction counter:', err);
  }

  // 3. Award XP for interacting
  await awardXP(2);
}

/* ------------------------------------------------------------------ */
/*  Gamification (XP & Streaks)                                       */
/* ------------------------------------------------------------------ */

export async function getOrCreateFanProfile(): Promise<FanProfile> {
  const sessionId = getOrCreateSessionId();
  const userId = getCurrentUserId();

  // Use userId if logged in, otherwise use sessionId
  const profileId = userId || sessionId;
  const profileRef = doc(db, 'fan_profiles', profileId);
  
  const snap = await getDoc(profileRef);
  if (snap.exists()) {
    const data = snap.data() as FanProfile;
    // Check daily streak
    const today = new Date().toISOString().split('T')[0];
    if (data.lastActiveDate !== today) {
      await updateStreak(profileRef, data, today);
      return { ...data, lastActiveDate: today };
    }
    return data;
  }

  // Create new profile
  const today = new Date().toISOString().split('T')[0];
  const newProfile: FanProfile = {
    userId,
    sessionId,
    xp: 0,
    level: 1,
    dailyStreak: 1,
    lastActiveDate: today,
    totalReactions: 0,
    cardsViewed: 0,
    achievements: [],
  };

  await setDoc(profileRef, newProfile);
  return newProfile;
}

export async function awardXP(amount: number): Promise<void> {
  const sessionId = getOrCreateSessionId();
  const userId = getCurrentUserId();
  const profileId = userId || sessionId;
  const profileRef = doc(db, 'fan_profiles', profileId);

  try {
    const snap = await getDoc(profileRef);
    if (!snap.exists()) {
      await getOrCreateFanProfile();
    }
    
    // Increment XP
    await updateDoc(profileRef, {
      xp: increment(amount),
      totalReactions: increment(1)
    });
    
    // Level up logic could go here based on XP thresholds
  } catch (err) {
    console.error('[TimelineService] Failed to award XP:', err);
  }
}

async function updateStreak(profileRef: any, data: FanProfile, today: string) {
  const lastActive = new Date(data.lastActiveDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));

  let newStreak = data.dailyStreak;
  if (diffDays === 1) {
    newStreak += 1; // Continuous streak
  } else if (diffDays > 1) {
    newStreak = 1; // Streak broken
  }

  await updateDoc(profileRef, {
    dailyStreak: newStreak,
    lastActiveDate: today,
    xp: increment(newStreak > data.dailyStreak ? 10 : 0) // Bonus XP for continuing streak
  });
}

export function subscribeToFanProfile(
  callback: (profile: FanProfile | null) => void
): () => void {
  const sessionId = getOrCreateSessionId();
  const userId = getCurrentUserId();
  const profileId = userId || sessionId;

  return onSnapshot(
    doc(db, 'fan_profiles', profileId),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as FanProfile);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error('[TimelineService] Profile subscription error:', err);
      callback(null);
    }
  );
}
