import { supabase, isLiveSupabase, memoryStore } from '../config/supabase.js';
import crypto from 'crypto';

export const BudgetModel = {
  /**
   * Find budgets by user ID, optionally filtered by month and year
   */
  async findByUserIdAndPeriod(userId, month = null, year = null) {
    if (isLiveSupabase) {
      let query = supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (month) query = query.eq('month', parseInt(month, 10));
      if (year) query = query.eq('year', parseInt(year, 10));

      const { data, error } = await query.order('category', { ascending: true });
      if (error) throw error;
      return data || [];
    }

    return memoryStore.budgets.filter(b => {
      if (b.user_id !== userId) return false;
      if (month && b.month !== parseInt(month, 10)) return false;
      if (year && b.year !== parseInt(year, 10)) return false;
      return true;
    });
  },

  /**
   * Find single budget by ID and user ID
   */
  async findByIdAndUserId(id, userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }

    return memoryStore.budgets.find(b => b.id === id && b.user_id === userId) || null;
  },

  /**
   * Create or upsert budget
   */
  async createOrUpdate({ user_id, category, amount, month, year }) {
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const amt = parseFloat(amount);
    const cat = category.trim();

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          [
            {
              user_id,
              category: cat,
              amount: amt,
              month: m,
              year: y,
              updated_at: new Date().toISOString()
            }
          ],
          { onConflict: 'user_id,category,month,year' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const existingIdx = memoryStore.budgets.findIndex(
      b => b.user_id === user_id && b.category.toLowerCase() === cat.toLowerCase() && b.month === m && b.year === y
    );

    if (existingIdx !== -1) {
      memoryStore.budgets[existingIdx].amount = amt;
      memoryStore.budgets[existingIdx].updated_at = new Date().toISOString();
      return memoryStore.budgets[existingIdx];
    }

    const newBudget = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'b-' + Date.now(),
      user_id,
      category: cat,
      amount: amt,
      month: m,
      year: y,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.budgets.push(newBudget);
    return newBudget;
  },

  /**
   * Update budget by ID
   */
  async update(id, userId, updates) {
    const allowed = ['amount', 'category', 'month', 'year'];
    const safeUpdates = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        if (key === 'amount') safeUpdates.amount = parseFloat(updates[key]);
        else if (key === 'month' || key === 'year') safeUpdates[key] = parseInt(updates[key], 10);
        else safeUpdates[key] = updates[key];
      }
    }
    safeUpdates.updated_at = new Date().toISOString();

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('budgets')
        .update(safeUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const idx = memoryStore.budgets.findIndex(b => b.id === id && b.user_id === userId);
    if (idx === -1) return null;

    memoryStore.budgets[idx] = {
      ...memoryStore.budgets[idx],
      ...safeUpdates
    };
    return memoryStore.budgets[idx];
  },

  /**
   * Delete budget by ID
   */
  async delete(id, userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return !!data;
    }

    const idx = memoryStore.budgets.findIndex(b => b.id === id && b.user_id === userId);
    if (idx === -1) return false;

    memoryStore.budgets.splice(idx, 1);
    return true;
  }
};
