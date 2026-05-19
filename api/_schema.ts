import { pgTable, serial, text, integer, timestamp, decimal, varchar } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),
  color: varchar('color', { length: 50 }).default('orange'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const expenses = pgTable('expenses', {
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

export const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  totalBudget: decimal('total_budget', { precision: 15, scale: 2 }).notNull(),
  projectName: varchar('project_name', { length: 255 }).notNull(),
  currentPhase: varchar('current_phase', { length: 255 }),
  estimatedCompletion: varchar('estimated_completion', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
