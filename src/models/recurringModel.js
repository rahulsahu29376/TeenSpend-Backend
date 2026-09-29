import { supabase, isLiveSupabase, memoryStore } from '../config/supabase.js';
import crypto from 'crypto';

export const RecurringModel = {
  /**
   * Find all recurring expenses for user
   */
  async findByUserId(userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', userId)
        .order('next_payment_date', { ascending: true });

      if (error) throw error;
      return data || [];
    }

    return memoryStore.recurring_expenses
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(a.next_payment_date) - new Date(b.next_payment_date));
  },

  /**
   * Find single recurring expense by ID & User ID
   */
  async findByIdAndUserId(id, userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }

    return memoryStore.recurring_expenses.find(r => r.id === id && r.user_id === userId) || null;
  },

  /**
   * Create recurring expense
   */
  async create({ user_id, name, amount, frequency, next_payment_date, category = 'Subscriptions' }) {
    const newRecurring = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'r-' + Date.now(),
      user_id,
      name: name.trim(),
      amount: parseFloat(amount),
      frequency: frequency.toLowerCase().trim(),
      next_payment_date,
      category: category.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .insert([newRecurring])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    memoryStore.recurring_expenses.push(newRecurring);
    return newRecurring;
  },

  /**
   * Update recurring expense
   */
  async update(id, userId, updates) {
    const allowed = ['name', 'amount', 'frequency', 'next_payment_date', 'category'];
    const safeUpdates = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        if (key === 'amount') {
          safeUpdates.amount = parseFloat(updates[key]);
        } else {
          safeUpdates[key] = updates[key];
        }
      }
    }
    safeUpdates.updated_at = new Date().toISOString();

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .update(safeUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const idx = memoryStore.recurring_expenses.findIndex(r => r.id === id && r.user_id === userId);
    if (idx === -1) return null;

    memoryStore.recurring_expenses[idx] = {
      ...memoryStore.recurring_expenses[idx],
      ...safeUpdates
    };
    return memoryStore.recurring_expenses[idx];
  },

  /**
   * Delete recurring expense
   */
  async delete(id, userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return !!data;
    }

    const idx = memoryStore.recurring_expenses.findIndex(r => r.id === id && r.user_id === userId);
    if (idx === -1) return false;

    memoryStore.recurring_expenses.splice(idx, 1);
    return true;
  }
};
