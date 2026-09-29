import { supabase, isLiveSupabase, memoryStore } from '../config/supabase.js';
import crypto from 'crypto';

export const IncomeModel = {
  /**
   * Find income records by user ID
   */
  async findByUserId(userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    return memoryStore.income
      .filter(i => i.user_id === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /**
   * Find single income record by ID & user ID
   */
  async findByIdAndUserId(id, userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }

    return memoryStore.income.find(i => i.id === id && i.user_id === userId) || null;
  },

  /**
   * Create income record
   */
  async create({ user_id, amount, source, date, notes = '' }) {
    const newIncome = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'i-' + Date.now(),
      user_id,
      amount: parseFloat(amount),
      source: source.trim(),
      date: date || new Date().toISOString().split('T')[0],
      notes: (notes || '').trim(),
      created_at: new Date().toISOString()
    };

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('income')
        .insert([newIncome])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    memoryStore.income.unshift(newIncome);
    return newIncome;
  },

  /**
   * Update income record
   */
  async update(id, userId, updates) {
    const allowed = ['amount', 'source', 'date', 'notes'];
    const safeUpdates = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = key === 'amount' ? parseFloat(updates[key]) : updates[key];
      }
    }

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('income')
        .update(safeUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const idx = memoryStore.income.findIndex(i => i.id === id && i.user_id === userId);
    if (idx === -1) return null;

    memoryStore.income[idx] = {
      ...memoryStore.income[idx],
      ...safeUpdates
    };
    return memoryStore.income[idx];
  },

  /**
   * Delete income record
   */
  async delete(id, userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('income')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return !!data;
    }

    const idx = memoryStore.income.findIndex(i => i.id === id && i.user_id === userId);
    if (idx === -1) return false;

    memoryStore.income.splice(idx, 1);
    return true;
  }
};
