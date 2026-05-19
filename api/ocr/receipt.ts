import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, apiKey: clientApiKey, model: clientModel } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const apiKey = clientApiKey || process.env.SUMOPOD_API_KEY;
    const baseURL = process.env.SUMOPOD_BASE_URL || 'https://ai.sumopod.com';
    const model = clientModel || process.env.AI_MODEL || 'gemini/gemini-2.0-flash';

    if (!apiKey) {
      return res.status(500).json({ error: 'API Key belum dikonfigurasi. Masukkan di menu Pengaturan.' });
    }

    const openai = new OpenAI({ apiKey, baseURL });

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

    let parsed;
    try {
      const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response:', text);
      return res.status(500).json({ error: 'Gagal memproses hasil OCR', raw: text });
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('OCR Error:', error);
    return res.status(500).json({ error: error.message || 'OCR processing failed' });
  }
}
