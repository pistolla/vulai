import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface PlayerStat {
  id: string;
  playerId: string;
  fixtureId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  passes: number;
  passAccuracy: number;
  tackles: number;
  interceptions: number;
  distanceCovered: number;
  updatedAt: any;
}

export const usePlayerStats = (playerId: string, fixtureId?: string) => {
  const [stats, setStats] = useState<PlayerStat | null>(null);

  useEffect(() => {
    if (!playerId) return;
    const q = fixtureId
      ? query(collection(db, 'playerStats'), where('playerId', '==', playerId), where('fixtureId', '==', fixtureId))
      : query(collection(db, 'playerStats'), where('playerId', '==', playerId), orderBy('updatedAt', 'desc'), limit(1));

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setStats({ id: snap.docs[0].id, ...snap.docs[0].data() } as PlayerStat);
      else setStats(null);
    });
    return unsub;
  }, [playerId, fixtureId]);

  return stats;
};