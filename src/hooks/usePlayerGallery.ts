import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  uploadedAt: any;
  uploadedBy: string;
}

export const usePlayerGallery = (playerId: string) => {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    if (!playerId) return;
    const q = query(collection(db, 'playerGallery', playerId, 'images'), orderBy('uploadedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setImages(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImage)));
    });
    return unsub;
  }, [playerId]);

  return images;
};