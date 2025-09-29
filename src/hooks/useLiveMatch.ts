import { useEffect, useState } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface LiveEvent {
  id: string;
  minute: number;
  type: 'goal' | 'card' | 'substitution' | 'text';
  teamId: string;
  playerId?: string;
  body: string;
  createdAt: any;
}

export interface MatchLive {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  status: 'scheduled' | 'live' | 'completed';
  events: LiveEvent[];
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  attacks: { home: number; away: number };
  passAccuracy: { home: number; away: number };
}

export const useLiveMatch = (matchId: string) => {
  const [match, setMatch] = useState<MatchLive | null>(null);

  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, 'liveMatches', matchId), (snap) => {
      if (snap.exists()) setMatch({ id: snap.id, ...snap.data() } as MatchLive);
      else setMatch(null);
    });
    return unsub;
  }, [matchId]);

  return match;
};