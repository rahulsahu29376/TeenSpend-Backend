import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';
import bcrypt from 'bcryptjs';

// Determine if we have valid live Supabase credentials configured
const isValidSupabaseConfig = () => {
  return (
    ENV.SUPABASE_URL &&
    ENV.SUPABASE_URL.startsWith('http') &&
    !ENV.SUPABASE_URL.includes('your-project') &&
    ENV.SUPABASE_SERVICE_ROLE_KEY &&
    ENV.SUPABASE_SERVICE_ROLE_KEY.length > 20 &&
    !ENV.SUPABASE_SERVICE_ROLE_KEY.includes('your-supabase')
  );
};

export const isLiveSupabase = isValidSupabaseConfig();

let supabaseInstance = null;

if (isLiveSupabase) {
  try {
    supabaseInstance = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ [Supabase] Connected to live Supabase PostgreSQL database.');
  } catch (err) {
    console.warn('⚠️ [Supabase] Failed to initialize live client, falling back to local store:', err.message);
  }
} else {
  console.log('ℹ️ [Supabase] Live credentials not set in .env. Initializing local in-memory DB with realistic seed data.');
}

export const supabase = supabaseInstance;

// ============================================================================
// Local In-Memory Storage Adapter
// Provides seamless offline/local development with identical schema & operations
// ============================================================================
const DEMO_USER_ID = 'u1111111-2222-3333-4444-555555555555';
const DEMO_PASSWORD_HASH = bcrypt.hashSync('AlexPass123!', 10);

export const memoryStore = {
  users: [
    {
      id: DEMO_USER_ID,
      name: 'Alex Rivera',
      email: 'alex@example.test',
      password_hash: DEMO_PASSWORD_HASH,
      age: 16,
      currency: 'USD',
      monthly_income: 350.00,
      savings_goal: 250.00,
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  expenses: [
    {
      id: 'e1001',
      user_id: DEMO_USER_ID,
      amount: 14.50,
      category: 'Food',
      description: 'Burger & fries with classmates',
      date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      payment_method: 'Debit Card',
      notes: 'Lunch after study session',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'e1002',
      user_id: DEMO_USER_ID,
      amount: 4.75,
      category: 'Snacks',
      description: 'Boba tea after school',
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      payment_method: 'Cash',
      notes: 'Taro milk tea',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'e1003',
      user_id: DEMO_USER_ID,
      amount: 15.99,
      category: 'Subscriptions',
      description: 'Spotify Family & Discord Nitro',
      date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      payment_method: 'Digital Wallet',
      notes: 'Monthly recurring share',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'e1004',
      user_id: DEMO_USER_ID,
      amount: 35.00,
      category: 'Gaming',
      description: 'Indie game bundle on Steam',
      date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
      payment_method: 'Debit Card',
      notes: 'Weekend sale',
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 86400000).toISOString()
    },
    {
      id: 'e1005',
      user_id: DEMO_USER_ID,
      amount: 6.00,
      category: 'Transport',
      description: 'Bus pass top-up for school week',
      date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      payment_method: 'Digital Wallet',
      notes: 'Weekly transit card',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: 'e1006',
      user_id: DEMO_USER_ID,
      amount: 22.00,
      category: 'School',
      description: 'Art supplies for science poster',
      date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      payment_method: 'Debit Card',
      notes: 'Markers & posterboard',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'e1007',
      user_id: DEMO_USER_ID,
      amount: 18.50,
      category: 'Entertainment',
      description: 'Movie ticket with friends',
      date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
      payment_method: 'Debit Card',
      notes: 'Weekend matinee show',
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
      id: 'e1008',
      user_id: DEMO_USER_ID,
      amount: 8.25,
      category: 'Snacks',
      description: 'Ice cream and smoothie',
      date: new Date(Date.now() - 18 * 86400000).toISOString().split('T')[0],
      payment_method: 'Cash',
      notes: 'Summer treat',
      created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 18 * 86400000).toISOString()
    }
  ],
  income: [
    {
      id: 'i1001',
      user_id: DEMO_USER_ID,
      amount: 120.00,
      source: 'Monthly allowance',
      date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
      notes: 'Standard monthly allowance from parents',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: 'i1002',
      user_id: DEMO_USER_ID,
      amount: 80.00,
      source: 'Part-time job',
      date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
      notes: 'Weekend neighborhood dog walking',
      created_at: new Date(Date.now() - 12 * 86400000).toISOString()
    },
    {
      id: 'i1003',
      user_id: DEMO_USER_ID,
      amount: 50.00,
      source: 'Gift',
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      notes: 'Birthday gift from aunt',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ],
  budgets: [
    {
      id: 'b1001',
      user_id: DEMO_USER_ID,
      category: 'Food',
      amount: 80.00,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'b1002',
      user_id: DEMO_USER_ID,
      category: 'Gaming',
      amount: 40.00,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'b1003',
      user_id: DEMO_USER_ID,
      category: 'Entertainment',
      amount: 50.00,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'b1004',
      user_id: DEMO_USER_ID,
      category: 'Snacks',
      amount: 30.00,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  savings_goals: [
    {
      id: 'g1001',
      user_id: DEMO_USER_ID,
      name: 'Noise Cancelling Headphones',
      target_amount: 150.00,
      current_amount: 95.00,
      target_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      description: 'For studying and music on the bus',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'g1002',
      user_id: DEMO_USER_ID,
      name: 'Summer Skate Camp',
      target_amount: 220.00,
      current_amount: 60.00,
      target_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      description: 'Weekend skate coaching workshop',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  recurring_expenses: [
    {
      id: 'r1001',
      user_id: DEMO_USER_ID,
      name: 'Spotify Premium Student',
      amount: 5.99,
      frequency: 'monthly',
      next_payment_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      category: 'Subscriptions',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'r1002',
      user_id: DEMO_USER_ID,
      name: 'Xbox Game Pass PC',
      amount: 9.99,
      frequency: 'monthly',
      next_payment_date: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
      category: 'Gaming',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  custom_categories: [
    {
      id: 'c1001',
      user_id: DEMO_USER_ID,
      name: 'Skateboarding',
      icon: 'Activity',
      color: '#06B6D4',
      created_at: new Date().toISOString()
    }
  ]
};
