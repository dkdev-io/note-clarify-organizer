
import { addProjectAssignmentIssueReport } from './task-to-issue-converter';

/**
 * Creates the project assignment issue report in the database
 */
export const createProjectIssueReport = async (): Promise<void> => {
  console.log('Creating project assignment issue report...');
  try {
    const success = await addProjectAssignmentIssueReport();
    if (success) {
      console.log('✅ Successfully created project assignment issue report');
    } else {
      console.error('❌ Failed to create project assignment issue report');
    }
  } catch (error) {
    console.error('Error creating project assignment issue report:', error);
  }
};
