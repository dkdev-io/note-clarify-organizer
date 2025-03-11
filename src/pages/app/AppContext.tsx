import React, { createContext, useState, useContext } from 'react';
import { AppContextType, ApiProps, Step } from './types';
import { Task, parseTextIntoTasks } from '@/utils/parser';
import { useToast } from "@/components/ui/use-toast";

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<Step>('connect');
  const [noteText, setNoteText] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [processedTasks, setProcessedTasks] = useState<Task[]>([]);
  const [reviewedTasks, setReviewedTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState<string | null>(null);
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
    setApiProps({
      apiKey,
      workspaces: fetchedWorkspaces,
      selectedWorkspaceId: workspaceId,
      selectedProject: project,
      isConnected: true,
    });
    setProjectName(project || null);
    setStep('input');
  };

  // Handle skipping API connection
  const handleSkipConnect = () => {
    updateApiProps({ isConnected: false });
    setStep('input');
  };

  // Handle moving from note input to task extraction
  const handleParseText = (text: string, providedProjectName: string | null) => {
    setNoteText(text);
    
    // Use the selected project from Motion API if available, otherwise use provided name
    const effectiveProjectName = apiProps.selectedProject || providedProjectName;
    
    const tasks = parseTextIntoTasks(text, effectiveProjectName);
    
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
    
    setStep('extract');
  };

  // Handle moving from extraction to LLM processing
  const handleContinueToProcess = (tasks: Task[]) => {
    setSelectedTasks(tasks);
    setStep('process');
  };

  // Handle moving from LLM processing to review
  const handleContinueToReview = (tasks: Task[]) => {
    setProcessedTasks(tasks);
    setStep('review');
  };

  // Handle moving from review to preview
  const handleContinueToPreview = (tasks: Task[], updatedProjectName?: string) => {
    if (updatedProjectName) {
      setProjectName(updatedProjectName);
      // Update all tasks with the project name
      const updatedTasks = tasks.map(task => ({
        ...task,
        project: updatedProjectName
      }));
      setReviewedTasks(updatedTasks);
    } else {
      setReviewedTasks(tasks);
    }
    setStep('preview');
  };

  // Handle completion of the workflow
  const handleComplete = () => {
    setStep('complete');
    toast({
      title: "Success!",
      description: `${reviewedTasks.length} tasks have been added to Motion${projectName ? ` under project '${projectName}'` : ''}.`,
    });
  };

  // Handle starting over
  const handleStartOver = () => {
    setNoteText('');
    setExtractedTasks([]);
    setSelectedTasks([]);
    setProcessedTasks([]);
    setReviewedTasks([]);
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
    selectedTasks,
    setSelectedTasks,
    processedTasks,
    setProcessedTasks,
    reviewedTasks,
    setReviewedTasks,
    projectName,
    setProjectName,
    apiProps,
    updateApiProps,
    handleApiConnect,
    handleSkipConnect,
    handleParseText,
    handleContinueToProcess,
    handleContinueToReview,
    handleContinueToPreview,
    handleComplete,
    handleStartOver,
    handleReconnect
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
