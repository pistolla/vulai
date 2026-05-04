import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        // Check if we have real private keys, not the placeholder
        if (process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('Your_Private_Key')) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        } else {
            console.warn('⚠️ FIREBASE_PRIVATE_KEY is missing or invalid. Falling back to default application credentials.');
            admin.initializeApp();
        }
    } catch (error: any) {
        console.error('Firebase admin initialization error:', error.message);
        // If it still fails, initialize a blank app so at least we get Auth/Firestore permission errors instead of "App doesn't exist"
        if (!admin.apps.length) {
             admin.initializeApp();
        }
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, password, role, name, university, needsPasswordReset } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // 1. Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });

        const uid = userRecord.uid;

        // 2. Create profile in Firestore
        const profile = {
            email,
            role: role || 'fan',
            universityId: university || null,
            displayName: name || email.split('@')[0],
            needsPasswordReset: !!needsPasswordReset,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await admin.firestore().collection('users').doc(uid).set(profile);

        return res.status(200).json({ message: 'User created successfully', uid });
    } catch (error: any) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
}
