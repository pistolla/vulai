import { collection, onSnapshot, addDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  createdAt: any;
}

export const subscribeFanChat = (fixtureId: string, cb: (msgs: ChatMessage[]) => void) => {
  const q = query(collection(db, 'fanChat', fixtureId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
    cb(msgs);
  });
};

export const sendFanChatMessage = async (fixtureId: string, uid: string, userName: string, text: string) => {
  await addDoc(collection(db, 'fanChat', fixtureId, 'messages'), {
    user: userName,
    text,
    createdAt: serverTimestamp(),
  });
};