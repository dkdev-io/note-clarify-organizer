
import React, { createContext, useState, useContext } from 'react';
import { AppContextType, ApiProps, Step } from './types';
import { Task, parseTextIntoTasks } from '@/utils/parser';
import { useToast } from "@/components/ui/use-toast";
import { processNotesWithLLM } from '@/utils/llm';
import { storeApiKey } from '@/utils/keyStorage';

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<Step>('connect');
  const [noteText, setNoteText] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Motion API connection state
  const [apiProps, setApiProps] = useState<ApiProps>({
    apiKey: null,
    workspaces: [],
    isConnected: false,
    selectedWorkspaceId: undefined,
    selectedProject: undefined,
  });

  // Update API props
  const updateApiProps = (props: Partial<ApiProps>) => {
    setApiProps(prev => ({ ...prev, ...props }));
  };
  
  // Handle API connection
  const handleApiConnect = (apiKey: string, fetchedWorkspaces: any[], workspaceId?: string, project?: string) => {
    // Store the API key in the app context
    if (apiKey !== 'proxy_mode') {
      // We'll store in localStorage in the MotionApiConnect component
      // But we still update our application state
      storeApiKey(apiKey);
    }
    
    // Just update API key and workspaces but move to workspace selection step instead
    setApiProps({
      apiKey,
      workspaces: fetchedWorkspaces,
      selectedWorkspaceId: workspaceId,
      selectedProject: project,
      isConnected: true,
    });
    
    // If connected via proxy mode with default workspace, skip to input
    if (apiKey === 'proxy_mode' && workspaceId) {
      setProjectName(project || null);
      setStep('input');
    } else {
      // Otherwise go to workspace selection step
      setStep('workspace');
    }
  };

  // Handle skipping API connection
  const handleSkipConnect = () => {
    updateApiProps({ isConnected: false });
    setStep('input');
  };

  // Handle moving from note input to task extraction
  const handleParseText = async (text: string, providedProjectName: string | null) => {
    try {
      if (!text || text.trim() === '') {
        toast({
          title: "Empty notes",
          description: "Please enter some notes to extract tasks from.",
          variant: "destructive"
        });
        return;
      }
      
      setNoteText(text);
      setIsProcessing(true);
      
      // Use the selected project from Motion API if available, otherwise use provided name
      const effectiveProjectName = apiProps.selectedProject || providedProjectName;
      
      let tasks: Task[] = [];
      let usedFallback = false;
      
      try {
        // Attempt to use the LLM processor with explicit timeout and retries
        console.log('Attempting to use LLM processor...');
        const llmPromise = processNotesWithLLM(text, effectiveProjectName);
        
        // Add a timeout for the entire LLM processing
        const timeoutPromise = new Promise<Task[]>((_, reject) => {
          setTimeout(() => reject(new Error('LLM processing timed out after 30 seconds')), 30000);
        });
        
        // Race the LLM promise against the timeout
        tasks = await Promise.race([llmPromise, timeoutPromise]);
        console.log(`LLM processor extracted ${tasks.length} tasks`);
        
        if (tasks.length === 0) {
          console.log('LLM processor returned no tasks, falling back to simple parser');
          usedFallback = true;
          tasks = parseTextIntoTasks(text, effectiveProjectName);
        } else {
          toast({
            title: "AI Processing Complete",
            description: `Successfully extracted ${tasks.length} tasks from your notes.`,
          });
        }
      } catch (error) {
        console.error("Error using LLM processor, falling back to simple parser:", error);
        usedFallback = true;
        tasks = parseTextIntoTasks(text, effectiveProjectName);
      }
      
      if (usedFallback) {
        toast({
          title: "Using fallback task parser",
          description: "There was an issue with AI processing. Using simple parsing instead.",
          variant: "destructive"
        });
      }
      
      // Extract project name from tasks if not provided
      const extractedProjectName = tasks.find(task => task.project)?.project || effectiveProjectName || null;
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
      
      setStep('tasks');
    } catch (error) {
      console.error("Error parsing text:", error);
      toast({
        title: "Error processing notes",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle adding tasks to Motion
  const handleAddToMotion = (tasks: Task[], updatedProjectName: string | null) => {
    if (updatedProjectName) {
      setProjectName(updatedProjectName);
    }
    
    setStep('complete');
    toast({
      title: "Success!",
      description: `${tasks.length} tasks have been added to Motion${updatedProjectName ? ` under project '${updatedProjectName}'` : ''}.`,
    });
  };

  // Handle starting over
  const handleStartOver = () => {
    setNoteText('');
    setExtractedTasks([]);
    // Keep project and workspace if connected to API
    if (!apiProps.isConnected) {
      setProjectName(null);
    }
    // Keep API connection but return to input step
    setStep('input');
  };

  // Reconnect to Motion API
  const handleReconnect = () => {
    setStep('connect');
  };
  
  // Create the context value
  const contextValue: AppContextType = {
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
    handleParseText,
    handleAddToMotion,
    handleStartOver,
    handleReconnect,
    isProcessing
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
