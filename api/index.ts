import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc, eq, sql } from 'drizzle-orm';
import { pgTable, serial, text, integer, timestamp, decimal, varchar } from 'drizzle-orm/pg-core';
import OpenAI from 'openai';

// Schema
const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),
  color: varchar('color', { length: 50 }).default('orange'),
  createdAt: timestamp('created_at').defaultNow(),
});

const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description'),
  store: varchar('store', { length: 255 }),
  date: timestamp('date').defaultNow().notNull(),
  status: varchar('status', { length: 50 }).default('success'),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  totalBudget: decimal('total_budget', { precision: 15, scale: 2 }).notNull(),
  projectName: varchar('project_name', { length: 255 }).notNull(),
  currentPhase: varchar('current_phase', { length: 255 }),
  estimatedCompletion: varchar('estimated_completion', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// DB connection
const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema: { categories, expenses, budgets } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Parse the path after /api/
  const { url, method } = req;
  const path = url?.replace(/^\/api/, '') || '/';

  try {
    // GET /api/dashboard/summary
    if (path === '/dashboard/summary' && method === 'GET') {
      const totalSpent = await db.select({
        total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      }).from(expenses);

      const byCategory = await db.select({
        category: expenses.category,
        total: sql<string>`SUM(${expenses.amount})`,
        count: sql<number>`COUNT(*)`,
      }).from(expenses).groupBy(expenses.category);

      const budget = await db.select().from(budgets).limit(1);

      const recentExpenses = await db.select()
        .from(expenses)
        .orderBy(desc(expenses.date))
        .limit(5);

      return res.json({
        totalSpent: totalSpent[0]?.total || '0',
        byCategory,
        budget: budget[0] || null,
        recentExpenses,
      });
    }

    // GET /api/expenses
    if (path === '/expenses' && method === 'GET') {
      const result = await db.select().from(expenses).orderBy(desc(expenses.date));
      return res.json(result);
    }

    // POST /api/expenses
    if (path === '/expenses' && method === 'POST') {
      const { title, amount, categoryId, category, description, store, date, status, receiptUrl } = req.body;
      const result = await db.insert(expenses).values({
        title, amount, categoryId, category, description, store,
        date: date ? new Date(date) : new Date(),
        status: status || 'success',
        receiptUrl,
      }).returning();
      return res.json(result[0]);
    }

    // DELETE /api/expenses (all)
    if (path === '/expenses' && method === 'DELETE') {
      await db.delete(expenses);
      return res.json({ success: true, message: 'Semua data pengeluaran berhasil dihapus' });
    }

    // DELETE /api/expenses/:id
    if (path.match(/^\/expenses\/\d+$/) && method === 'DELETE') {
      const id = parseInt(path.split('/')[2]);
      await db.delete(expenses).where(eq(expenses.id, id));
      return res.json({ success: true });
    }

    // GET /api/categories
    if (path === '/categories' && method === 'GET') {
      const result = await db.select().from(categories);
      return res.json(result);
    }

    // POST /api/categories
    if (path === '/categories' && method === 'POST') {
      const { name, icon, color } = req.body;
      const result = await db.insert(categories).values({ name, icon, color }).returning();
      return res.json(result[0]);
    }

    // GET /api/budget
    if (path === '/budget' && method === 'GET') {
      const result = await db.select().from(budgets).limit(1);
      return res.json(result.length === 0 ? null : result[0]);
    }

    // POST /api/budget
    if (path === '/budget' && method === 'POST') {
      const { totalBudget, projectName, currentPhase, estimatedCompletion } = req.body;
      const existing = await db.select().from(budgets).limit(1);
      let result;
      if (existing.length > 0) {
        result = await db.update(budgets)
          .set({ totalBudget, projectName, currentPhase, estimatedCompletion, updatedAt: new Date() })
          .where(eq(budgets.id, existing[0].id))
          .returning();
      } else {
        result = await db.insert(budgets).values({ totalBudget, projectName, currentPhase, estimatedCompletion }).returning();
      }
      return res.json(result[0]);
    }

    // POST /api/reset
    if (path === '/reset' && method === 'POST') {
      await db.delete(expenses);
      await db.delete(categories);
      await db.delete(budgets);
      return res.json({ success: true, message: 'Semua data berhasil direset' });
    }

    // POST /api/ocr/receipt
    if (path === '/ocr/receipt' && method === 'POST') {
      const { image, apiKey: clientApiKey, model: clientModel } = req.body;
      if (!image) return res.status(400).json({ error: 'Image is required' });

      const apiKey = clientApiKey || process.env.SUMOPOD_API_KEY;
      const baseURL = process.env.SUMOPOD_BASE_URL || 'https://ai.sumopod.com';
      const model = clientModel || process.env.AI_MODEL || 'gemini/gemini-2.0-flash';

      if (!apiKey) return res.status(500).json({ error: 'API Key belum dikonfigurasi. Masukkan di menu Pengaturan.' });

      const openai = new OpenAI({ apiKey, baseURL });
      const response = await openai.chat.completions.create({
        model,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: image } },
            { type: 'text', text: `Analisa gambar struk/bon ini dan extract informasi berikut dalam format JSON:\n{\n  "store": "nama toko/merchant",\n  "date": "tanggal transaksi dalam format YYYY-MM-DD",\n  "items": [{"name": "nama item", "qty": jumlah, "price": harga_satuan}],\n  "total": total_belanja_angka_saja,\n  "category": "salah satu dari: Material, Tukang, Alat, Lainnya"\n}\n\nRules:\n- Jika tidak bisa membaca field tertentu, isi dengan null\n- total harus berupa angka (tanpa Rp atau titik pemisah ribuan)\n- date harus format YYYY-MM-DD\n- category tentukan berdasarkan jenis barang yang dibeli (bahan bangunan = Material, jasa tukang = Tukang, peralatan = Alat, sisanya = Lainnya)\n- Jawab HANYA dengan JSON, tanpa markdown atau penjelasan lain` },
          ],
        }],
        max_tokens: 1024,
      });

      const text = response.choices?.[0]?.message?.content || '';
      let parsed;
      try {
        const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(jsonStr);
      } catch {
        return res.status(500).json({ error: 'Gagal memproses hasil OCR', raw: text });
      }
      return res.json(parsed);
    }

    // POST /api/ai/test
    if (path === '/ai/test' && method === 'POST') {
      const { apiKey, model, provider } = req.body;
      if (!apiKey) return res.status(400).json({ error: 'API Key diperlukan' });

      const baseURL = provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : 'https://ai.sumopod.com';
      const openai = new OpenAI({ apiKey, baseURL });
      const response = await openai.chat.completions.create({
        model: model || 'gemini/gemini-2.0-flash',
        messages: [{ role: 'user', content: 'Respond with just: OK' }],
        max_tokens: 10,
      });
      const text = response.choices?.[0]?.message?.content || '';
      return res.json({ success: true, response: text });
    }

    // Not found
    return res.status(404).json({ error: 'Not found', path });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
