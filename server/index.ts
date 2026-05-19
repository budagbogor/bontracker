import express from 'express';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc, eq, sql } from 'drizzle-orm';
import OpenAI from 'openai';
import * as schema from '../src/db/schema';
import { pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Database connection
const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

// Settings table
const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

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

// ============ CATEGORIES ============

// Get all categories
app.get('/api/categories', async (_req, res) => {
  try {
    const result = await db.select().from(schema.categories);
    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const result = await db.insert(schema.categories).values({ name, icon, color }).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// ============ EXPENSES ============

// Get all expenses
app.get('/api/expenses', async (_req, res) => {
  try {
    const result = await db.select().from(schema.expenses).orderBy(desc(schema.expenses.date));
    res.json(result);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create expense
app.post('/api/expenses', async (req, res) => {
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
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(schema.expenses).where(eq(schema.expenses.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// ============ BUDGETS ============

// Get budget
app.get('/api/budget', async (_req, res) => {
  try {
    const result = await db.select().from(schema.budgets).limit(1);
    if (result.length === 0) {
      res.json(null);
    } else {
      res.json(result[0]);
    }
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// Create or update budget
app.post('/api/budget', async (req, res) => {
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
    res.json(result[0]);
  } catch (error) {
    console.error('Error saving budget:', error);
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

// ============ DASHBOARD SUMMARY ============

// Get dashboard summary (total spent, by category)
app.get('/api/dashboard/summary', async (_req, res) => {
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

    res.json({
      totalSpent: totalSpent[0]?.total || '0',
      byCategory,
      budget: budget[0] || null,
      recentExpenses,
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// ============ OCR (Sumopod AI - OpenAI Compatible) ============

app.post('/api/ocr/receipt', async (req, res) => {
  try {
    const { image, apiKey: clientApiKey, model: clientModel } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Get AI settings: client override > DB > env
    const aiSettings = await getAiSettings();
    const apiKey = clientApiKey || aiSettings.apiKey;
    const baseURL = aiSettings.baseUrl;
    const model = clientModel || aiSettings.model;

    if (!apiKey) {
      return res.status(500).json({ error: 'API Key belum dikonfigurasi. Masukkan di menu Pengaturan.' });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL,
    });

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: image },
            },
            {
              type: 'text',
              text: `Analisa gambar struk/bon ini dan extract informasi berikut dalam format JSON:
{
  "store": "nama toko/merchant",
  "date": "tanggal transaksi dalam format YYYY-MM-DD",
  "items": [{"name": "nama item", "qty": jumlah, "price": harga_satuan}],
  "total": total_belanja_angka_saja,
  "category": "salah satu dari: Material, Tukang, Alat, Lainnya"
}

Rules:
- Jika tidak bisa membaca field tertentu, isi dengan null
- total harus berupa angka (tanpa Rp atau titik pemisah ribuan)
- date harus format YYYY-MM-DD
- category tentukan berdasarkan jenis barang yang dibeli (bahan bangunan = Material, jasa tukang = Tukang, peralatan = Alat, sisanya = Lainnya)
- Jawab HANYA dengan JSON, tanpa markdown atau penjelasan lain`,
            },
          ],
        },
      ],
      max_tokens: 1024,
    });

    const text = response.choices?.[0]?.message?.content || '';

    // Parse JSON from response (handle potential markdown wrapping)
    let parsed;
    try {
      const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response:', text);
      return res.status(500).json({ error: 'Gagal memproses hasil OCR', raw: text });
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: error.message || 'OCR processing failed' });
  }
});

// ============ AI SETTINGS (Test Connection) ============

app.post('/api/ai/test', async (req, res) => {
  try {
    const { apiKey, model, provider } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API Key diperlukan' });
    }

    const baseURL = provider === 'openrouter' 
      ? 'https://openrouter.ai/api/v1' 
      : 'https://ai.sumopod.com';

    const openai = new OpenAI({ apiKey, baseURL });

    const response = await openai.chat.completions.create({
      model: model || 'gemini/gemini-2.0-flash',
      messages: [{ role: 'user', content: 'Respond with just: OK' }],
      max_tokens: 10,
    });

    const text = response.choices?.[0]?.message?.content || '';
    res.json({ success: true, response: text });
  } catch (error: any) {
    console.error('AI Test Error:', error);
    res.status(500).json({ error: error.message || 'Connection test failed' });
  }
});

// ============ SETTINGS (Global) ============

app.get('/api/settings', async (_req, res) => {
  try {
    const aiSettings = await getAiSettings();
    res.json({
      provider: aiSettings.provider,
      model: aiSettings.model,
      apiKey: aiSettings.apiKey ? '••••••••' + aiSettings.apiKey.slice(-4) : '',
      hasApiKey: !!aiSettings.apiKey,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { apiKey, model, provider } = req.body;

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

    res.json({ success: true, message: 'Settings berhasil disimpan' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ============ RESET DATA ============

// Delete all expenses
app.delete('/api/expenses', async (_req, res) => {
  try {
    await db.delete(schema.expenses);
    res.json({ success: true, message: 'Semua data pengeluaran berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting all expenses:', error);
    res.status(500).json({ error: 'Gagal menghapus data pengeluaran' });
  }
});

// Reset all data (expenses, categories, budgets)
app.post('/api/reset', async (_req, res) => {
  try {
    await db.delete(schema.expenses);
    await db.delete(schema.categories);
    await db.delete(schema.budgets);
    res.json({ success: true, message: 'Semua data berhasil direset' });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ error: 'Gagal mereset data' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
