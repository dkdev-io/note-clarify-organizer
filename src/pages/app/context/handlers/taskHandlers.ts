import { Task } from '@/utils/task-parser/types';
import { ToastType } from '../providers';
import { Step } from '../../types';
import { ApiProps } from '../../types';
import { processNotes } from '../noteProcessing';
import { parseTextIntoTasks } from '@/utils/task-parser';

// Handle moving from note input to task extraction
export const handleParseText = async (
  text: string, 
  providedProjectName: string | null,
  setNoteText: (text: string) => void,
  setIsProcessing: (isProcessing: boolean) => void,
  apiProps: ApiProps,
  setProjectName: (name: string | null) => void,
  setExtractedTasks: (tasks: Task[]) => void,
  setStep: (step: Step) => void,
  toast: ToastType
) => {
  try {
    if (!text || text.trim() === '') {
      toast({
        title: "Empty notes",
        description: "Please enter some notes to extract tasks from.",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Parsing text with length: ${text.length} and project name: ${providedProjectName || 'none'}`);
    setNoteText(text);
    
    // Use the selected project from Motion API if available, otherwise use provided name
    const effectiveProjectName = apiProps.selectedProject || providedProjectName;
    console.log(`Effective project name: ${effectiveProjectName || 'none'}`);
    
    // Start processing
    setIsProcessing(true);
    
    const { tasks, usedFallback } = await processNotes(
      text, 
      effectiveProjectName, 
      toast,
      apiProps.users || [],
      apiProps.apiKey
    );
    
    // If we still have no tasks, show an error
    if (tasks.length === 0) {
      toast({
        title: "No tasks found",
        description: "Couldn't extract any tasks from your notes. Try adding more detailed text.",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }
    
    // Extract project name from tasks if not provided
    const extractedProjectName = tasks.find(task => task.project)?.project || effectiveProjectName || null;
    console.log(`Extracted project name: ${extractedProjectName || 'none'}`);
    setProjectName(extractedProjectName);
    
    // If connected to API, enhance tasks with workspace IDs
    if (apiProps.isConnected && apiProps.selectedWorkspaceId) {
      const tasksWithWorkspace = tasks.map(task => ({
        ...task,
        workspace_id: apiProps.selectedWorkspaceId,
        project: extractedProjectName || task.project
      }));
      console.log('Setting tasks with workspace and project:', tasksWithWorkspace);
      setExtractedTasks(tasksWithWorkspace);
    } else {
      setExtractedTasks(tasks);
    }
    
    console.log(`Moving to tasks step with ${tasks.length} tasks`);
    setStep('tasks');
  } catch (error) {
    console.error("Error parsing text:", error);
    toast({
      title: "Error processing notes",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    
    // Use fallback parsing as a last resort
    try {
      const fallbackTasks = await parseTextIntoTasks(text, providedProjectName, apiProps.apiKey);
      if (fallbackTasks.length > 0) {
        setExtractedTasks(fallbackTasks);
        setStep('tasks');
        toast({
          title: "Recovered with basic parsing",
          description: `Extracted ${fallbackTasks.length} tasks using simple parsing.`,
        });
      }
    } catch (e) {
      console.error("Even fallback parsing failed:", e);
    }
  } finally {
    setIsProcessing(false);
  }
};

// Handle adding tasks to Motion
export const handleAddToMotion = async (
  tasks: Task[], 
  updatedProjectName: string | null,
  setProjectName: (name: string | null) => void,
  setStep: (step: Step) => void,
  toast: ToastType,
  apiProps: ApiProps,
  unassignedTaskCount: number = 0
) => {
  if (updatedProjectName) {
    setProjectName(updatedProjectName);
  }
  
  console.log('Adding to Motion with project name:', updatedProjectName, tasks);
  
  // Actually add tasks to Motion if connected
  if (apiProps.isConnected && apiProps.apiKey && apiProps.selectedWorkspaceId) {
    try {
      const { addTasksToMotion } = await import('@/utils/motion/tasks');
      
      const result = await addTasksToMotion(
        tasks,
        apiProps.selectedWorkspaceId,
        apiProps.apiKey,
        apiProps.selectedProjectId,
        undefined, // timeEstimate
        apiProps.users // pass users for assignee lookup
      );
      
      if (result.success) {
        setStep('complete');
        let message = result.message;
        
        if (unassignedTaskCount > 0) {
          message += ` (${unassignedTaskCount} tasks were added without assignment)`;
        }
        
        toast({
          title: "Success!",
          description: message,
        });
      } else {
        toast({
          title: "Error adding tasks",
          description: result.message,
          variant: "destructive",
        });
        
        // Log detailed errors for debugging
        if (result.errors) {
          console.error('Motion API errors:', result.errors);
        }
      }
    } catch (error) {
      console.error('Error adding tasks to Motion:', error);
      toast({
        title: "Error",
        description: "Failed to add tasks to Motion. Please try again.",
        variant: "destructive",
      });
    }
  } else {
    // Just show completion for non-connected mode
    setStep('complete');
    let message = `${tasks.length} tasks have been reviewed${updatedProjectName ? ` under project '${updatedProjectName}'` : ''}.`;
    
    if (unassignedTaskCount > 0) {
      message += ` (${unassignedTaskCount} tasks were marked without assignment)`;
    }
    
    toast({
      title: "Tasks Reviewed",
      description: message,
    });
  }
};
