-- Ethernodes Clone - Supabase Schema
-- Run this in your Supabase SQL editor

-- Users table (admin access)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin user (password: Admin1234!)
-- Change this before deploying!
INSERT INTO admin_users (email, password_hash) 
VALUES ('admin@ethernodes.io', '$2b$10$rQnM8Q9Y3kZ1vX2pN5mL8eJqHdF4wG7sT0uI6oP3cA9bE1nR5yV2O')
ON CONFLICT DO NOTHING;

-- Validators table for dynamic data
CREATE TABLE IF NOT EXISTS validators (
  id SERIAL PRIMARY KEY,
  public_key TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  protocol TEXT DEFAULT 'Vanilla',
  rewards_24h NUMERIC DEFAULT 0.0020,
  rewards_total NUMERIC DEFAULT 0,
  apr NUMERIC DEFAULT 3.49,
  activation_date DATE NOT NULL,
  deactivation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protocol metrics override table
CREATE TABLE IF NOT EXISTS protocol_metrics (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert configurable metrics
INSERT INTO protocol_metrics (key, value) VALUES
  ('apr_current', '3.49'),
  ('apr_7d', '3.08'),
  ('apr_30d', '2.60'),
  ('total_deposits_eth', '169.00'),
  ('total_funds_eth', '66744.72'),
  ('rewards_distributed_eth', '3458.64'),
  ('active_validators', '2056'),
  ('liquidity_withdrawal', '7918.09'),
  ('protocol_reserves', '8843.34'),
  ('eth_eur_rate', '1789.50')
ON CONFLICT (key) DO NOTHING;
