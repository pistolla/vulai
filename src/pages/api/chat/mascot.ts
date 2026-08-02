import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Mascot Chat — Proxy to Firebase Cloud Function
 *
 * Previously ran Gemini + Firebase Admin locally. Now proxies to the
 * deployed Firebase Function at europe-west1.
 */

const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_BASE_URL
  || 'http://127.0.0.1:5001/unill-20c41/europe-west1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { teamId, userMessage, userName } = req.body;
  if (!teamId || !userMessage) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const url = `${FUNCTIONS_BASE_URL}/mascotChat`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, userMessage, userName }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('[Mascot Proxy] Error:', error);
    return res.status(500).json({ message: 'Error generating response, used fallback.' });
  }
}
