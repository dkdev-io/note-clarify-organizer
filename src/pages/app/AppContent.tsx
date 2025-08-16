
import React from 'react';
import { useAppContext } from './context/AppContextProvider';
import AppLayout from './components/AppLayout';
import StepContentRenderer from './components/StepContentRenderer';
import { useTaskWorkflow } from './hooks/useTaskWorkflow';
import { Step } from './types';

const AppContent: React.FC = () => {
  const { 
    unrecognizedUserMappings,
    handleAddMore,
    handleTaskParse,
    handleTasksAddToMotion
  } = useTaskWorkflow();
  
  const { 
    step,
    apiProps,
    setStep
  } = useAppContext();
  
  // Start with the connect step to ensure proper workflow
  React.useEffect(() => {
    if (step !== 'connect' && step !== 'input' && step !== 'tasks' && step !== 'complete') {
      setStep('connect');
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
        handleTaskParse={handleTaskParse}
        handleTasksAddToMotion={handleTasksAddToMotion}
        handleAddMore={handleAddMore}
        unrecognizedUserMappings={unrecognizedUserMappings}
      />
    </AppLayout>
  );
};

export default AppContent;
