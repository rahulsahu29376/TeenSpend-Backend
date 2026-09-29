import { supabase, isLiveSupabase, memoryStore } from '../config/supabase.js';
import crypto from 'crypto';

export const ExpenseModel = {
  /**
   * Find expenses by user ID with comprehensive filtering, searching, sorting, and pagination
   */
  async findByUserId(userId, options = {}) {
    const {
      search = '',
      category = '',
      payment_method = '',
      startDate = '',
      endDate = '',
      minAmount = null,
      maxAmount = null,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = options;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    if (isLiveSupabase) {
      let query = supabase
        .from('expenses')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (category) {
        query = query.eq('category', category);
      }
      if (payment_method) {
        query = query.eq('payment_method', payment_method);
      }
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }
      if (minAmount !== null && !isNaN(minAmount)) {
        query = query.gte('amount', minAmount);
      }
      if (maxAmount !== null && !isNaN(maxAmount)) {
        query = query.lte('amount', maxAmount);
      }
      if (search) {
        query = query.or(`description.ilike.%${search}%,notes.ilike.%${search}%`);
      }

      // Sorting
      const isAsc = sortOrder.toLowerCase() === 'asc';
      if (sortBy === 'amount') {
        query = query.order('amount', { ascending: isAsc });
      } else {
        query = query.order('date', { ascending: isAsc }).order('created_at', { ascending: isAsc });
      }

      query = query.range(offset, offset + limitNum - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      };
    }

    // In-Memory Fallback
    let items = memoryStore.expenses.filter(e => e.user_id === userId);

    if (category) {
      items = items.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }
    if (payment_method) {
      items = items.filter(e => e.payment_method.toLowerCase() === payment_method.toLowerCase());
    }
    if (startDate) {
      items = items.filter(e => e.date >= startDate);
    }
    if (endDate) {
      items = items.filter(e => e.date <= endDate);
    }
    if (minAmount !== null && !isNaN(minAmount)) {
      items = items.filter(e => Number(e.amount) >= Number(minAmount));
    }
    if (maxAmount !== null && !isNaN(maxAmount)) {
      items = items.filter(e => Number(e.amount) <= Number(maxAmount));
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(e =>
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    // Sort
    const isAsc = sortOrder.toLowerCase() === 'asc';
    items.sort((a, b) => {
      if (sortBy === 'amount') {
        return isAsc ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount);
      }
      // Date sort
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) {
        return isAsc ? dateA - dateB : dateB - dateA;
      }
      return isAsc
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const total = items.length;
    const paginated = items.slice(offset, offset + limitNum);

    return {
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  },

  /**
   * Find single expense by ID and User ID (strict authorization check)
   */
  async findByIdAndUserId(id, userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }

    return memoryStore.expenses.find(e => e.id === id && e.user_id === userId) || null;
  },

  /**
   * Create expense
   */
  async create({ user_id, amount, category, description, date, payment_method = 'Debit Card', notes = '' }) {
    const newExpense = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'e-' + Date.now(),
      user_id,
      amount: parseFloat(amount),
      category: category.trim(),
      description: description.trim(),
      date: date || new Date().toISOString().split('T')[0],
      payment_method: payment_method || 'Debit Card',
      notes: (notes || '').trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    memoryStore.expenses.unshift(newExpense);
    return newExpense;
  },

  /**
   * Update expense
   */
  async update(id, userId, updates) {
    const allowed = ['amount', 'category', 'description', 'date', 'payment_method', 'notes'];
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
        .from('expenses')
        .update(safeUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const idx = memoryStore.expenses.findIndex(e => e.id === id && e.user_id === userId);
    if (idx === -1) return null;

    memoryStore.expenses[idx] = {
      ...memoryStore.expenses[idx],
      ...safeUpdates
    };
    return memoryStore.expenses[idx];
  },

  /**
   * Delete expense
   */
  async delete(id, userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return !!data;
    }

    const idx = memoryStore.expenses.findIndex(e => e.id === id && e.user_id === userId);
    if (idx === -1) return false;

    memoryStore.expenses.splice(idx, 1);
    return true;
  },

  /**
   * Get all expenses for analytics calculation (all rows for user)
   */
  async getAllByUserId(userId) {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    return memoryStore.expenses
      .filter(e => e.user_id === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};
