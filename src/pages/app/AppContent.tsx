
import React from 'react';
import { useAppContext } from './AppContext';
import StepIndicator from './StepIndicator';
import CompletionScreen from './CompletionScreen';
import { AppHeader } from './AppLayout';
import NoteInput from '@/components/NoteInput';
import TaskExtractor from '@/components/TaskExtractor';
import LLMProcessor from '@/components/LLMProcessor';
import TaskReview from '@/components/TaskReview';
import TaskPreview from '@/components/TaskPreview';
import MotionApiConnect from '@/components/MotionApiConnect';

const AppContent: React.FC = () => {
  const { 
    step,
    setStep,
    noteText,
    extractedTasks,
    selectedTasks,
    processedTasks,
    reviewedTasks,
    projectName,
    apiProps,
    handleApiConnect,
    handleSkipConnect,
    handleParseText,
    handleContinueToProcess,
    handleContinueToReview,
    handleContinueToPreview,
    handleComplete,
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
        
      case 'extract':
        return (
          <TaskExtractor 
            rawText={noteText}
            extractedTasks={extractedTasks}
            projectName={projectName}
            onBack={() => setStep('input')}
            onContinue={handleContinueToProcess}
            apiProps={apiProps}
          />
        );
        
      case 'process':
        return (
          <LLMProcessor 
            selectedTasks={selectedTasks}
            projectName={projectName}
            onBack={() => setStep('extract')}
            onContinue={handleContinueToReview}
            apiProps={apiProps}
          />
        );
        
      case 'review':
        return (
          <TaskReview 
            tasks={processedTasks}
            projectName={projectName}
            onBack={() => setStep('process')}
            onContinue={handleContinueToPreview}
            apiProps={apiProps}
          />
        );
        
      case 'preview':
        return (
          <TaskPreview 
            tasks={reviewedTasks}
            projectName={projectName}
            onBack={() => setStep('review')}
            onComplete={handleComplete}
            apiProps={apiProps}
          />
        );
        
      case 'complete':
        return (
          <CompletionScreen 
            tasks={reviewedTasks}
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
