import { z } from 'zod';

export const createRecurringSchema = z.object({
  name: z.string({ required_error: 'Subscription/Service name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100),
  amount: z.coerce.number({ required_error: 'Amount is required' })
    .positive('Recurring amount must be greater than zero')
    .max(100000),
  frequency: z.enum(['weekly', 'monthly', 'yearly'], {
    errorMap: () => ({ message: 'Frequency must be weekly, monthly, or yearly' })
  }),
  next_payment_date: z.string({ required_error: 'Next payment date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  category: z.string().trim().max(50).optional().default('Subscriptions')
});

export const updateRecurringSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  amount: z.coerce.number().positive().optional(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  next_payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.string().trim().max(50).optional()
});

export const createCategorySchema = z.object({
  name: z.string({ required_error: 'Category name is required' })
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(50),
  icon: z.string().trim().max(50).optional().default('Tag'),
  color: z.string().trim().max(20).optional().default('#6366F1')
});
