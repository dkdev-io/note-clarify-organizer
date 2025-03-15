
import { createLLMIssueReport } from './create-llm-issue-report';
import { createProjectIssueReport } from './create-project-issue-report';
import { createTimeEstimationIssueReport } from './create-time-estimation-issue-report';

/**
 * Creates all diagnostic issue reports in the database
 */
export const createAllIssueReports = async (): Promise<void> => {
  console.log('Creating all diagnostic issue reports...');
  
  // Create LLM connection issue report (ID: 1)
  await createLLMIssueReport();
  
  // Create project assignment issue report (ID: 2)
  await createProjectIssueReport();
  
  // Create time estimation issue report (ID: 3)
  await createTimeEstimationIssueReport();
  
  console.log('✅ All diagnostic issue reports have been processed');
};
