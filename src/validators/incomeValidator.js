import { z } from 'zod';

export const createIncomeSchema = z.object({
  amount: z.coerce.number({ required_error: 'Amount is required' })
    .positive('Income amount must be greater than zero')
    .max(1000000, 'Amount exceeds reasonable limits'),
  source: z.string({ required_error: 'Income source is required' })
    .trim()
    .min(1, 'Source is required')
    .max(100, 'Source name cannot exceed 100 characters'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional(),
  notes: z.string().trim().max(1000).optional().default('')
});

export const updateIncomeSchema = z.object({
  amount: z.coerce.number().positive('Income amount must be greater than zero').optional(),
  source: z.string().trim().min(1).max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional(),
  notes: z.string().trim().max(1000).optional()
});
