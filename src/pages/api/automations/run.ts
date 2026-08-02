import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Automations — Proxy to Firebase Cloud Function
 *
 * Previously ran automation logic locally. Now proxies to the deployed
 * Firebase Function at europe-west1.
 */

const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_BASE_URL
  || 'http://127.0.0.1:5001/unill-20c41/europe-west1';

type Data = {
  success: boolean;
  changes?: number;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('[API Proxy] Forwarding automation request to Cloud Function…');
    const url = `${FUNCTIONS_BASE_URL}/automationsRun`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    console.error('[API Proxy] Automation error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
