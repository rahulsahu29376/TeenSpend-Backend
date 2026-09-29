import { supabase, isLiveSupabase, memoryStore } from '../config/supabase.js';
import crypto from 'crypto';

export const GoalModel = {
  /**
   * Find all savings goals for user
   */
  async findByUserId(userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    return memoryStore.savings_goals
      .filter(g => g.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  /**
   * Find single goal by ID & User ID
   */
  async findByIdAndUserId(id, userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }

    return memoryStore.savings_goals.find(g => g.id === id && g.user_id === userId) || null;
  },

  /**
   * Create new savings goal
   */
  async create({ user_id, name, target_amount, current_amount = 0, target_date = null, description = '' }) {
    const newGoal = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'g-' + Date.now(),
      user_id,
      name: name.trim(),
      target_amount: parseFloat(target_amount),
      current_amount: parseFloat(current_amount || 0),
      target_date: target_date || null,
      description: (description || '').trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([newGoal])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    memoryStore.savings_goals.unshift(newGoal);
    return newGoal;
  },

  /**
   * Update savings goal
   */
  async update(id, userId, updates) {
    const allowed = ['name', 'target_amount', 'current_amount', 'target_date', 'description'];
    const safeUpdates = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        if (key === 'target_amount' || key === 'current_amount') {
          safeUpdates[key] = parseFloat(updates[key]);
        } else {
          safeUpdates[key] = updates[key];
        }
      }
    }
    safeUpdates.updated_at = new Date().toISOString();

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('savings_goals')
        .update(safeUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const idx = memoryStore.savings_goals.findIndex(g => g.id === id && g.user_id === userId);
    if (idx === -1) return null;

    memoryStore.savings_goals[idx] = {
      ...memoryStore.savings_goals[idx],
      ...safeUpdates
    };
    return memoryStore.savings_goals[idx];
  },

  /**
   * Delete savings goal
   */
  async delete(id, userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return !!data;
    }

    const idx = memoryStore.savings_goals.findIndex(g => g.id === id && g.user_id === userId);
    if (idx === -1) return false;

    memoryStore.savings_goals.splice(idx, 1);
    return true;
  }
};
