import { z } from 'zod';

export const createBudgetSchema = z.object({
  category: z.string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category is required')
    .max(50),
  amount: z.coerce.number({ required_error: 'Budget amount is required' })
    .positive('Budget amount must be greater than zero')
    .max(1000000),
  month: z.coerce.number({ required_error: 'Month is required' })
    .int()
    .min(1, 'Month must be between 1 and 12')
    .max(12, 'Month must be between 1 and 12'),
  year: z.coerce.number({ required_error: 'Year is required' })
    .int()
    .min(2020, 'Year must be 2020 or later')
    .max(2050)
});

export const updateBudgetSchema = z.object({
  category: z.string().trim().min(1).max(50).optional(),
  amount: z.coerce.number().positive('Budget amount must be greater than zero').optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2050).optional()
});
