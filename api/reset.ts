import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await db.delete(schema.expenses);
    await db.delete(schema.categories);
    await db.delete(schema.budgets);
    return res.json({ success: true, message: 'Semua data berhasil direset' });
  } catch (error) {
    console.error('Error resetting data:', error);
    return res.status(500).json({ error: 'Gagal mereset data' });
  }
}
