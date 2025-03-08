
import { z } from 'zod';

/**
 * Zod schema for validating task data
 */
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional().default(""),
  dueDate: z.string().nullable(),
  priority: z.enum(['low', 'medium', 'high']).nullable(),
  status: z.enum(['todo', 'in-progress', 'done']),
  assignee: z.string().nullable(),
  workspace_id: z.string().nullable(),
  isRecurring: z.boolean(),
  frequency: z.string().nullable().refine(
    (val) => !z.boolean().parse(true) || val !== null, 
    { message: "Frequency is required for recurring tasks" }
  ),
  project: z.string().nullable()
});

/**
 * Type definition derived from the TaskSchema
 */
export type TaskSchemaType = z.infer<typeof TaskSchema>;

/**
 * Validate a single task against the TaskSchema
 * @param task Task object to validate
 * @returns Validation result with success flag and either data or error
 */
export const validateTaskSchema = (task: unknown) => {
  try {
    const validatedTask = TaskSchema.parse(task);
    return { success: true, data: validatedTask, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        data: null, 
        error: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      };
    }
    return { success: false, data: null, error: [{ path: '', message: 'Unknown validation error' }] };
  }
};

/**
 * Validate an array of tasks against the TaskSchema
 * @param tasks Array of task objects to validate
 * @returns Validation result with success flag and either data or errors by task
 */
export const validateTasksSchema = (tasks: unknown[]) => {
  const results = tasks.map((task, index) => {
    const validation = validateTaskSchema(task);
    return {
      index,
      ...validation
    };
  });

  const hasErrors = results.some(result => !result.success);
  
  return {
    success: !hasErrors,
    results,
    validTasks: results.filter(r => r.success).map(r => r.data),
    invalidTasks: results.filter(r => !r.success).map(r => ({
      index: r.index,
      errors: r.error
    }))
  };
};
