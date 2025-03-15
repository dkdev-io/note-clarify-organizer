
import { addLLMConnectionIssueReport } from './task-to-issue-converter';

/**
 * Creates the LLM connection issue report in the database
 */
export const createLLMIssueReport = async (): Promise<void> => {
  console.log('Creating LLM connection issue report...');
  try {
    const success = await addLLMConnectionIssueReport();
    if (success) {
      console.log('✅ Successfully created LLM connection issue report');
    } else {
      console.error('❌ Failed to create LLM connection issue report');
    }
  } catch (error) {
    console.error('Error creating LLM connection issue report:', error);
  }
};
