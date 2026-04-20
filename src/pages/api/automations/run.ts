import type { NextApiRequest, NextApiResponse } from 'next';
import { runAutomations } from '@/services/automationService';

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
    console.log('[API] Triggering global Fixture temporal sync execution...');
    const changeCount = await runAutomations();
    
    res.status(200).json({ 
      success: true, 
      changes: changeCount,
      message: `Successfully executed lifecycle checks. Applied ${changeCount} status shifts.` 
    });
  } catch (err: any) {
    console.error('[API Error] Automation Execution Failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}
