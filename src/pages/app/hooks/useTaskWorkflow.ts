
import { useState } from 'react';
import { useAppContext } from '../context/AppContextProvider';
import { handleWorkspaceSelect } from '../context/handlers/apiHandlers';
import { Task } from '@/utils/parser';
import { ApiProps } from '../types';

export function useTaskWorkflow() {
  const { 
    apiProps,
    updateApiProps,
    handleParseText,
    handleAddToMotion,
    setStep
  } = useAppContext();
  
  // State for handling unrecognized users
  const [unrecognizedUserMappings, setUnrecognizedUserMappings] = useState<Record<string, string | null>>({});
  
  const handleWorkspaceSelection = (workspaceId: string) => {
    handleWorkspaceSelect(workspaceId, apiProps.apiKey, updateApiProps);
  };

  const handleProjectSelect = (projectName: string, projectId?: string) => {
    // Store both project name and ID
    updateApiProps({ 
      selectedProject: projectName,
      selectedProjectId: projectId
    });
  };

  const handleContinueToInput = () => {
    setStep('input');
  };
  
  const handleAddMore = () => {
    setStep('workspace');
  };
  
  const handleTaskParse = (
    text: string, 
    providedProjectName: string | null
  ) => {
    // Simplified to just process the tasks
    handleParseText(text, providedProjectName);
  };
  
  const handleTasksAddToMotion = (tasks: Task[], updatedProjectName: string | null, unassignedCount: number = 0, passedApiProps?: ApiProps) => {
    handleAddToMotion(tasks, updatedProjectName, unassignedCount, passedApiProps || apiProps);
  };

  return {
    unrecognizedUserMappings,
    handleWorkspaceSelection,
    handleProjectSelect,
    handleContinueToInput,
    handleAddMore,
    handleTaskParse,
    handleTasksAddToMotion
  };
}
