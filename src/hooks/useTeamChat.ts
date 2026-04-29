import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export interface ChatMessage {
    id: string;
    user: string;
    text: string;
    timestamp: number;
    avatar?: string;
    isMascot?: boolean;
}

export function useTeamChat(teamId?: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!teamId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, `teams/${teamId}/chats`),
            orderBy('timestamp', 'asc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages: ChatMessage[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    user: data.user,
                    text: data.text,
                    timestamp: data.timestamp?.toMillis() || Date.now(),
                    avatar: data.avatar,
                    isMascot: data.isMascot
                };
            });
            setMessages(fetchedMessages);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching chat messages:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [teamId]);

    const sendMessage = async (user: { name: string; avatar?: string }, text: string) => {
        if (!teamId || !text.trim()) return;

        try {
            await addDoc(collection(db, `teams/${teamId}/chats`), {
                user: user.name,
                text: text.trim(),
                timestamp: serverTimestamp(),
                avatar: user.avatar || null,
            });

            // Trigger mascot if they mention @mascot
            if (text.toLowerCase().includes('@mascot')) {
                setIsTyping(true);
                // Call our API endpoint to handle the Gemini reply
                fetch('/api/chat/mascot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamId, userMessage: text, userName: user.name })
                })
                .finally(() => setIsTyping(false))
                .catch(err => console.error('Error calling mascot:', err));
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return { messages, sendMessage, loading, isTyping };
}
