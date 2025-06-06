
import React from 'react';
import { useAppContext } from './context/AppContextProvider';
import AppLayout from './components/AppLayout';
import StepContentRenderer from './components/StepContentRenderer';
import { useTaskWorkflow } from './hooks/useTaskWorkflow';
import { Step } from './types';

const AppContent: React.FC = () => {
  const { 
    unrecognizedUserMappings,
    handleWorkspaceSelection,
    handleProjectSelect,
    handleContinueToInput,
    handleAddMore,
    handleTaskParse,
    handleTasksAddToMotion
  } = useTaskWorkflow();
  
  const { 
    step,
    apiProps,
    setStep
  } = useAppContext();
  
  // Start directly at the input step since no auth is required
  React.useEffect(() => {
    if (step === 'connect') {
      setStep('input');
    }
  }, [step, setStep]);
  
  return (
    <AppLayout
      step={step as Step}
      isConnected={apiProps.isConnected}
      workspaces={apiProps.workspaces}
      selectedWorkspaceId={apiProps.selectedWorkspaceId}
      selectedProject={apiProps.selectedProject}
    >
      <StepContentRenderer
        handleWorkspaceSelection={handleWorkspaceSelection}
        handleProjectSelect={handleProjectSelect}
        handleContinueToInput={handleContinueToInput}
        handleTaskParse={handleTaskParse}
        handleTasksAddToMotion={handleTasksAddToMotion}
        handleAddMore={handleAddMore}
        unrecognizedUserMappings={unrecognizedUserMappings}
      />
    </AppLayout>
  );
};

export default AppContent;
