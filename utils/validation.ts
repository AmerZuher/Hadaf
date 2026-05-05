import { z } from 'zod';

export const todoSchema = z.object({
  name: z.string()
    .min(1, 'Task name is required')
    .max(100, 'Task name must be less than 100 characters'),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type TodoFormData = z.infer<typeof todoSchema>;
