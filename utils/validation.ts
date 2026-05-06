import { z } from 'zod';

export const getTodoSchema = (t: (key: any) => string) => z.object({
  name: z.string()
    .min(1, t('taskNameRequired'))
    .max(100, t('taskNameTooLong')),
  location: z.string().max(100, t('locationTooLong')).optional(),
  notes: z.string().max(500, t('notesTooLong')).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type TodoFormData = z.infer<ReturnType<typeof getTodoSchema>>;
