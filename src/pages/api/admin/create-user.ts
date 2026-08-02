import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/services/firebase';

/**
 * Create User — Proxy to Firebase Cloud Function
 *
 * Previously ran Firebase Admin locally. Now proxies to the deployed
 * Firebase Function with admin token verification.
 */

const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_BASE_URL
  || 'http://127.0.0.1:5001/unill-20c41/europe-west1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, role, name, university, needsPasswordReset } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const url = `${FUNCTIONS_BASE_URL}/adminCreateUser`;

    // Forward the authorization header if present
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password, role, name, university, needsPasswordReset }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('[Create User Proxy] Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
