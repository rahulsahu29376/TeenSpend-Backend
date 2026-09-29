-- ============================================================================
-- TeenSpend Database Schema (Supabase PostgreSQL)
-- Production-Ready Schema with Foreign Keys, Constraints, Indexes, and RLS
-- ============================================================================

-- Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores teen user accounts, basic profile, currency, and baseline targets
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INT NOT NULL CHECK (age >= 10 AND age <= 120),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    monthly_income NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (monthly_income >= 0),
    savings_goal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (savings_goal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ----------------------------------------------------------------------------
-- 2. EXPENSES TABLE
-- Stores every expenditure with category, payment method, date, and notes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Debit Card',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast querying, filtering, and sorting
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(user_id, category);
CREATE INDEX IF NOT EXISTS idx_expenses_payment ON expenses(user_id, payment_method);

-- ----------------------------------------------------------------------------
-- 3. INCOME TABLE
-- Tracks allowances, part-time jobs, gifts, cash rewards
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    source VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, date DESC);

-- ----------------------------------------------------------------------------
-- 4. BUDGETS TABLE
-- Monthly planned spending per category or overall
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_category_month_year UNIQUE (user_id, category, month, year)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, year, month);

-- ----------------------------------------------------------------------------
-- 5. SAVINGS GOALS TABLE
-- Concrete teen goals (e.g. Headphones, New Sneaker, Gaming console)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    target_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON savings_goals(user_id);

-- ----------------------------------------------------------------------------
-- 6. RECURRING EXPENSES TABLE
-- Subscriptions & recurring teen commitments (Spotify, Game pass, Netflix)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
    next_payment_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Subscriptions',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_expenses(user_id);

-- ----------------------------------------------------------------------------
-- 7. CUSTOM CATEGORIES TABLE
-- Allows teens to expand default categories with their own tags
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Tag',
    color VARCHAR(20) DEFAULT '#6366F1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_custom_category UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_custom_categories_user ON custom_categories(user_id);

-- ----------------------------------------------------------------------------
-- UPDATED_AT AUTOMATIC TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
        CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_expenses_updated_at') THEN
        CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_income_updated_at') THEN
        CREATE TRIGGER trg_income_updated_at BEFORE UPDATE ON income FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_budgets_updated_at') THEN
        CREATE TRIGGER trg_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_savings_goals_updated_at') THEN
        CREATE TRIGGER trg_savings_goals_updated_at BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_recurring_expenses_updated_at') THEN
        CREATE TRIGGER trg_recurring_expenses_updated_at BEFORE UPDATE ON recurring_expenses FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- When Supabase client runs with user context or direct DB role
-- ----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;

-- Note: The backend application connects using the service role key or backend role.
-- For direct user RLS in Supabase:
CREATE POLICY "Users can manage own profile" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own income" ON income FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own savings goals" ON savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recurring expenses" ON recurring_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own custom categories" ON custom_categories FOR ALL USING (auth.uid() = user_id);
