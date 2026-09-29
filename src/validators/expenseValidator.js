import { z } from 'zod';

export const createExpenseSchema = z.object({
  amount: z.coerce.number({ required_error: 'Amount is required' })
    .positive('Expense amount must be greater than zero')
    .max(1000000, 'Amount exceeds reasonable limits'),
  category: z.string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category is required')
    .max(50, 'Category name too long'),
  description: z.string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description is required')
    .max(255, 'Description cannot exceed 255 characters'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional(),
  payment_method: z.string().trim().max(50).optional().default('Debit Card'),
  notes: z.string().trim().max(1000).optional().default('')
});

export const updateExpenseSchema = z.object({
  amount: z.coerce.number().positive('Expense amount must be greater than zero').optional(),
  category: z.string().trim().min(1).max(50).optional(),
  description: z.string().trim().min(1).max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional(),
  payment_method: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(1000).optional()
});

export const queryExpenseSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  category: z.string().trim().optional(),
  payment_method: z.string().trim().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['date', 'amount', 'created_at']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().trim().optional()
});
