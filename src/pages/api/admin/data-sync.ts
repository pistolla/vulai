import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Data Sync — Proxy to Firebase Cloud Function
 *
 * Proxies to the deployed Firebase Function for manual data sync.
 */

const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_BASE_URL
  || 'http://127.0.0.1:5001/unill-20c41/europe-west1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const url = `${FUNCTIONS_BASE_URL}/dataSyncManual`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('[Data Sync Proxy] Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
}
