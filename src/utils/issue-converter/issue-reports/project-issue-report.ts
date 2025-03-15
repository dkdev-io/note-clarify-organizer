
import { IssueFormData } from '@/types/issue';
import { issueService } from '@/services/issueService';
import { PROJECT_ISSUE_UUID } from './constants';

/**
 * Add a report about project assignment issues
 */
export const addProjectAssignmentIssueReport = async (): Promise<boolean> => {
  try {
    // Current date and time
    const now = new Date();
    const formattedDate = now.toISOString();
    
    // Create the issue data
    const issueData: IssueFormData = {
      title: "Task Project Assignment Issues",
      description: `
Summary of Project Assignment Issues:

The application is experiencing problems with tasks not being assigned to the correct project. 
When users create tasks and select a specific project, the tasks sometimes end up unassigned 
or associated with a different project than intended.

Issues observed:
1. Project name is correctly extracted but not passed to the Motion API
2. Selected project in dropdown doesn't always propagate to created tasks
3. Inconsistency between project name and projectId in task objects

Root causes identified:
- The project name is extracted from text but not properly linked to a projectId
- When passing data between components, project information is sometimes lost
- The TasksReview component doesn't consistently maintain project association
- projectId and project name synchronization issues in the API service

Attempted solutions:
- Updated TasksReview component to pass the correct project name
- Modified the task converter logic to preserve project information
- Improved logging to track project assignment through the process flow
- Added project name normalization to ensure consistency

Next steps:
- Implement better state management for project selection
- Ensure project name and ID are always passed together throughout the application
- Add validation to confirm project assignment before task creation
- Update the Motion API integration to properly handle project assignments

This issue requires a comprehensive review of the project assignment flow from selection 
to final task creation to ensure consistency throughout the pipeline.

Date reported: ${now.toLocaleString()}
      `.trim(),
      status: "open",
      priority: "high",
      created_by: "Dan"
    };
    
    console.log('Creating Project Assignment Issue report with specific UUID');
    
    // Use a proper UUID format
    const result = await issueService.createIssueWithId(PROJECT_ISSUE_UUID, issueData);
    
    return !!result;
  } catch (error) {
    console.error('Failed to create Project Assignment Issue report:', error);
    return false;
  }
};
