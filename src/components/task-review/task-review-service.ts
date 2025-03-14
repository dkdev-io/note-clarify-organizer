
import { Task } from '@/utils/task-parser/types';
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
  apiProps: ApiProps
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
        console.log("Looking for project ID for:", apiProps.selectedProject);
        
        const selectedWorkspace = apiProps.workspaces.find(
          workspace => workspace.id === apiProps.selectedWorkspaceId
        );
        
        if (selectedWorkspace && selectedWorkspace.projects) {
          // Find project by name
          const project = selectedWorkspace.projects.find(
            (p: any) => p.name === apiProps.selectedProject
          );
          
          if (project) {
            console.log("Found project ID:", project.id);
            return project.id;
          }
        }
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
      dueDate: task.dueDate 
    }));

    console.log("Sending tasks to Motion with the following data:", {
      projectName: projectName,
      selectedProject: apiProps.selectedProject,
      projectId: projectId,
      workspaceId: apiProps.selectedWorkspaceId,
      firstTaskProject: tasksWithProject[0]?.project,
      firstTaskProjectId: tasksWithProject[0]?.projectId,
      firstTaskDueDate: tasksWithProject[0]?.dueDate
    });
    
    const result = await addTasksToMotion(
      tasksWithProject, 
      apiProps.selectedWorkspaceId, 
      apiProps.apiKey || undefined,
      projectId
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
