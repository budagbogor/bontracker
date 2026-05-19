import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db, schema } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await db.delete(schema.expenses).where(eq(schema.expenses.id, parseInt(id as string)));
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting expense:', error);
      return res.status(500).json({ error: 'Failed to delete expense' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
