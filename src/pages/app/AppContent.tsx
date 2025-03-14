import React, { useState } from 'react';
import { useAppContext } from './context/AppContextProvider';
import AppLayout from './components/AppLayout';
import ConnectStep from './components/ConnectStep';
import WorkspaceStep from './components/WorkspaceStep';
import InputStep from './components/input-step';
import TasksStep from './components/TasksStep';
import CompleteStep from './components/CompleteStep';
import { handleWorkspaceSelect } from './context/handlers/apiHandlers';
import { Task } from '@/utils/parser';

const AppContent: React.FC = () => {
  const { 
    step,
    noteText,
    extractedTasks,
    projectName,
    apiProps,
    updateApiProps,
    handleApiConnect,
    handleSkipConnect,
    handleParseText,
    handleAddToMotion,
    handleStartOver,
    handleReconnect,
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
  
  const renderStepContent = () => {
    switch (step) {
      case 'connect':
        return (
          <ConnectStep 
            onConnect={handleApiConnect} 
            onSkip={handleSkipConnect} 
          />
        );
      
      case 'workspace':
        return (
          <WorkspaceStep 
            apiKey={apiProps.apiKey}
            workspaces={apiProps.workspaces}
            selectedWorkspaceId={apiProps.selectedWorkspaceId || null}
            selectedProject={apiProps.selectedProject || null}
            onWorkspaceSelect={handleWorkspaceSelection}
            onProjectSelect={handleProjectSelect}
            onContinue={handleContinueToInput}
            onBack={() => setStep('connect')}
          />
        );
        
      case 'input':
        return (
          <InputStep 
            onParseTasks={handleTaskParse} 
            apiProps={apiProps}
          />
        );
        
      case 'tasks':
        return (
          <TasksStep 
            rawText={noteText}
            initialTasks={extractedTasks}
            projectName={projectName}
            onBack={handleStartOver}
            onAddToMotion={handleTasksAddToMotion}
            apiProps={apiProps}
            unrecognizedUserMappings={unrecognizedUserMappings}
          />
        );
        
      case 'complete':
        return (
          <CompleteStep 
            tasks={extractedTasks}
            projectName={projectName}
            isConnected={apiProps.isConnected}
            onReconnect={handleReconnect}
            onAddMore={apiProps.isConnected ? handleAddMore : undefined}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <AppLayout
      step={step}
      isConnected={apiProps.isConnected}
      workspaces={apiProps.workspaces}
      selectedWorkspaceId={apiProps.selectedWorkspaceId}
      selectedProject={apiProps.selectedProject}
    >
      {renderStepContent()}
    </AppLayout>
  );
};

export default AppContent;
