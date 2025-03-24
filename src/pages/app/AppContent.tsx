
import React, { useEffect } from 'react';
import { useAppContext } from './context/AppContextProvider';
import AppLayout from './components/AppLayout';
import StepContentRenderer from './components/StepContentRenderer';
import LoadingScreen from './components/LoadingScreen';
import { useAppAuthentication } from './hooks/useAppAuthentication';
import { useTaskWorkflow } from './hooks/useTaskWorkflow';
import { Step } from './types';

const AppContent: React.FC = () => {
  const { isAuthenticating } = useAppAuthentication();
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
  
  // When authenticated, ensure we start with the connect step
  useEffect(() => {
    if (!isAuthenticating && !apiProps.isConnected) {
      // If authenticated but not connected to Motion, set step to connect
      setStep('connect' as Step);
    } else if (!isAuthenticating && apiProps.isConnected && !apiProps.selectedWorkspaceId) {
      // If connected to Motion but no workspace selected, go to workspace step
      setStep('workspace' as Step);
    }
  }, [isAuthenticating, apiProps.isConnected, apiProps.selectedWorkspaceId, setStep]);
  
  // If still checking authentication, show loading
  if (isAuthenticating) {
    return <LoadingScreen />;
  }
  
  return (
    <AppLayout
      step={step}
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
