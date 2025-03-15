
/**
 * Exports all metadata extraction utilities from a single entry point
 */

// Re-export all extractors for backward compatibility
export { extractPriority } from './priority-extractor';
export { extractAssignee } from './assignee-extractor';
export { extractStatus } from './status-extractor';
export { isRecurringTask } from './recurring-extractor';
export { extractProjectName } from './project-extractor';
