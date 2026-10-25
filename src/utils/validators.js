import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone is too long')
    .regex(/^[+]?[\d\s-]+$/, 'Invalid phone number'),
  college: z.string().min(2, 'College name is required').max(200),
  year: z.string().min(1, 'Year of study is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const createTeamSchema = z.object({
  teamName: z.string().min(3, 'Team name must be at least 3 characters').max(50, 'Team name is too long'),
  track: z.string().optional(),
  idea: z.string().max(500, 'Description is too long').optional(),
});

export const joinTeamSchema = z.object({
  code: z.string().length(6, 'Team code must be 6 characters').toUpperCase(),
});

export const submissionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(1000, 'Description is too long').optional(),
  githubUrl: z.string().url('Invalid URL').or(z.string().length(0)).optional(),
  demoUrl: z.string().url('Invalid URL').or(z.string().length(0)).optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  body: z.string().min(3, 'Body is required').max(5000),
  priority: z.enum(['normal', 'important', 'urgent']),
  pinned: z.boolean().optional(),
});

export const helpRequestSchema = z.object({
  subject: z.string().min(3, 'Subject is required').max(200),
  category: z.enum(['technical', 'llm-api', 'idea', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});
