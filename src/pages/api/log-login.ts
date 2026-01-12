import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, role, status, uid, university } = req.body;

    // Get IP address
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';

    // Get user agent
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Parse browser info
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                    userAgent.includes('Firefox') ? 'Firefox' :
                    userAgent.includes('Safari') ? 'Safari' :
                    userAgent.includes('Edge') ? 'Edge' : 'Unknown';

    await addDoc(collection(db, 'admin', 'dashboard', 'recentUsers'), {
      name,
      role,
      status,
      uid,
      university,
      timestamp: serverTimestamp(),
      ip: Array.isArray(ip) ? ip[0] : ip,
      clientBrowser: browser,
      userAgent
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to log login:', error);
    res.status(500).json({ error: 'Failed to log login' });
  }
}