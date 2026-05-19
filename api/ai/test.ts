import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    return res.json({ success: true, response: text });
  } catch (error: any) {
    console.error('AI Test Error:', error);
    return res.status(500).json({ error: error.message || 'Connection test failed' });
  }
}
