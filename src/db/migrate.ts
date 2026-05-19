import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('🔄 Running migrations...');

  // Create categories table
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(50) NOT NULL,
      color VARCHAR(50) DEFAULT 'orange',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ categories table created');

  // Create expenses table
  await sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      category VARCHAR(100) NOT NULL,
      description TEXT,
      store VARCHAR(255),
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      status VARCHAR(50) DEFAULT 'success',
      receipt_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ expenses table created');

  // Create budgets table
  await sql`
    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      total_budget DECIMAL(15, 2) NOT NULL,
      project_name VARCHAR(255) NOT NULL,
      current_phase VARCHAR(255),
      estimated_completion VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ budgets table created');

  // Create settings table
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) NOT NULL UNIQUE,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ settings table created');

  console.log('🎉 Migration complete!');
}

migrate().catch(console.error);
