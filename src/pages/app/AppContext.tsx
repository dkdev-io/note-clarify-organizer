
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
    setApiProps(prev => {
      // If workspace is changing, clear the selected project
      if (props.selectedWorkspaceId && props.selectedWorkspaceId !== prev.selectedWorkspaceId) {
        return { ...prev, ...props, selectedProject: undefined };
      }
      return { ...prev, ...props };
    });
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
      
      console.log(`Parsing text with length: ${text.length} and project name: ${providedProjectName || 'none'}`);
      setNoteText(text);
      setIsProcessing(true);
      
      // Use the selected project from Motion API if available, otherwise use provided name
      const effectiveProjectName = apiProps.selectedProject || providedProjectName;
      console.log(`Effective project name: ${effectiveProjectName || 'none'}`);
      
      // Always start with the fallback parser to ensure we have results
      const fallbackTasks = parseTextIntoTasks(text, effectiveProjectName);
      console.log(`Fallback parser extracted ${fallbackTasks.length} tasks`);
      
      let tasks: Task[] = fallbackTasks;
      let usedFallback = true;
      
      try {
        // Attempt to use the LLM processor if we have more than simple task text
        if (text.length > 50) {
          console.log('Attempting to use LLM processor...');
          const llmPromise = processNotesWithLLM(text, effectiveProjectName);
          
          // Add a timeout for the entire LLM processing
          const timeoutPromise = new Promise<Task[]>((_, reject) => {
            setTimeout(() => reject(new Error('LLM processing timed out after 15 seconds')), 15000);
          });
          
          // Race the LLM promise against the timeout
          const llmTasks = await Promise.race([llmPromise, timeoutPromise]);
          
          if (llmTasks && llmTasks.length > 0) {
            console.log(`LLM processor extracted ${llmTasks.length} tasks`);
            tasks = llmTasks;
            usedFallback = false;
            
            toast({
              title: "AI Processing Complete",
              description: `Successfully extracted ${tasks.length} tasks from your notes.`,
            });
          } else {
            console.log('LLM processor returned no tasks, using fallback parser results');
          }
        } else {
          console.log('Text too short, skipping LLM processing');
        }
      } catch (error) {
        console.error("Error using LLM processor, using fallback parser results:", error);
      }
      
      if (usedFallback) {
        toast({
          title: "Using basic task parser",
          description: `Extracted ${tasks.length} tasks using simple parsing.`,
        });
      }
      
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
        const fallbackTasks = parseTextIntoTasks(text, projectName);
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
