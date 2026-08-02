import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Delete User — Proxy to Firebase Cloud Function
 *
 * Previously ran Firebase Admin locally. Now proxies to the deployed
 * Firebase Function with admin token verification.
 */

const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_BASE_URL
  || 'http://127.0.0.1:5001/unill-20c41/europe-west1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { uid } = req.query;

  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid uid provided' });
  }

  try {
    const url = `${FUNCTIONS_BASE_URL}/adminDeleteUser?uid=${uid}`;

    // Forward the authorization header if present
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('[Delete User Proxy] Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
