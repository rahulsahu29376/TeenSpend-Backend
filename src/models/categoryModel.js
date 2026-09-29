import { supabase, isLiveSupabase, memoryStore } from '../config/supabase.js';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '../utils/constants.js';
import crypto from 'crypto';

export const CategoryModel = {
  /**
   * Get all categories for user (combines system defaults + user custom categories)
   */
  async getAllForUser(userId) {
    const defaults = EXPENSE_CATEGORIES.map(name => ({
      id: `default-${name.toLowerCase()}`,
      name,
      icon: name,
      color: CATEGORY_COLORS[name] || '#6366F1',
      isCustom: false
    }));

    let customs = [];
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;
      customs = (data || []).map(c => ({ ...c, isCustom: true }));
    } else {
      customs = memoryStore.custom_categories
        .filter(c => c.user_id === userId)
        .map(c => ({ ...c, isCustom: true }));
    }

    return [...defaults, ...customs];
  },

  /**
   * Create custom category for user
   */
  async create({ user_id, name, icon = 'Tag', color = '#6366F1' }) {
    const trimmed = name.trim();

    // Check if name is already in defaults
    const inDefaults = EXPENSE_CATEGORIES.some(c => c.toLowerCase() === trimmed.toLowerCase());
    if (inDefaults) {
      throw new Error(`Category "${trimmed}" already exists as a default category`);
    }

    const newCategory = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'c-' + Date.now(),
      user_id,
      name: trimmed,
      icon: icon || 'Tag',
      color: color || '#6366F1',
      created_at: new Date().toISOString()
    };

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('custom_categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) throw error;
      return { ...data, isCustom: true };
    }

    // Check if already in memory customs
    const exists = memoryStore.custom_categories.some(
      c => c.user_id === user_id && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      throw new Error(`Custom category "${trimmed}" already exists`);
    }

    memoryStore.custom_categories.push(newCategory);
    return { ...newCategory, isCustom: true };
  }
};
