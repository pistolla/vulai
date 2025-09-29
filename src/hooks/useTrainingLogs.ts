import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface TrainingLog {
  id: string;
  date: string;
  type: 'gym' | 'pitch' | 'recovery';
  duration: number; // minutes
  intensity: 1 | 2 | 3 | 4 | 5;
  notes: string;
  recordedBy: string;
}

export const useTrainingLogs = (playerId: string, limitCount = 10) => {
  const [logs, setLogs] = useState<TrainingLog[]>([]);

  useEffect(() => {
    if (!playerId) return;
    const q = query(collection(db, 'trainingLogs', playerId, 'logs'), orderBy('date', 'desc'), limit(limitCount));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingLog)));
    });
    return unsub;
  }, [playerId, limitCount]);

  return logs;
};