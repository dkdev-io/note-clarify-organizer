
import { IssueStatus } from '@/types/issue';

/**
 * Maps task status to issue status
 */
export const mapStatus = (taskStatus: string | null): IssueStatus => {
  if (!taskStatus) return 'open';
  
  const status = taskStatus.toLowerCase();
  console.log(`Mapping status: ${taskStatus} -> normalized: ${status}`);
  
  if (status.includes('progress') || status.includes('working') || status.includes('started')) {
    return 'in-progress';
  } else if (status.includes('complete') || status.includes('done') || status.includes('resolved') || status.includes('finished')) {
    return 'resolved';
  } else if (status.includes('close') || status.includes('cancel') || status.includes('abandon')) {
    return 'closed';
  } else {
    return 'open';
  }
};
