import React, { createContext, useState, useContext } from 'react';
import { AppContextType } from './contextTypes';
import { ApiProps, Step } from '../types';
import { Task } from '@/utils/parser';
import { useToast } from "@/hooks/use-toast";
import { 
  handleApiConnect as apiConnectHandler,
  handleSkipConnect as skipConnectHandler,
  handleStartOver as startOverHandler,
  handleReconnect as reconnectHandler
} from './handlers/apiHandlers';
import {
  handleParseText as parseTextHandler,
  handleAddToMotion as addToMotionHandler
} from './handlers/taskHandlers';

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
    selectedWorkspaceId: null,
    selectedProject: null,
    selectedProjectId: null,
    users: [],
  });

  // Update API props
  const updateApiProps = (props: Partial<ApiProps>) => {
    setApiProps(prev => {
      // If workspace is changing, clear the selected project
      if (props.selectedWorkspaceId && props.selectedWorkspaceId !== prev.selectedWorkspaceId) {
        return { ...prev, ...props, selectedProject: null, selectedProjectId: null };
      }
      return { ...prev, ...props };
    });
  };
  
  // Handler functions - now using the extracted handlers
  const handleApiConnect = (apiKey: string, fetchedWorkspaces: any[], workspaceId?: string, project?: string, users?: any[]) => {
    apiConnectHandler(apiKey, fetchedWorkspaces, setApiProps, setProjectName, setStep, workspaceId, project, users);
  };

  const handleSkipConnect = () => {
    skipConnectHandler(setStep, updateApiProps);
  };

  const handleParseText = async (text: string, providedProjectName: string | null, setUnrecognizedNames?: (names: string[]) => void) => {
    await parseTextHandler(
      text, 
      providedProjectName, 
      setNoteText, 
      setIsProcessing, 
      apiProps, 
      setProjectName, 
      setExtractedTasks, 
      setStep, 
      toast,
      setUnrecognizedNames
    );
  };

  const handleAddToMotion = (tasks: Task[], updatedProjectName: string | null, unassignedCount: number = 0) => {
    addToMotionHandler(tasks, updatedProjectName, setProjectName, setStep, toast, unassignedCount);
  };

  const handleStartOver = () => {
    startOverHandler(setNoteText, setExtractedTasks, setProjectName, apiProps, setStep);
  };

  const handleReconnect = () => {
    reconnectHandler(setStep);
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
