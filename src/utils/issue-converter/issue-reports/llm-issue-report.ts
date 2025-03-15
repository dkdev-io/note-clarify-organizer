
import { IssueFormData } from '@/types/issue';
import { issueService } from '@/services/issueService';
import { LLM_ISSUE_UUID } from './constants';

/**
 * Add a report about LLM connection issues
 */
export const addLLMConnectionIssueReport = async (): Promise<boolean> => {
  try {
    // Current date and time
    const now = new Date();
    const formattedDate = now.toISOString();
    
    // Create the issue data
    const issueData: IssueFormData = {
      title: "LLM not connecting",
      description: `
Summary of LLM Connection Issues:

The application is experiencing intermittent connectivity issues with the Language Model (LLM) service. 
When attempting to process tasks with the LLM, the connection occasionally fails, leading to fallback 
to local processing.

Issues observed:
1. Timeouts when connecting to the Supabase edge function (process-task-batch)
2. Occasional failures in processing responses from the LLM
3. Fallback mechanism engaging more frequently than expected

Attempted solutions:
- Implemented local task enhancement as a fallback mechanism
- Added detailed logging throughout the LLM processing flow
- Monitored edge function response times and error patterns

Next steps:
- Review Supabase function logs for specific error patterns
- Test with alternative timeout settings
- Implement more robust error handling in the LLM processor

This issue requires further investigation to determine if the problem is with the 
Supabase edge function configuration, the OpenAI API connection, or client-side handling.

Date reported: ${now.toLocaleString()}
      `.trim(),
      status: "open",
      priority: "high",
      created_by: "Dan"
    };
    
    console.log('Creating LLM Connection Issue report with specific UUID');
    
    // Use a proper UUID format
    const result = await issueService.createIssueWithId(LLM_ISSUE_UUID, issueData);
    
    return !!result;
  } catch (error) {
    console.error('Failed to create LLM Connection Issue report:', error);
    return false;
  }
};
