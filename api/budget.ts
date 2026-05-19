import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db, schema } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const result = await db.select().from(schema.budgets).limit(1);
      if (result.length === 0) {
        return res.json(null);
      }
      return res.json(result[0]);
    } catch (error) {
      console.error('Error fetching budget:', error);
      return res.status(500).json({ error: 'Failed to fetch budget' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { totalBudget, projectName, currentPhase, estimatedCompletion } = req.body;
      const existing = await db.select().from(schema.budgets).limit(1);

      let result;
      if (existing.length > 0) {
        result = await db.update(schema.budgets)
          .set({ totalBudget, projectName, currentPhase, estimatedCompletion, updatedAt: new Date() })
          .where(eq(schema.budgets.id, existing[0].id))
          .returning();
      } else {
        result = await db.insert(schema.budgets).values({
          totalBudget,
          projectName,
          currentPhase,
          estimatedCompletion,
        }).returning();
      }
      return res.json(result[0]);
    } catch (error) {
      console.error('Error saving budget:', error);
      return res.status(500).json({ error: 'Failed to save budget' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
