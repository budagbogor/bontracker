import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const result = await db.select().from(schema.categories);
      return res.json(result);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, icon, color } = req.body;
      const result = await db.insert(schema.categories).values({ name, icon, color }).returning();
      return res.json(result[0]);
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({ error: 'Failed to create category' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
