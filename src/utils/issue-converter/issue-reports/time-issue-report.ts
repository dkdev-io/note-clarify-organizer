
import { IssueFormData } from '@/types/issue';
import { issueService } from '@/services/issueService';
import { TIME_ISSUE_UUID } from './constants';

/**
 * Add a report about time estimation issues
 */
export const addTimeEstimationIssueReport = async (): Promise<boolean> => {
  try {
    // Current date and time
    const now = new Date();
    const formattedDate = now.toISOString();
    
    // Create the issue data
    const issueData: IssueFormData = {
      title: "Time Estimation Parsing & Duration Field Issues",
      description: `
Summary of Time Estimation Issues:

The application is experiencing issues with time estimates not being correctly parsed from
task descriptions and not being properly added to the duration field in Motion API requests.

Issues observed:
1. Time estimates mentioned in natural language (e.g., "this will take 2 hours") are not consistently extracted
2. Extracted time values are not being properly converted to minute values required by Motion
3. The duration field is sometimes populated but not properly passed to the Motion API
4. Time estimates from the completion screen are not consistently applied to all tasks

Root causes identified:
- The duration-extractor.ts regex patterns don't capture all common time expressions
- Extracted duration strings aren't converted to numeric minute values for the timeEstimate field
- The Motion API integration is using timeEstimate but may not be properly formatting it
- Inconsistency between "duration" (text description) and "timeEstimate" (minutes) fields

Attempted solutions:
- Added basic regex patterns for duration extraction from text
- Implemented timeEstimate field in the task object
- Added UI field in CompletionScreen for time estimates
- Modified task-review-service.ts to include time estimates in API calls
- Added time estimate parameter passing in the Motion tasks API wrapper

Next steps:
- Enhance duration extractor with more comprehensive patterns
- Add a numeric parser for duration strings to convert to minutes
- Ensure consistent field usage between duration (text) and timeEstimate (minutes)
- Add validation to confirm time estimates are properly formatted before API calls
- Add explicit logging of time estimate values at each processing stage
- Fix the Motion API integration to ensure timeEstimate is properly included in requests

This issue requires improvements to both the parsing logic and the API integration to ensure
time estimates are consistently captured and applied to tasks.

Date reported: ${now.toLocaleString()}
      `.trim(),
      status: "open",
      priority: "high",
      created_by: "Dan"
    };
    
    console.log('Creating Time Estimation Issue report with specific UUID');
    
    // Use a proper UUID format
    const result = await issueService.createIssueWithId(TIME_ISSUE_UUID, issueData);
    
    return !!result;
  } catch (error) {
    console.error('Failed to create Time Estimation Issue report:', error);
    return false;
  }
};
