import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z.string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z.string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
  age: z.coerce.number({ required_error: 'Age is required' })
    .int('Age must be a whole number')
    .min(10, 'TeenSpend is designed for ages 10 and above')
    .max(120, 'Please enter a valid age'),
  currency: z.string().trim().length(3, 'Currency must be a 3-letter code (e.g. USD, EUR)').optional().default('USD')
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address'),
  password: z.string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  age: z.coerce.number().int().min(10).max(120).optional(),
  currency: z.string().trim().length(3).optional(),
  monthly_income: z.coerce.number().min(0, 'Monthly income cannot be negative').optional(),
  savings_goal: z.coerce.number().min(0, 'Savings goal cannot be negative').optional()
});
