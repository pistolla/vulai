import { db } from './firebase';
import { collection, getDocs, doc, writeBatch, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { Fixture, Sport } from '../models';

/**
 * Automates moving fixtures between Scheduled -> Live -> Completed
 * based on current Server Timestamp logic mapped to sports durations.
 */
export const runAutomations = async () => {
    // 1. Fetch Sports configurations for dynamic duration resolving
    const sportsSnap = await getDocs(collection(db, 'sports'));
    const sportDurations: Record<string, number> = {};
    sportsSnap.docs.forEach(d => {
        const sportData = d.data() as Sport;
        sportDurations[sportData.name.toLowerCase()] = sportData.durationMinutes || 120;
    });

    // 2. Fetch admin games (both queues)
    const upcomingSnap = await getDocs(collection(db, 'admin', 'dashboard', 'upcomingGames'));
    const liveSnap = await getDocs(collection(db, 'admin', 'dashboard', 'liveGames'));
    
    const batch = writeBatch(db);
    const now = new Date();
    let changeCount = 0;

    // --- Process Upcoming to Live/Completed ---
    for (const d of upcomingSnap.docs) {
        const docData: any = d.data();
        const fixtureId = docData.fixtureId || docData.id;
        if (!docData.scheduledAt) continue;
        
        const scheduledTime = new Date(docData.scheduledAt);
        if (now >= scheduledTime) {
            const sportName = docData.sport?.toLowerCase() || '';
            const duration = sportDurations[sportName] || 120; // Default 120 mins
            const endTime = new Date(scheduledTime.getTime() + duration * 60000);
            
            if (now >= endTime) {
                // Game actually already finished
                batch.delete(d.ref); 
                
                const logRef = doc(collection(db, 'automationLogs'));
                batch.set(logRef, {
                    timestamp: serverTimestamp(),
                    fixtureId: fixtureId,
                    sport: docData.sport,
                    oldStatus: docData.status || 'scheduled',
                    newStatus: 'completed',
                    reason: 'Time bypassed scheduled start and maximum sport duration limit.'
                });

                if (docData.seasonId) {
                   batch.update(doc(db, `fixtures/${docData.seasonId}/matches/${fixtureId}`), { status: 'completed' });
                }
                changeCount++;
            } else {
                // Game has transitioned to LIVE
                batch.delete(d.ref);
                
                const newLiveRef = doc(collection(db, 'admin', 'dashboard', 'liveGames'));
                batch.set(newLiveRef, { ...docData, status: 'live' });

                const logRef = doc(collection(db, 'automationLogs'));
                batch.set(logRef, {
                    timestamp: serverTimestamp(),
                    fixtureId: fixtureId,
                    sport: docData.sport,
                    oldStatus: docData.status || 'scheduled',
                    newStatus: 'live',
                    reason: 'Current time reached scheduled match inception.'
                });

                if (docData.seasonId) {
                   batch.update(doc(db, `fixtures/${docData.seasonId}/matches/${fixtureId}`), { status: 'live' });
                }
                changeCount++;
            }
        }
    }

    // --- Process Live to Completed ---
    for (const d of liveSnap.docs) {
        const docData: any = d.data();
        const fixtureId = docData.fixtureId || docData.id;
        if (!docData.scheduledAt) continue;

        const scheduledTime = new Date(docData.scheduledAt);
        const sportName = docData.sport?.toLowerCase() || '';
        const duration = sportDurations[sportName] || 120;
        const endTime = new Date(scheduledTime.getTime() + duration * 60000);

        if (now >= endTime) {
            batch.delete(d.ref);

            const logRef = doc(collection(db, 'automationLogs'));
            batch.set(logRef, {
                timestamp: serverTimestamp(),
                fixtureId: fixtureId,
                sport: docData.sport,
                oldStatus: docData.status || 'live',
                newStatus: 'completed',
                reason: 'Time bypassed maximum sport duration limit.'
            });

            if (docData.seasonId) {
               batch.update(doc(db, `fixtures/${docData.seasonId}/matches/${fixtureId}`), { status: 'completed' });
            }
            changeCount++;
        }
    }

    if (changeCount > 0) {
        await batch.commit();
        console.log(`[Automation Service] Committed ${changeCount} status shifts.`);
    }

    return changeCount;
};
