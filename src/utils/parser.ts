
/**
 * Re-exports from the task-parser modules for backward compatibility
 * @deprecated Use the individual modules from src/utils/task-parser/ instead
 */

export {
  Task,
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
