
import { Task } from '@/utils/parser';
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

    const tasksWithProject = tasks.map(task => ({
      ...task,
      project: projectName || task.project,
      assignee: task.assignee || null
    }));

    const result = await addTasksToMotion(
      tasksWithProject, 
      apiProps.selectedWorkspaceId, 
      apiProps.apiKey || undefined
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
