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

const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// DB connection
const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema: { categories, expenses, budgets, settings } });

// Helper: get AI settings from DB
async function getAiSettings() {
  const rows = await db.select().from(settings);
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return {
    apiKey: map['ai_api_key'] || process.env.SUMOPOD_API_KEY || '',
    model: map['ai_model'] || process.env.AI_MODEL || 'gemini/gemini-2.0-flash',
    provider: map['ai_provider'] || 'sumopod',
    baseUrl: map['ai_base_url'] || process.env.SUMOPOD_BASE_URL || 'https://ai.sumopod.com',
  };
}

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

    // PUT /api/expenses/:id
    if (path.match(/^\/expenses\/\d+$/) && method === 'PUT') {
      const id = parseInt(path.split('/')[2]);
      const { title, amount, category, description, store, date, status } = req.body;
      const result = await db.update(expenses)
        .set({
          ...(title && { title }),
          ...(amount && { amount }),
          ...(category && { category }),
          ...(description !== undefined && { description }),
          ...(store !== undefined && { store }),
          ...(date && { date: new Date(date) }),
          ...(status && { status }),
        })
        .where(eq(expenses.id, id))
        .returning();
      if (result.length === 0) return res.status(404).json({ error: 'Expense not found' });
      return res.json(result[0]);
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

      // Get AI settings: client override > DB > env
      const aiSettings = await getAiSettings();
      const apiKey = clientApiKey || aiSettings.apiKey;
      const baseURL = aiSettings.baseUrl;
      const model = clientModel || aiSettings.model;

      if (!apiKey) return res.status(500).json({ error: 'API Key belum dikonfigurasi. Masukkan di menu Pengaturan.' });

      const openai = new OpenAI({ apiKey, baseURL });
      const response = await openai.chat.completions.create({
        model,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: image } },
            { type: 'text', text: `Kamu adalah OCR struk belanja. Analisa gambar struk/bon ini dengan teliti dan extract semua informasi ke format JSON berikut:

{
  "store": "nama toko/merchant yang tertera di struk",
  "date": "tanggal transaksi format YYYY-MM-DD",
  "items": [
    {"name": "nama barang", "qty": jumlah_beli, "price": harga_total_item_tersebut}
  ],
  "total": angka_total_keseluruhan,
  "category": "Material/Tukang/Alat/Lainnya"
}

PENTING - Rules ketat:
- items.price WAJIB diisi angka harga untuk setiap item (baca dari kolom harga/jumlah di struk). Jika ada qty > 1, price = harga_satuan x qty (harga total baris tersebut)
- Jika harga item tidak terbaca jelas, ESTIMASI dari total dibagi jumlah item
- total = angka total akhir yang tertera di struk (tanpa Rp, tanpa titik/koma pemisah ribuan)
- date format YYYY-MM-DD
- qty minimal 1
- category: bahan bangunan/material = "Material", jasa tukang = "Tukang", peralatan/tools = "Alat", lainnya = "Lainnya"
- Jawab HANYA JSON murni, tanpa markdown, tanpa backtick, tanpa penjelasan` },
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
      
      // If apiKey is 'USE_SAVED', get from DB
      let keyToUse = apiKey;
      if (!apiKey || apiKey === 'USE_SAVED') {
        const aiSettings = await getAiSettings();
        keyToUse = aiSettings.apiKey;
      }
      
      if (!keyToUse) return res.status(400).json({ error: 'API Key diperlukan' });

      const baseURL = provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : 'https://ai.sumopod.com';
      const openai = new OpenAI({ apiKey: keyToUse, baseURL });
      const response = await openai.chat.completions.create({
        model: model || 'gemini/gemini-2.0-flash',
        messages: [{ role: 'user', content: 'Respond with just: OK' }],
        max_tokens: 10,
      });
      const text = response.choices?.[0]?.message?.content || '';
      return res.json({ success: true, response: text });
    }

    // GET /api/settings — get AI settings
    if (path === '/settings' && method === 'GET') {
      const aiSettings = await getAiSettings();
      return res.json({
        provider: aiSettings.provider,
        model: aiSettings.model,
        apiKey: aiSettings.apiKey ? '••••••••' + aiSettings.apiKey.slice(-4) : '',
        hasApiKey: !!aiSettings.apiKey,
      });
    }

    // POST /api/settings — save AI settings to DB (global)
    if (path === '/settings' && method === 'POST') {
      const { apiKey, model, provider } = req.body;

      // Upsert each setting
      const upsert = async (key: string, value: string) => {
        if (!value) return;
        const existing = await db.select().from(settings).where(eq(settings.key, key));
        if (existing.length > 0) {
          await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
        } else {
          await db.insert(settings).values({ key, value });
        }
      };

      if (apiKey) await upsert('ai_api_key', apiKey);
      if (model) await upsert('ai_model', model);
      if (provider) await upsert('ai_provider', provider);

      return res.json({ success: true, message: 'Settings berhasil disimpan' });
    }

    // Not found
    return res.status(404).json({ error: 'Not found', path });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
