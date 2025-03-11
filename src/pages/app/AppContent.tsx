
import React from 'react';
import { useAppContext } from './AppContext';
import StepIndicator from './StepIndicator';
import CompletionScreen from './CompletionScreen';
import { AppHeader } from './AppLayout';
import NoteInput from '@/components/NoteInput';
import TasksReview from '@/components/TasksReview';
import MotionApiConnect from '@/components/MotionApiConnect';

const AppContent: React.FC = () => {
  const { 
    step,
    noteText,
    extractedTasks,
    projectName,
    apiProps,
    handleApiConnect,
    handleSkipConnect,
    handleParseText,
    handleAddToMotion,
    handleStartOver,
    handleReconnect
  } = useAppContext();
  
  const renderStepContent = () => {
    switch (step) {
      case 'connect':
        return (
          <MotionApiConnect 
            onConnect={handleApiConnect} 
            onSkip={handleSkipConnect} 
          />
        );
        
      case 'input':
        return (
          <NoteInput 
            onParseTasks={handleParseText} 
            apiProps={apiProps}
          />
        );
        
      case 'tasks':
        return (
          <TasksReview 
            rawText={noteText}
            initialTasks={extractedTasks}
            projectName={projectName}
            onBack={() => handleStartOver()}
            onAddToMotion={handleAddToMotion}
            apiProps={apiProps}
          />
        );
        
      case 'complete':
        return (
          <CompletionScreen 
            tasks={extractedTasks}
            projectName={projectName}
            isConnected={apiProps.isConnected}
            onStartOver={handleStartOver}
            onReconnect={handleReconnect}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        <AppHeader 
          isConnected={apiProps.isConnected}
          step={step}
          workspaces={apiProps.workspaces}
          selectedWorkspaceId={apiProps.selectedWorkspaceId}
          selectedProject={apiProps.selectedProject}
        />
        
        {step !== 'complete' && (
          <StepIndicator 
            currentStep={step} 
            isConnected={apiProps.isConnected} 
          />
        )}
        
        <main className="flex-1">
          {renderStepContent()}
        </main>
      </div>
    </div>
  );
};

export default AppContent;
