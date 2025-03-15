
import { IssuePriority } from '@/types/issue';

/**
 * Maps task priority to issue priority
 */
export const mapPriority = (taskPriority: string | null): IssuePriority => {
  if (!taskPriority) return 'medium';
  
  const priority = taskPriority.toLowerCase();
  console.log(`Mapping priority: ${taskPriority} -> normalized: ${priority}`);
  
  if (priority.includes('high') || priority.includes('urgent') || priority.includes('important')) {
    return 'high';
  } else if (priority.includes('low')) {
    return 'low';
  } else if (priority.includes('critical')) {
    return 'critical';
  } else {
    return 'medium';
  }
};
