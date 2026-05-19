import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

dotenv.config();

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed categories
  const categories = await db.insert(schema.categories).values([
    { name: 'Material', icon: 'Ruler', color: 'orange' },
    { name: 'Tukang', icon: 'HardHat', color: 'blue' },
    { name: 'Alat', icon: 'Wrench', color: 'gray' },
    { name: 'Lainnya', icon: 'Package', color: 'purple' },
  ]).returning();

  console.log(`✅ Inserted ${categories.length} categories`);

  // Seed budget
  const budget = await db.insert(schema.budgets).values({
    totalBudget: '75000000',
    projectName: 'Renovasi Rumah',
    currentPhase: 'Finishing Lantai 1',
    estimatedCompletion: '15 Nov 2024',
  }).returning();

  console.log(`✅ Inserted budget: ${budget[0].projectName}`);

  // Seed expenses
  const expenses = await db.insert(schema.expenses).values([
    {
      title: 'Cat Dinding Jotun',
      amount: '1250000',
      category: 'Material',
      categoryId: categories[0].id,
      store: 'Toko Cat Makmur',
      date: new Date('2024-05-24T14:20:00'),
      status: 'success',
    },
    {
      title: 'Upah Tukang Mingguan',
      amount: '3500000',
      category: 'Tukang',
      categoryId: categories[1].id,
      store: 'Pak Budi',
      date: new Date('2024-05-22T10:00:00'),
      status: 'success',
    },
    {
      title: 'Sewa Drill Beton',
      amount: '450000',
      category: 'Alat',
      categoryId: categories[2].id,
      store: 'Rental Alat Jaya',
      date: new Date('2024-05-20T09:00:00'),
      status: 'success',
    },
    {
      title: 'Keramik Lantai 60x60',
      amount: '5200000',
      category: 'Material',
      categoryId: categories[0].id,
      store: 'Depo Bangunan Jaya',
      date: new Date('2024-05-23T16:45:00'),
      status: 'success',
    },
    {
      title: 'Pipa PVC & Fitting',
      amount: '780000',
      category: 'Material',
      categoryId: categories[0].id,
      store: 'TB Sumber Rejeki',
      date: new Date('2024-05-21T11:30:00'),
      status: 'success',
    },
    {
      title: 'Upah Tukang Kayu',
      amount: '2500000',
      category: 'Tukang',
      categoryId: categories[1].id,
      store: 'Pak Agus',
      date: new Date('2024-05-19T08:00:00'),
      status: 'success',
    },
    {
      title: 'Semen Tiga Roda 50kg x10',
      amount: '650000',
      category: 'Material',
      categoryId: categories[0].id,
      store: 'Toko Material Sentosa',
      date: new Date('2024-05-18T13:00:00'),
      status: 'success',
    },
  ]).returning();

  console.log(`✅ Inserted ${expenses.length} expenses`);
  console.log('🎉 Seeding complete!');
}

seed().catch(console.error);
