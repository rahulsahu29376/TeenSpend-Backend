import bcrypt from 'bcryptjs';
import { supabase, isLiveSupabase, memoryStore } from '../src/config/supabase.js';

const DEMO_USER_ID = 'u1111111-2222-3333-4444-555555555555';
const DEMO_EMAIL = 'alex@example.test';
const DEMO_PASSWORD = 'AlexPass123!';

async function seedDatabase() {
  console.log('🌱 [Seed] Starting TeenSpend development seed data loader...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const demoUser = {
    id: DEMO_USER_ID,
    name: 'Alex Rivera',
    email: DEMO_EMAIL,
    password_hash: passwordHash,
    age: 16,
    currency: 'USD',
    monthly_income: 350.00,
    savings_goal: 250.00
  };

  const demoExpenses = [
    { user_id: DEMO_USER_ID, amount: 14.50, category: 'Food', description: 'Burger & fries with classmates', date: '2026-09-27', payment_method: 'Debit Card', notes: 'Lunch after study group' },
    { user_id: DEMO_USER_ID, amount: 4.75, category: 'Snacks', description: 'Boba tea after school', date: '2026-09-26', payment_method: 'Cash', notes: 'Taro milk tea' },
    { user_id: DEMO_USER_ID, amount: 15.99, category: 'Subscriptions', description: 'Spotify Family & Discord Nitro', date: '2026-09-24', payment_method: 'Digital Wallet', notes: 'Monthly recurring share' },
    { user_id: DEMO_USER_ID, amount: 35.00, category: 'Gaming', description: 'Indie game bundle on Steam', date: '2026-09-22', payment_method: 'Debit Card', notes: 'Weekend sale' },
    { user_id: DEMO_USER_ID, amount: 6.00, category: 'Transport', description: 'Bus pass top-up for school week', date: '2026-09-21', payment_method: 'Digital Wallet', notes: 'Weekly transit' },
    { user_id: DEMO_USER_ID, amount: 22.00, category: 'School', description: 'Art supplies for science poster', date: '2026-09-18', payment_method: 'Debit Card', notes: 'Markers & posterboard' },
    { user_id: DEMO_USER_ID, amount: 18.50, category: 'Entertainment', description: 'Movie ticket with friends', date: '2026-09-14', payment_method: 'Debit Card', notes: 'Weekend matinee show' },
    { user_id: DEMO_USER_ID, amount: 8.25, category: 'Snacks', description: 'Ice cream and smoothie', date: '2026-09-10', payment_method: 'Cash', notes: 'Summer treat' },
    { user_id: DEMO_USER_ID, amount: 12.00, category: 'Food', description: 'Pizza slice combo', date: '2026-09-08', payment_method: 'Cash', notes: 'After sports club' },
    { user_id: DEMO_USER_ID, amount: 45.00, category: 'Shopping', description: 'Vintage graphic hoodie', date: '2026-09-05', payment_method: 'Debit Card', notes: 'Thrift store find' }
  ];

  const demoIncome = [
    { user_id: DEMO_USER_ID, amount: 120.00, source: 'Monthly allowance', date: '2026-09-01', notes: 'Allowance for chores & school' },
    { user_id: DEMO_USER_ID, amount: 85.00, source: 'Part-time job', date: '2026-09-15', notes: 'Weekend neighborhood dog walking' },
    { user_id: DEMO_USER_ID, amount: 50.00, source: 'Gift', date: '2026-09-20', notes: 'Birthday cash from grandparents' }
  ];

  const demoBudgets = [
    { user_id: DEMO_USER_ID, category: 'Food', amount: 80.00, month: 9, year: 2026 },
    { user_id: DEMO_USER_ID, category: 'Gaming', amount: 40.00, month: 9, year: 2026 },
    { user_id: DEMO_USER_ID, category: 'Entertainment', amount: 50.00, month: 9, year: 2026 },
    { user_id: DEMO_USER_ID, category: 'Snacks', amount: 30.00, month: 9, year: 2026 }
  ];

  const demoGoals = [
    { user_id: DEMO_USER_ID, name: 'Noise Cancelling Headphones', target_amount: 150.00, current_amount: 95.00, target_date: '2026-11-15', description: 'For studying and music on the bus' },
    { user_id: DEMO_USER_ID, name: 'Summer Skate Camp', target_amount: 220.00, current_amount: 60.00, target_date: '2026-12-30', description: 'Weekend skate coaching workshop' }
  ];

  const demoRecurring = [
    { user_id: DEMO_USER_ID, name: 'Spotify Premium Student', amount: 5.99, frequency: 'monthly', next_payment_date: '2026-10-10', category: 'Subscriptions' },
    { user_id: DEMO_USER_ID, name: 'Xbox Game Pass PC', amount: 9.99, frequency: 'monthly', next_payment_date: '2026-10-18', category: 'Gaming' }
  ];

  if (isLiveSupabase) {
    console.log('📡 [Seed] Seeding live Supabase PostgreSQL database...');
    // Upsert demo user
    const { error: userErr } = await supabase.from('users').upsert([demoUser], { onConflict: 'email' });
    if (userErr) throw userErr;

    // Clean & insert expenses
    await supabase.from('expenses').delete().eq('user_id', DEMO_USER_ID);
    const { error: expErr } = await supabase.from('expenses').insert(demoExpenses);
    if (expErr) throw expErr;

    // Clean & insert income
    await supabase.from('income').delete().eq('user_id', DEMO_USER_ID);
    const { error: incErr } = await supabase.from('income').insert(demoIncome);
    if (incErr) throw incErr;

    // Budgets
    await supabase.from('budgets').delete().eq('user_id', DEMO_USER_ID);
    const { error: budErr } = await supabase.from('budgets').insert(demoBudgets);
    if (budErr) throw budErr;

    // Goals
    await supabase.from('savings_goals').delete().eq('user_id', DEMO_USER_ID);
    const { error: goalErr } = await supabase.from('savings_goals').insert(demoGoals);
    if (goalErr) throw goalErr;

    // Recurring
    await supabase.from('recurring_expenses').delete().eq('user_id', DEMO_USER_ID);
    const { error: recErr } = await supabase.from('recurring_expenses').insert(demoRecurring);
    if (recErr) throw recErr;

    console.log('✅ [Seed] Live Supabase PostgreSQL database seeded successfully!');
  } else {
    console.log('💾 [Seed] Memory store pre-loaded with demo user:');
  }

  console.log('----------------------------------------------------');
  console.log(`Demo Account Credentials:`);
  console.log(`Email:    ${DEMO_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log(`User ID:  ${DEMO_USER_ID}`);
  console.log('----------------------------------------------------');
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ [Seed] Error during seeding:', err);
    process.exit(1);
  });
