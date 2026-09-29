import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string({ required_error: 'Goal name is required' })
    .trim()
    .min(2, 'Goal name must be at least 2 characters')
    .max(100),
  target_amount: z.coerce.number({ required_error: 'Target amount is required' })
    .positive('Target amount must be greater than zero')
    .max(1000000),
  current_amount: z.coerce.number().min(0, 'Current amount cannot be negative').optional().default(0),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be YYYY-MM-DD').optional().nullable(),
  description: z.string().trim().max(500).optional().default('')
});

export const updateGoalSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  target_amount: z.coerce.number().positive('Target amount must be positive').optional(),
  current_amount: z.coerce.number().min(0, 'Current amount cannot be negative').optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  description: z.string().trim().max(500).optional()
});
