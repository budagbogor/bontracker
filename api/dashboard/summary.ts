import type { VercelRequest, VercelResponse } from '@vercel/node';
import { desc, sql } from 'drizzle-orm';
import { db, schema } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const totalSpent = await db.select({
      total: sql<string>`COALESCE(SUM(${schema.expenses.amount}), 0)`,
    }).from(schema.expenses);

    const byCategory = await db.select({
      category: schema.expenses.category,
      total: sql<string>`SUM(${schema.expenses.amount})`,
      count: sql<number>`COUNT(*)`,
    }).from(schema.expenses).groupBy(schema.expenses.category);

    const budget = await db.select().from(schema.budgets).limit(1);

    const recentExpenses = await db.select()
      .from(schema.expenses)
      .orderBy(desc(schema.expenses.date))
      .limit(5);

    return res.json({
      totalSpent: totalSpent[0]?.total || '0',
      byCategory,
      budget: budget[0] || null,
      recentExpenses,
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
}
