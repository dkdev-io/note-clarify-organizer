
/**
 * Re-exports from the task-parser modules for backward compatibility
 * @deprecated Use the individual modules from src/utils/task-parser/ instead
 */

// Re-export the type using 'export type' syntax to fix TS1205 error
export type { Task } from './task-parser/types';

// Re-export the functions
export {
  parseTextIntoTasks,
  validateTask,
  validateTasks,
  refineTask,
  extractDate,
  extractPriority,
  extractAssignee,
  extractStatus,
  isRecurringTask,
  extractProjectName,
  cleanupTaskTitle,
  splitIntoSubtasks
} from './task-parser';
