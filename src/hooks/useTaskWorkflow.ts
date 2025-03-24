
import { useState } from 'react';
import { useAppContext } from '../pages/app/context/AppContextProvider';
import { handleWorkspaceSelect } from '../pages/app/context/handlers/apiHandlers';
import { Task } from '@/utils/parser';

export function useTaskWorkflow() {
  const { 
    apiProps,
    updateApiProps,
    handleParseText,
    handleAddToMotion,
    setStep
  } = useAppContext();
  
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
  
  const handleTasksAddToMotion = (tasks: Task[], updatedProjectName: string | null, unassignedCount: number = 0) => {
    handleAddToMotion(tasks, updatedProjectName, unassignedCount);
  };

  return {
    handleWorkspaceSelection,
    handleProjectSelect,
    handleContinueToInput,
    handleAddMore,
    handleTaskParse,
    handleTasksAddToMotion
  };
}
