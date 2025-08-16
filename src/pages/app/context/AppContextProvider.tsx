
import React, { createContext, useState, useContext } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Task } from '@/utils/parser';

interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[];
  users: any[];
  selectedWorkspaceId: string | null;
  selectedProject: string | null;
  selectedProjectId: string | null;
}

interface AppContextProps {
  step: string;
  setStep: (step: string) => void;
  noteText: string;
  setNoteText: (noteText: string) => void;
  extractedTasks: Task[];
  setExtractedTasks: (tasks: Task[]) => void;
  projectName: string | null;
  setProjectName: (projectName: string | null) => void;
  apiProps: ApiProps;
  updateApiProps: (newProps: Partial<ApiProps>) => void;
  handleApiConnect: (apiKey: string, workspaces: any[], workspaceId?: string, project?: string) => void;
  handleSkipConnect: () => void;
  handleStartOver: () => void;
  handleReconnect: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  handleParseText: (
    text: string, 
    providedProjectName: string | null
  ) => void;
  handleAddToMotion: (tasks: Task[], projectName: string | null, unassignedCount?: number) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

async function processNotesText(text: string, projectName: string | null, motionUsers: any[] | undefined) {
  const res = await fetch('/api/process-notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, projectName, motionUsers }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error('Error from /api/process-notes:', errorData);
    throw new Error(errorData.error || 'Failed to process notes');
  }

  return await res.json();
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Initialize with 'connect' step to ensure proper workflow
  const [step, setStep] = useState<string>('connect');
  const [noteText, setNoteText] = useState<string>('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Motion API connection state
  const [apiProps, setApiProps] = useState<ApiProps>({
    isConnected: false,
    apiKey: null,
    workspaces: [],
    users: [],
    selectedWorkspaceId: null,
    selectedProject: null,
    selectedProjectId: null
  });
  
  const updateApiProps = (newProps: Partial<ApiProps>) => {
    setApiProps(prevProps => ({
      ...prevProps,
      ...newProps
    }));
  };

  const handleApiConnect = (apiKey: string, workspaces: any[], workspaceId?: string, project?: string) => {
    updateApiProps({
      apiKey: apiKey,
      workspaces: workspaces,
      selectedWorkspaceId: workspaceId || null,
      selectedProject: project || null,
      isConnected: true
    });
    // Move to workspace selection after connecting
    setStep('workspace');
  };

  const handleSkipConnect = () => {
    updateApiProps({
      isConnected: false,
      apiKey: null,
      workspaces: [],
      users: [],
      selectedWorkspaceId: null,
      selectedProject: null,
      selectedProjectId: null
    });
    setStep('input');
  };
  
  const handleStartOver = () => {
    setNoteText('');
    setExtractedTasks([]);
    setProjectName(null);
    setStep('input');
  };
  
  const handleReconnect = () => {
    setStep('connect');
  };

  const handleTaskParse = (
    text: string, 
    providedProjectName: string | null
  ) => {
    // Store the raw text for later reference
    setNoteText(text);
    
    // Extract a project name from the provided value or text
    const effectiveProjectName = providedProjectName || apiProps.selectedProject;
    setProjectName(effectiveProjectName);
    
    // Process the text into tasks
    console.log('Parsing text into tasks with project name:', effectiveProjectName);
    
    // Show a loading indicator
    setIsLoading(true);
    
    // Process the text through our edge function
    processNotesText(text, effectiveProjectName, apiProps.users)
      .then(({ tasks, error }) => {
        if (error) {
          console.error('Error parsing text:', error);
          toast({
            title: "Error extracting tasks",
            description: "There was a problem processing your notes. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        console.log('Tasks extracted:', tasks);
        
        if (tasks && tasks.length > 0) {
          // Ensure tasks have project names and workspace IDs set
          const processedTasks = tasks.map(task => ({
            ...task,
            project: effectiveProjectName || task.project,
            workspace_id: apiProps.selectedWorkspaceId || task.workspace_id
          }));
          
          // Store the tasks for the review step
          setExtractedTasks(processedTasks);
          
          // Move to the tasks review step
          setStep('tasks');
          
          toast({
            title: "Tasks extracted",
            description: `Successfully extracted ${tasks.length} tasks from your notes.`,
          });
        } else {
          toast({
            title: "No tasks found",
            description: "No tasks were found in your notes. Try adding more details or keywords like 'todo'.",
            variant: "destructive"
          });
        }
      })
      .catch(err => {
        console.error('Error in task parsing:', err);
        toast({
          title: "Error extracting tasks",
          description: "There was a problem processing your notes. Please try again.",
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  const handleAddToMotion = async (tasks: Task[], projectName: string | null, unassignedCount: number = 0) => {
    console.log('Adding tasks to Motion:', tasks, projectName, unassignedCount);
    
    // Don't proceed if not connected to Motion API
    if (!apiProps.isConnected || !apiProps.apiKey) {
      console.log('Not connected to Motion API, skipping task creation');
      setStep('complete');
      return;
    }

    setIsLoading(true);
    
    try {
      // Import the addTasksToMotion function
      const { addTasksToMotion } = await import('@/utils/motion/tasks');
      
      // Call the Motion API with the selected project ID
      const result = await addTasksToMotion(
        tasks,
        apiProps.selectedWorkspaceId,
        apiProps.apiKey,
        apiProps.selectedProjectId // Ensure the selected project ID is passed
      );
      
      if (result.success) {
        toast({
          title: "Tasks added successfully",
          description: result.message,
        });
      } else {
        toast({
          title: "Some tasks failed to add",
          description: result.message,
          variant: "destructive"
        });
      }
      
      // Show any specific errors
      if (result.errors && result.errors.length > 0) {
        console.error('Task creation errors:', result.errors);
      }
      
    } catch (error) {
      console.error('Error adding tasks to Motion:', error);
      toast({
        title: "Error adding tasks",
        description: "There was a problem adding your tasks to Motion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setStep('complete');
    }
  };

  return (
    <AppContext.Provider value={{
      step,
      setStep,
      noteText,
      setNoteText,
      extractedTasks,
      setExtractedTasks,
      projectName,
      setProjectName,
      apiProps,
      updateApiProps,
      handleApiConnect,
      handleSkipConnect,
      handleStartOver,
      handleReconnect,
      isLoading,
      setIsLoading,
      handleParseText: handleTaskParse,
      handleAddToMotion
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
