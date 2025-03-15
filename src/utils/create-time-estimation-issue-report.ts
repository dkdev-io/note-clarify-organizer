
import { addTimeEstimationIssueReport } from './task-to-issue-converter';

/**
 * Creates the time estimation issue report in the database
 */
export const createTimeEstimationIssueReport = async (): Promise<void> => {
  console.log('Creating time estimation issue report...');
  try {
    const success = await addTimeEstimationIssueReport();
    if (success) {
      console.log('✅ Successfully created time estimation issue report');
    } else {
      console.error('❌ Failed to create time estimation issue report');
    }
  } catch (error) {
    console.error('Error creating time estimation issue report:', error);
  }
};
