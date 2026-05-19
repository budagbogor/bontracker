import type { VercelRequest, VercelResponse } from '@vercel/node';
import { desc } from 'drizzle-orm';
import { db, schema } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const result = await db.select().from(schema.expenses).orderBy(desc(schema.expenses.date));
      return res.json(result);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, amount, categoryId, category, description, store, date, status, receiptUrl } = req.body;
      const result = await db.insert(schema.expenses).values({
        title,
        amount,
        categoryId,
        category,
        description,
        store,
        date: date ? new Date(date) : new Date(),
        status: status || 'success',
        receiptUrl,
      }).returning();
      return res.json(result[0]);
    } catch (error) {
      console.error('Error creating expense:', error);
      return res.status(500).json({ error: 'Failed to create expense' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.delete(schema.expenses);
      return res.json({ success: true, message: 'Semua data pengeluaran berhasil dihapus' });
    } catch (error) {
      console.error('Error deleting all expenses:', error);
      return res.status(500).json({ error: 'Gagal menghapus data pengeluaran' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
