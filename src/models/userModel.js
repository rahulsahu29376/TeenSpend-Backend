import { supabase, isLiveSupabase, memoryStore } from '../config/supabase.js';
import crypto from 'crypto';

export const UserModel = {
  /**
   * Find user by email (case-insensitive)
   */
  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (error) throw error;
      return data;
    }

    return memoryStore.users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
  },

  /**
   * Find user by ID (excludes password_hash by default)
   */
  async findById(id, includePassword = false) {
    if (isLiveSupabase) {
      const query = supabase.from('users').select('*').eq('id', id).maybeSingle();
      const { data, error } = await query;
      if (error) throw error;
      if (!data) return null;

      if (!includePassword) {
        delete data.password_hash;
      }
      return data;
    }

    const user = memoryStore.users.find(u => u.id === id);
    if (!user) return null;

    const copy = { ...user };
    if (!includePassword) {
      delete copy.password_hash;
    }
    return copy;
  },

  /**
   * Create new user
   */
  async create({ name, email, password_hash, age, currency = 'USD' }) {
    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'u-' + Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      age: parseInt(age, 10),
      currency: currency.toUpperCase(),
      monthly_income: 0.00,
      savings_goal: 0.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (error) throw error;
      const created = { ...data };
      delete created.password_hash;
      return created;
    }

    memoryStore.users.push(newUser);
    const created = { ...newUser };
    delete created.password_hash;
    return created;
  },

  /**
   * Update user profile
   */
  async update(id, updates) {
    const allowed = ['name', 'age', 'currency', 'monthly_income', 'savings_goal'];
    const safeUpdates = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = updates[key];
      }
    }
    safeUpdates.updated_at = new Date().toISOString();

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('users')
        .update(safeUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const updated = { ...data };
      delete updated.password_hash;
      return updated;
    }

    const idx = memoryStore.users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    memoryStore.users[idx] = {
      ...memoryStore.users[idx],
      ...safeUpdates
    };

    const updated = { ...memoryStore.users[idx] };
    delete updated.password_hash;
    return updated;
  }
};
