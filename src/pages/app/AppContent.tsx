
import React from 'react';
import { useAppContext } from './AppContext';
import AppLayout from './components/AppLayout';
import ConnectStep from './components/ConnectStep';
import WorkspaceStep from './components/WorkspaceStep';
import InputStep from './components/InputStep';
import TasksStep from './components/TasksStep';
import CompleteStep from './components/CompleteStep';

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
  
  const handleWorkspaceSelect = (workspaceId: string) => {
    updateApiProps({ selectedWorkspaceId: workspaceId });
  };

  const handleProjectSelect = (projectName: string, projectId?: string) => {
    updateApiProps({ selectedProject: projectName });
  };

  const handleContinueToInput = () => {
    setStep('input');
  };
  
  const handleAddMore = () => {
    setStep('workspace');
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
            onWorkspaceSelect={handleWorkspaceSelect}
            onProjectSelect={handleProjectSelect}
            onContinue={handleContinueToInput}
            onBack={() => setStep('connect')}
          />
        );
        
      case 'input':
        return (
          <InputStep 
            onParseTasks={handleParseText} 
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
            onAddToMotion={handleAddToMotion}
            apiProps={apiProps}
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
