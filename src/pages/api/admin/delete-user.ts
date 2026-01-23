import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error: any) {
        console.error('Firebase admin initialization error', error.stack);
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { uid } = req.query;

    if (!uid || typeof uid !== 'string') {
        return res.status(400).json({ message: 'Missing or invalid uid provided' });
    }

    try {
        // 1. Delete from Firebase Authentication
        await admin.auth().deleteUser(uid);

        // 2. Delete from Firestore (Optional: if you prefer to keep this logic server-side for consistency)
        // For now, we will assume the client handles it or we do it here. 
        // The plan said: "Delete user from Firestore (optional, if we move logic here... Decision: Move Firestore deletion to this API route for consistency)"
        await admin.firestore().collection('users').doc(uid).delete();

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
