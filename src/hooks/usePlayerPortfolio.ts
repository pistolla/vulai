import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface Player {
  id: string;
  name: string;
  position: string;
  teamId: string;
  height: number; // cm
  weight: number; // kg
  bodyFat: number; // %
  status: 'active' | 'injured' | 'suspended' | 'quit' | 'shedding' | 'massing';
  injuryNote: string;
  joinedAt: string;
  kitNumber: number;
  socials: { instagram?: string; twitter?: string };
}

export const usePlayerPortfolio = (playerId: string) => {
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (!playerId) return;
    const unsub = onSnapshot(doc(db, 'players', playerId), (snap) => {
      if (snap.exists()) setPlayer({ id: snap.id, ...snap.data() } as Player);
      else setPlayer(null);
    });
    return unsub;
  }, [playerId]);

  return player;
};