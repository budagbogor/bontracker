const API_BASE = '/api';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string | null;
  createdAt: string | null;
}

export interface Expense {
  id: number;
  title: string;
  amount: string;
  categoryId: number | null;
  category: string;
  description: string | null;
  store: string | null;
  date: string;
  status: string | null;
  receiptUrl: string | null;
  createdAt: string | null;
}

export interface Budget {
  id: number;
  totalBudget: string;
  projectName: string;
  currentPhase: string | null;
  estimatedCompletion: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DashboardSummary {
  totalSpent: string;
  byCategory: { category: string; total: string; count: number }[];
  budget: Budget | null;
  recentExpenses: Expense[];
}

// ============ CATEGORIES ============

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function createCategory(data: { name: string; icon: string; color?: string }): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

// ============ EXPENSES ============

export async function getExpenses(): Promise<Expense[]> {
  const res = await fetch(`${API_BASE}/expenses`);
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

export async function createExpense(data: {
  title: string;
  amount: string;
  category: string;
  categoryId?: number;
  description?: string;
  store?: string;
  date?: string;
}): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function deleteExpense(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete expense');
}

// ============ BUDGET ============

export async function getBudget(): Promise<Budget | null> {
  const res = await fetch(`${API_BASE}/budget`);
  if (!res.ok) throw new Error('Failed to fetch budget');
  return res.json();
}

export async function saveBudget(data: {
  totalBudget: string;
  projectName: string;
  currentPhase?: string;
  estimatedCompletion?: string;
}): Promise<Budget> {
  const res = await fetch(`${API_BASE}/budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save budget');
  return res.json();
}

// ============ DASHBOARD ============

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

// ============ OCR ============

export interface OcrResult {
  store: string | null;
  date: string | null;
  items: { name: string; qty: number; price: number }[];
  total: number | null;
  category: string | null;
}

export async function scanReceipt(imageBase64: string): Promise<OcrResult> {
  // Get AI config from localStorage
  const apiKey = localStorage.getItem('ai_api_key') || '';
  const model = localStorage.getItem('ai_model') || 'gemini/gemini-2.0-flash';

  const res = await fetch(`${API_BASE}/ocr/receipt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64, apiKey, model }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'OCR failed');
  }
  return res.json();
}

// ============ AI TEST ============

export async function testAiConnection(apiKey: string, model: string, provider: string): Promise<{ success: boolean; response?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/ai/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, model, provider }),
  });
  return res.json();
}
