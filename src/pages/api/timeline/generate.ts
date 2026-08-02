import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Timeline Generation — Proxy to Firebase Cloud Function
 *
 * Previously ran the full pipeline locally. Now proxies to the deployed
 * Firebase Function at europe-west1.
 */

const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_BASE_URL
  || 'http://127.0.0.1:5001/unill-20c41/europe-west1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const force = req.query.force === 'true' || req.body?.force === true;
    const url = `${FUNCTIONS_BASE_URL}/timelineGenerate${force ? '?force=true' : ''}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('[Timeline Proxy] Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
