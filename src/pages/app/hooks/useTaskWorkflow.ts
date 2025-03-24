
import { useState } from 'react';
import { useAppContext } from '../context/AppContextProvider';
import { handleWorkspaceSelect } from '../context/handlers/apiHandlers';
import { Task } from '@/utils/parser';

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
    providedProjectName: string | null, 
    unrecognizedUserMappingsOrCallback?: Record<string, string | null> | ((names: string[]) => void)
  ) => {
    // If we received user mappings as an object (not a function), store them and process
    if (unrecognizedUserMappingsOrCallback && typeof unrecognizedUserMappingsOrCallback !== 'function') {
      // Store the mappings
      setUnrecognizedUserMappings(unrecognizedUserMappingsOrCallback);
      console.log('Saved user mappings:', unrecognizedUserMappingsOrCallback);
      
      // Continue with task parsing using the mappings
      handleParseText(text, providedProjectName);
    } else {
      // This is the initial parse or a callback for unrecognized names
      handleParseText(
        text, 
        providedProjectName, 
        typeof unrecognizedUserMappingsOrCallback === 'function' 
          ? unrecognizedUserMappingsOrCallback 
          : undefined
      );
    }
  };
  
  const handleTasksAddToMotion = (tasks: Task[], updatedProjectName: string | null, unassignedCount: number = 0) => {
    handleAddToMotion(tasks, updatedProjectName, unassignedCount);
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
