
import { Task } from '@/utils/parser';
import { ToastType } from '../providers';
import { Step } from '../../types';
import { ApiProps } from '../../types';
import { processNotes } from '../noteProcessing';
import { parseTextIntoTasks } from '@/utils/parser';

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
    setIsProcessing(true);
    
    // Use the selected project from Motion API if available, otherwise use provided name
    const effectiveProjectName = apiProps.selectedProject || providedProjectName;
    console.log(`Effective project name: ${effectiveProjectName || 'none'}`);
    
    const { tasks, usedFallback } = await processNotes(text, effectiveProjectName, toast);
    
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
      const fallbackTasks = parseTextIntoTasks(text, providedProjectName);
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
export const handleAddToMotion = (
  tasks: Task[], 
  updatedProjectName: string | null,
  setProjectName: (name: string | null) => void,
  setStep: (step: Step) => void,
  toast: ToastType
) => {
  if (updatedProjectName) {
    setProjectName(updatedProjectName);
  }
  
  setStep('complete');
  toast({
    title: "Success!",
    description: `${tasks.length} tasks have been added to Motion${updatedProjectName ? ` under project '${updatedProjectName}'` : ''}.`,
  });
};
