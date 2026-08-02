/**
 * Timeline Pipeline — Server-side generation orchestrator.
 *
 * This module runs ONLY on the server (API routes). It:
 *  1. Aggregates sports data from Firestore
 *  2. Computes a SHA-256 content hash to detect changes
 *  3. Acquires a distributed lock (Firestore transaction) to prevent
 *     two processes from generating simultaneously
 *  4. Writes generated cards to `timeline_cards` collection
 *  5. Archives engaging cards before rotation
 */

import * as admin from 'firebase-admin';
import crypto from 'crypto';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TimelineCard {
  id?: string;
  type:
    | 'live_match'
    | 'upcoming_match'
    | 'leaderboard'
    | 'player_spotlight'
    | 'merch_drop'
    | 'university_pride'
    | 'league_update'
    | 'commentary_flash'
    | 'fan_challenge'
    | 'streak_reward';
  title: string;
  subtitle: string;
  body: string;
  emoji: string;
  gradient: [string, string];
  ctaLabel: string;
  ctaHref: string;
  xpReward: number;
  priority: number;
  metadata: Record<string, any>;
  generatedAt?: admin.firestore.Timestamp;
  contentHash?: string;
  reactions: {
    fire: number;
    clap: number;
    heart: number;
    wow: number;
    trophy: number;
  };
}

export interface AggregatedSportsData {
  universities: any[];
  teams: any[];
  players: any[];
  liveGames: any[];
  upcomingGames: any[];
  merchandise: any[];
  leagues: any[];
}

/* ------------------------------------------------------------------ */
/*  Firebase Admin init (reusable, same pattern as mascot.ts)          */
/* ------------------------------------------------------------------ */

function getFirestore(): admin.firestore.Firestore {
  if (!admin.apps.length) {
    try {
      if (
        process.env.FIREBASE_PRIVATE_KEY &&
        !process.env.FIREBASE_PRIVATE_KEY.includes('Your_Private_Key')
      ) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        admin.initializeApp();
      }
    } catch (error: any) {
      console.error('Firebase admin init error:', error.message);
      if (!admin.apps.length) admin.initializeApp();
    }
  }
  return admin.firestore();
}

/* ------------------------------------------------------------------ */
/*  Stage 1 — Data Aggregation                                         */
/* ------------------------------------------------------------------ */

export async function aggregateSportsData(): Promise<AggregatedSportsData> {
  const db = getFirestore();
  const [
    uniSnap,
    teamSnap,
    playerSnap,
    liveSnap,
    upcomingSnap,
    merchSnap,
    leagueSnap,
  ] = await Promise.all([
    db.collection('universities').get(),
    db.collection('teams').get(),
    db.collection('players').limit(50).get(),
    db.collection('admin').doc('dashboard').collection('liveGames').get(),
    db.collection('admin').doc('dashboard').collection('upcomingGames').get(),
    db.collection('merchandise').limit(20).get(),
    db.collection('leagues').limit(20).get(),
  ]);

  return {
    universities: uniSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    teams: teamSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    players: playerSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    liveGames: liveSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    upcomingGames: upcomingSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    merchandise: merchSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    leagues: leagueSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
}

/* ------------------------------------------------------------------ */
/*  Stage 2 — Content Hash                                             */
/* ------------------------------------------------------------------ */

export function computeContentHash(data: AggregatedSportsData): string {
  // Hash key fields that indicate meaningful change
  const hashPayload = JSON.stringify({
    liveIds: data.liveGames.map((g) => g.id).sort(),
    upcomingIds: data.upcomingGames.map((g) => g.id).sort(),
    teamCount: data.teams.length,
    playerCount: data.players.length,
    merchCount: data.merchandise.length,
    // Include live scores so cards update when scores change
    liveScores: data.liveGames.map((g) => ({
      id: g.id,
      home: g.score?.home,
      away: g.score?.away,
      status: g.status,
    })),
  });
  return crypto.createHash('sha256').update(hashPayload).digest('hex');
}

/* ------------------------------------------------------------------ */
/*  Stage 3 — Distributed Lock                                         */
/* ------------------------------------------------------------------ */

const LOCK_DOC = 'timeline_meta/generation_lock';
const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function acquireGenerationLock(
  instanceId: string
): Promise<boolean> {
  const db = getFirestore();
  const lockRef = db.doc(LOCK_DOC);

  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(lockRef);
      const data = snap.data();

      if (data?.locked) {
        const lockedAt = data.lockedAt?.toMillis?.() || 0;
        const age = Date.now() - lockedAt;

        // If lock is stale (past TTL), force-acquire
        if (age < LOCK_TTL_MS) {
          console.log('[Pipeline] Lock held by', data.lockedBy, '— skipping');
          return false;
        }
        console.log('[Pipeline] Stale lock detected, force-acquiring');
      }

      tx.set(lockRef, {
        locked: true,
        lockedBy: instanceId,
        lockedAt: admin.firestore.FieldValue.serverTimestamp(),
        ttlSeconds: LOCK_TTL_MS / 1000,
      });

      return true;
    });
  } catch (err) {
    console.error('[Pipeline] Lock acquisition failed:', err);
    return false;
  }
}

export async function releaseGenerationLock(): Promise<void> {
  const db = getFirestore();
  await db.doc(LOCK_DOC).set({ locked: false }, { merge: true });
}

/* ------------------------------------------------------------------ */
/*  Stage 4 — Check if regeneration is needed                          */
/* ------------------------------------------------------------------ */

export async function shouldRegenerate(
  currentHash: string
): Promise<boolean> {
  const db = getFirestore();
  const hashDoc = await db.doc('timeline_meta/content_hash').get();
  const storedHash = hashDoc.data()?.hash;
  return storedHash !== currentHash;
}

export async function storeContentHash(hash: string): Promise<void> {
  const db = getFirestore();
  await db.doc('timeline_meta/content_hash').set({
    hash,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/* ------------------------------------------------------------------ */
/*  Stage 5 — Write cards to Firestore (atomic batch)                  */
/* ------------------------------------------------------------------ */

export async function writeCardsBatch(
  cards: TimelineCard[],
  contentHash: string
): Promise<void> {
  const db = getFirestore();

  // First, archive any existing engaging cards before clearing
  await archiveEngagingCards(20);

  // Delete old cards
  const oldSnap = await db.collection('timeline_cards').get();
  const deleteBatch = db.batch();
  oldSnap.docs.forEach((d) => deleteBatch.delete(d.ref));
  if (oldSnap.docs.length > 0) await deleteBatch.commit();

  // Write new cards
  const writeBatch = db.batch();
  cards.forEach((card) => {
    const ref = db.collection('timeline_cards').doc();
    writeBatch.set(ref, {
      ...card,
      id: ref.id,
      contentHash,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      reactions: card.reactions || { fire: 0, clap: 0, heart: 0, wow: 0, trophy: 0 },
    });
  });
  await writeBatch.commit();
}

/* ------------------------------------------------------------------ */
/*  Engagement Archival                                                 */
/* ------------------------------------------------------------------ */

export async function archiveEngagingCards(
  threshold: number
): Promise<number> {
  const db = getFirestore();
  const snap = await db.collection('timeline_cards').get();
  let archived = 0;

  const batch = db.batch();
  for (const doc of snap.docs) {
    const data = doc.data();
    const reactions = data.reactions || {};
    const total =
      (reactions.fire || 0) +
      (reactions.clap || 0) +
      (reactions.heart || 0) +
      (reactions.wow || 0) +
      (reactions.trophy || 0);

    if (total >= threshold) {
      const archiveRef = db.collection('timeline_cards_archive').doc();
      batch.set(archiveRef, {
        ...data,
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
        totalEngagement: total,
        archiveReason: 'viral' as const,
        distributionChannels: ['push', 'social'],
      });
      archived++;
    }
  }

  if (archived > 0) await batch.commit();
  console.log(`[Pipeline] Archived ${archived} engaging cards`);
  return archived;
}

/* ------------------------------------------------------------------ */
/*  Template Fallback Cards                                             */
/* ------------------------------------------------------------------ */

const CARD_GRADIENTS: Record<string, [string, string]> = {
  live_match: ['#dc2626', '#991b1b'],
  upcoming_match: ['#7c3aed', '#4c1d95'],
  leaderboard: ['#f59e0b', '#d97706'],
  player_spotlight: ['#06b6d4', '#0e7490'],
  merch_drop: ['#ec4899', '#be185d'],
  university_pride: ['#10b981', '#047857'],
  league_update: ['#6366f1', '#4338ca'],
  commentary_flash: ['#ef4444', '#b91c1c'],
  fan_challenge: ['#8b5cf6', '#6d28d9'],
  streak_reward: ['#f59e0b', '#ea580c'],
};

export function generateFallbackCards(
  data: AggregatedSportsData
): TimelineCard[] {
  const cards: TimelineCard[] = [];
  const zeroReactions = { fire: 0, clap: 0, heart: 0, wow: 0, trophy: 0 };

  // Live match cards
  data.liveGames.forEach((game, i) => {
    const home = game.homeTeamName || game.participants?.[0]?.name || 'Home';
    const away = game.awayTeamName || game.participants?.[1]?.name || 'Away';
    const homeScore = game.score?.home ?? game.participants?.[0]?.score ?? 0;
    const awayScore = game.score?.away ?? game.participants?.[1]?.score ?? 0;
    cards.push({
      type: 'live_match',
      title: `🔴 ${home} vs ${away}`,
      subtitle: `${homeScore} - ${awayScore} • LIVE NOW`,
      body: `The match is underway at ${game.venue || 'the grounds'}! Don't miss this ${game.sport || 'sports'} action!`,
      emoji: '⚡',
      gradient: CARD_GRADIENTS.live_match,
      ctaLabel: 'Watch Feed',
      ctaHref: `/live-match/${game.id}`,
      xpReward: 10,
      priority: 100 - i,
      metadata: { fixtureId: game.id, sport: game.sport, score: { home: homeScore, away: awayScore }, participants: game.participants },
      reactions: zeroReactions,
    });
  });

  // Upcoming match cards
  data.upcomingGames.slice(0, 4).forEach((game, i) => {
    const home = game.homeTeamName || game.participants?.[0]?.name || 'Team A';
    const away = game.awayTeamName || game.participants?.[1]?.name || 'Team B';
    const date = game.scheduledAt ? new Date(game.scheduledAt) : new Date();
    cards.push({
      type: 'upcoming_match',
      title: `🗓️ ${home} vs ${away}`,
      subtitle: `${date.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })} • ${game.sport || 'Match Day'}`,
      body: `Get ready for this showdown at ${game.venue || 'the arena'}! Who's your pick?`,
      emoji: '🏟️',
      gradient: CARD_GRADIENTS.upcoming_match,
      ctaLabel: 'Match Details',
      ctaHref: `/schedule`,
      xpReward: 5,
      priority: 80 - i,
      metadata: { fixtureId: game.id, sport: game.sport, scheduledAt: game.scheduledAt, participants: game.participants },
      reactions: zeroReactions,
    });
  });

  // Leaderboard card (Big 5)
  if (data.teams.length > 0) {
    const sortedTeams = [...data.teams]
      .filter((t) => t.stats?.wins !== undefined)
      .sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0))
      .slice(0, 5);

    if (sortedTeams.length > 0) {
      cards.push({
        type: 'leaderboard',
        title: '🏆 Big 5 Leaderboard',
        subtitle: 'University Sports Rankings',
        body: sortedTeams
          .map((t, i) => `${['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]} ${t.name} — ${t.stats?.wins || 0}W`)
          .join('\n'),
        emoji: '📊',
        gradient: CARD_GRADIENTS.leaderboard,
        ctaLabel: 'Full Rankings',
        ctaHref: '/teams',
        xpReward: 5,
        priority: 70,
        metadata: { teams: sortedTeams.map((t) => ({ id: t.id, name: t.name, wins: t.stats?.wins || 0 })) },
        reactions: zeroReactions,
      });
    }
  }

  // Player spotlight
  if (data.players.length > 0) {
    const randomPlayer = data.players[Math.floor(Math.random() * data.players.length)];
    const playerName = randomPlayer.name || `${randomPlayer.firstName || ''} ${randomPlayer.lastName || ''}`.trim() || 'Star Player';
    cards.push({
      type: 'player_spotlight',
      title: `⭐ Player Spotlight`,
      subtitle: playerName,
      body: `Position: ${randomPlayer.position || 'All-rounder'} • ${randomPlayer.teamName || 'University Team'}\n${randomPlayer.highlights?.length ? `${randomPlayer.highlights.length} career highlights` : 'Rising star to watch!'}`,
      emoji: '🌟',
      gradient: CARD_GRADIENTS.player_spotlight,
      ctaLabel: 'View Profile',
      ctaHref: randomPlayer.slug ? `/player/${randomPlayer.slug}` : '/teams',
      xpReward: 5,
      priority: 60,
      metadata: { playerId: randomPlayer.id, name: playerName, position: randomPlayer.position },
      reactions: zeroReactions,
    });
  }

  // Merch drop
  if (data.merchandise.length > 0) {
    const featured = data.merchandise.filter((m) => m.inStock !== false).slice(0, 2);
    featured.forEach((item, i) => {
      cards.push({
        type: 'merch_drop',
        title: `🛍️ ${item.name}`,
        subtitle: `KSh ${item.price?.toLocaleString() || '---'}`,
        body: item.description || 'Official university sports merchandise. Get yours before it sells out!',
        emoji: '🔥',
        gradient: CARD_GRADIENTS.merch_drop,
        ctaLabel: 'Shop Now',
        ctaHref: '/merchandise',
        xpReward: 3,
        priority: 40 - i,
        metadata: { merchId: item.id, name: item.name, price: item.price, image: item.images?.[0] || item.image },
        reactions: zeroReactions,
      });
    });
  }

  // University pride
  if (data.universities.length > 0) {
    const uni = data.universities[Math.floor(Math.random() * data.universities.length)];
    const teamCount = data.teams.filter((t) => t.universityId === uni.id || t.university === uni.name).length;
    cards.push({
      type: 'university_pride',
      title: `🎓 ${uni.name}`,
      subtitle: uni.location || 'Kenya',
      body: `${teamCount} active sports team${teamCount !== 1 ? 's' : ''} competing this season. ${uni.description || 'Excellence in academics and athletics!'}`,
      emoji: '🏫',
      gradient: CARD_GRADIENTS.university_pride,
      ctaLabel: 'View Teams',
      ctaHref: '/teams',
      xpReward: 3,
      priority: 30,
      metadata: { universityId: uni.id, name: uni.name, teamCount },
      reactions: zeroReactions,
    });
  }

  // League update
  if (data.leagues.length > 0) {
    const league = data.leagues[0];
    cards.push({
      type: 'league_update',
      title: `🏅 ${league.name || 'League Update'}`,
      subtitle: league.sportName || 'Competition',
      body: league.description || 'Check the latest league standings and see how your university is performing!',
      emoji: '📈',
      gradient: CARD_GRADIENTS.league_update,
      ctaLabel: 'View Standings',
      ctaHref: '/league-explorer',
      xpReward: 5,
      priority: 50,
      metadata: { leagueId: league.id, name: league.name },
      reactions: zeroReactions,
    });
  }

  // Fan challenge (always generated)
  const challenges = [
    { q: 'Which university will win the most championships this season?', opts: data.universities.slice(0, 4).map((u: any) => u.name) },
    { q: 'What sport are you most excited to watch?', opts: ['Football', 'Rugby', 'Basketball', 'Athletics'] },
    { q: 'Predict the outcome of the next big match!', opts: ['Home Win', 'Draw', 'Away Win'] },
  ];
  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  cards.push({
    type: 'fan_challenge',
    title: '🎯 Fan Challenge',
    subtitle: 'Earn bonus XP!',
    body: challenge.q,
    emoji: '🧠',
    gradient: CARD_GRADIENTS.fan_challenge,
    ctaLabel: 'Vote Now',
    ctaHref: '#',
    xpReward: 15,
    priority: 55,
    metadata: { question: challenge.q, options: challenge.opts },
    reactions: zeroReactions,
  });

  // Sort by priority descending
  cards.sort((a, b) => b.priority - a.priority);

  return cards;
}
