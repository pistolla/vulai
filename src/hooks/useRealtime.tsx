import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { db } from '@/services/firebase'; // Ensure this points to your client-side firebase init
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';

interface RealtimeContextType {
    liveMatches: any[];
    latestEvent: any | null;
}

const RealtimeContext = createContext<RealtimeContextType>({
    liveMatches: [],
    latestEvent: null,
});

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
    const [liveMatches, setLiveMatches] = useState<any[]>([]);
    const [latestEvent, setLatestEvent] = useState<any | null>(null);

    useEffect(() => {
        // 1. Listen for Live Games
        const qGames = query(collection(db, 'fixtures'), where('status', '==', 'live'));
        const unsubscribeGames = onSnapshot(qGames, (snapshot) => {
            const matches = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setLiveMatches(matches);
        }, (error) => {
            console.error("Error listening to live games:", error);
        });

        // 2. Listen for "Live Events" (Global stream of goals/cards)
        // Assuming a collection 'live_events' exists where admins push updates
        // We order by 'createdAt' descending and limit to 1 to get the newest "Pop"
        const qEvents = query(
            collection(db, 'live_events'),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
            if (!snapshot.empty) {
                const eventData = snapshot.docs[0].data();
                // Only show if it's recent (e.g. within last 10 seconds) to avoid popping old events on page load
                const now = new Date();
                const eventTime = eventData.createdAt instanceof Timestamp ? eventData.createdAt.toDate() : new Date(eventData.createdAt);

                if (now.getTime() - eventTime.getTime() < 10000) {
                    setLatestEvent({ id: snapshot.docs[0].id, ...eventData });
                }
            }
        }, (error) => {
            // Silent fail for events if collection doesn't exist yet
            console.warn("Live events listener warning:", error);
        });

        return () => {
            unsubscribeGames();
            unsubscribeEvents();
        };
    }, []);

    return (
        <RealtimeContext.Provider value={{ liveMatches, latestEvent }}>
            {children}
        </RealtimeContext.Provider>
    );
};

export const useRealtime = () => useContext(RealtimeContext);
