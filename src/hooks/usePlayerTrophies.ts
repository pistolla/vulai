import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface Trophy {
  id: string;
  title: string;
  season: string;
  competition: string;
  imageUrl?: string;
}

export const usePlayerTrophies = (playerId: string) => {
  const [trophies, setTrophies] = useState<Trophy[]>([]);

  useEffect(() => {
    if (!playerId) return;
    const q = query(collection(db, 'playerTrophies', playerId, 'trophies'), orderBy('season', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTrophies(snap.docs.map(d => ({ id: d.id, ...d.data() } as Trophy)));
    });
    return unsub;
  }, [playerId]);

  return trophies;
};