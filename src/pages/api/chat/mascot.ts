import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('Your_Private_Key')) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        } else {
            admin.initializeApp();
        }
    } catch (error: any) {
        console.error('Firebase admin initialization error:', error.message);
        if (!admin.apps.length) {
             admin.initializeApp();
        }
    }
}

const ai = new GoogleGenAI({}); // Automatically picks up process.env.GEMINI_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { teamId, userMessage, userName } = req.body;

    if (!teamId || !userMessage) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // 1. Fetch Team Data for Context
        const teamDoc = await admin.firestore().collection('teams').doc(teamId).get();
        if (!teamDoc.exists) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const teamData = teamDoc.data();
        const teamName = teamData?.name || 'The Team';
        const sport = teamData?.sport || 'Sports';
        
        // Fetch Matches/Fixtures associated with the team
        // Look in both 'fixtures' and 'schedule' or use collectionGroup 'matches'
        // For simplicity in the API route, we'll fetch from the global schedule collection if available
        let teamMatches: any[] = [];
        try {
            const matchesSnap = await admin.firestore().collection('schedule').get();
            teamMatches = matchesSnap.docs
                .map(d => d.data())
                .filter(m => m.homeTeam === teamName || m.awayTeam === teamName || m.homeTeamName === teamName || m.awayTeamName === teamName)
                .slice(0, 5); // Limit to 5 matches to keep context window manageable
        } catch (e) {
            console.warn("Could not fetch matches for mascot context", e);
        }

        // Format Roster
        const roster = teamData?.players?.map((p: any) => `${p.name} (Position: ${p.position || 'Unknown'}, Number: ${p.number || 'N/A'})`).join(', ') || 'Roster not available';
        
        // Format Matches
        const scheduleText = teamMatches.length > 0 
            ? teamMatches.map(m => `${m.homeTeam || m.homeTeamName} vs ${m.awayTeam || m.awayTeamName} - Status: ${m.status}`).join('\n')
            : 'No upcoming matches scheduled.';

        // Formulate the Mascot Persona Context with Structured Data
        const systemPrompt = `
You are the official, highly energetic mascot for "${teamName}", a university ${sport} team. 
Your goal is to answer fan questions with high energy, enthusiasm, and deep knowledge about the team.

---
### TEAM KNOWLEDGE BASE
Use the following real-time data to answer questions accurately. Do not invent stats or players.

**General Stats:**
- Wins: ${teamData?.stats?.wins || 'N/A'}
- Ranking: ${teamData?.stats?.ranking || 'N/A'}
- Matches Played: ${teamData?.stats?.matchesPlayed || 'N/A'}

**Team Roster:**
${roster}

**Recent & Upcoming Matches:**
${scheduleText}
---

### PERSONALITY RULES
1. Keep responses short, punchy, and energetic (under 3 sentences).
2. Use lots of emojis! 🐾🔥🏆
3. Never break character. You are the mascot.
4. If asked something unrelated to sports, steer the conversation back to cheering for ${teamName}.
`;

        const userPrompt = `${userName} says: "${userMessage}"`;

        // 2. Call Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
            }
        });

        const mascotReply = response.text || "WOOOO! Let's go team! Sorry, my mascot suit is a bit hard to hear through right now!";

        // 3. Save Mascot Reply to Firestore Chat
        await admin.firestore().collection(`teams/${teamId}/chats`).add({
            user: `${teamName} Mascot`,
            text: mascotReply,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            avatar: teamData?.logoURL || null,
            isMascot: true
        });

        return res.status(200).json({ message: 'Mascot replied successfully', reply: mascotReply });
    } catch (error: any) {
        console.error('Error generating mascot reply:', error);
        
        // Fallback response if API key fails or Gemini errors out
        const fallbackReply = `GOOOO TEAM!!! 🐾 Let's get that win!`;
        await admin.firestore().collection(`teams/${teamId}/chats`).add({
            user: `Mascot`,
            text: fallbackReply,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            isMascot: true
        });

        return res.status(500).json({ message: 'Error generating response, used fallback.' });
    }
}
