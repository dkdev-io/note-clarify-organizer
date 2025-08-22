
import { Task } from '@/utils/task-parser/types'; // Ensure we're importing from the correct path
import { addTasksToMotion } from '@/utils/motion';
import { ApiProps } from '@/pages/converter/types';

export interface AddToMotionResult {
  success: boolean;
  message: string;
  errors?: any[];
}

export const addTasksToMotionService = async (
  tasks: Task[], 
  projectName: string | null,
  apiProps: ApiProps,
  timeEstimate?: string
): Promise<AddToMotionResult> => {
  try {
    if (!apiProps.isConnected || !apiProps.selectedWorkspaceId) {
      // Demo mode or missing configuration
      return {
        success: true,
        message: `${tasks.length} tasks would be added to Motion${projectName ? ` in project "${projectName}"` : ''}.`,
      };
    }

    // Find project ID that corresponds to the selected project name
    const findProjectId = (): string | undefined => {
      if (apiProps.workspaces && apiProps.selectedWorkspaceId) {
        console.log("Looking for project ID for:", projectName || apiProps.selectedProject);
        
        const selectedWorkspace = apiProps.workspaces.find(
          workspace => workspace.id === apiProps.selectedWorkspaceId
        );
        
        if (selectedWorkspace && selectedWorkspace.projects) {
          // Find project by name (either from provided projectName or from apiProps.selectedProject)
          const effectiveProjectName = projectName || apiProps.selectedProject;
          const project = selectedWorkspace.projects.find(
            (p: any) => p.name === effectiveProjectName
          );
          
          if (project) {
            console.log("Found project ID:", project.id);
            return project.id;
          }
        }
      }
      
      // If we couldn't find a project ID, try using the selectedProjectId directly
      if (apiProps.selectedProjectId) {
        console.log("Using selectedProjectId directly:", apiProps.selectedProjectId);
        return apiProps.selectedProjectId;
      }
      
      return undefined;
    };

    // Get the project ID
    const projectId = findProjectId();
    console.log("Using project ID for Motion API:", projectId);
    
    const tasksWithProject = tasks.map(task => ({
      ...task,
      project: projectName || apiProps.selectedProject || task.project,
      projectId: projectId, // Add the project ID explicitly
      assignee: task.assignee || null,
      workspace_id: apiProps.selectedWorkspaceId,
      // Ensure due date is properly formatted for the API
      dueDate: task.dueDate,
      // Add the time estimate if provided
      timeEstimate: timeEstimate ? parseInt(timeEstimate, 10) : (task.timeEstimate || null)
    }));

    console.log("Sending tasks to Motion with the following data:", {
      projectName: projectName,
      selectedProject: apiProps.selectedProject,
      projectId: projectId,
      workspaceId: apiProps.selectedWorkspaceId,
      firstTaskProject: tasksWithProject[0]?.project,
      firstTaskProjectId: tasksWithProject[0]?.projectId,
      firstTaskDueDate: tasksWithProject[0]?.dueDate,
      timeEstimate: timeEstimate
    });
    
    // Ensure we have a workspace ID - fetch if needed
    let workspaceId = apiProps.selectedWorkspaceId;
    if (!workspaceId && apiProps.apiKey) {
      console.log('No workspace selected in service, fetching workspaces...');
      const { fetchWorkspaces } = await import('@/utils/motion/workspaces');
      const workspaces = await fetchWorkspaces(apiProps.apiKey);
      if (workspaces.length > 0) {
        workspaceId = workspaces[0].id;
        console.log('Using first workspace in service:', workspaces[0].name, workspaceId);
      } else {
        throw new Error('No workspaces found in Motion account');
      }
    }
    
    const result = await addTasksToMotion(
      tasksWithProject, 
      workspaceId, 
      apiProps.apiKey || undefined,
      projectId,
      timeEstimate,
      apiProps.users // pass users for assignee lookup
    );
    
    return result;
  } catch (error) {
    console.error("Error adding tasks to Motion:", error);
    return {
      success: false,
      message: "Failed to add tasks to Motion. Please try again.",
      errors: [{ message: String(error) }]
    };
  }
};
