
import React from 'react';
import { useAppContext } from '../context/AppContextProvider';
import ConnectStep from './ConnectStep';
import InputStep from './input-step';
import TasksStep from './TasksStep';
import CompleteStep from './CompleteStep';
import { Task } from '@/utils/parser';
import { ApiProps } from '../types';

interface StepContentRendererProps {
  handleTaskParse: (
    text: string, 
    providedProjectName: string | null, 
    unrecognizedUserMappingsOrCallback?: Record<string, string | null> | ((names: string[]) => void)
  ) => void;
  handleTasksAddToMotion: (tasks: Task[], updatedProjectName: string | null, unassignedCount?: number) => void;
  handleAddMore: () => void;
  unrecognizedUserMappings: Record<string, string | null>;
}

const StepContentRenderer: React.FC<StepContentRendererProps> = ({
  handleTaskParse,
  handleTasksAddToMotion,
  handleAddMore,
  unrecognizedUserMappings
}) => {
  const { 
    step,
    noteText,
    extractedTasks,
    projectName,
    apiProps,
    handleApiConnect,
    handleSkipConnect,
    handleStartOver,
    handleReconnect,
    setStep
  } = useAppContext();
  
  switch (step) {
    case 'connect':
      return (
        <ConnectStep 
          onConnect={handleApiConnect} 
          onSkip={handleSkipConnect} 
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

export default StepContentRenderer;
