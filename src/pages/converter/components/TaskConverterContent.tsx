
import React from 'react';
import MotionApiConnect from '@/components/MotionApiConnect';
import NoteInput from '@/components/NoteInput';
import TaskExtractor from '@/components/TaskExtractor';
import LLMProcessor from '@/components/LLMProcessor';
import TaskReview from '@/components/TaskReview';
import TaskPreview from '@/components/TaskPreview';
import { Task } from '@/utils/parser';
import { Step, ApiProps } from '../types';

interface TaskConverterContentProps {
  step: Step;
  noteText: string;
  projectName: string | null;
  extractedTasks: Task[];
  selectedTasks: Task[];
  processedTasks: Task[];
  reviewedTasks: Task[];
  apiProps: ApiProps;
  onApiConnect: (apiKey: string, fetchedWorkspaces: any[], workspaceId?: string, project?: string) => void;
  onSkipConnect: () => void;
  onParseText: (text: string, projectName: string | null) => void;
  onContinueToProcess: (tasks: Task[]) => void;
  onContinueToReview: (tasks: Task[]) => void;
  onContinueToPreview: (tasks: Task[], updatedProjectName?: string) => void;
  onComplete: () => void;
  onBackToExtract: () => void;
  onBackToProcess: () => void;
  onBackToReview: () => void;
  onBackToInput: () => void;
}

const TaskConverterContent: React.FC<TaskConverterContentProps> = ({
  step,
  noteText,
  projectName,
  extractedTasks,
  selectedTasks,
  processedTasks,
  reviewedTasks,
  apiProps,
  onApiConnect,
  onSkipConnect,
  onParseText,
  onContinueToProcess,
  onContinueToReview,
  onContinueToPreview,
  onComplete,
  onBackToExtract,
  onBackToProcess,
  onBackToReview,
  onBackToInput
}) => {
  switch (step) {
    case 'connect':
      return (
        <MotionApiConnect 
          onConnect={onApiConnect} 
          onSkip={onSkipConnect} 
        />
      );
    
    case 'input':
      return (
        <NoteInput 
          onParseTasks={onParseText} 
          apiProps={apiProps}
        />
      );
    
    case 'extract':
      return (
        <TaskExtractor 
          rawText={noteText}
          extractedTasks={extractedTasks}
          projectName={projectName}
          onBack={onBackToInput}
          onContinue={onContinueToProcess}
          apiProps={apiProps}
        />
      );
    
    case 'process':
      return (
        <LLMProcessor 
          selectedTasks={selectedTasks}
          projectName={projectName}
          onBack={onBackToExtract}
          onContinue={onContinueToReview}
          apiProps={apiProps}
        />
      );
    
    case 'review':
      return (
        <TaskReview 
          tasks={processedTasks}
          projectName={projectName}
          onBack={onBackToProcess}
          onContinue={onContinueToPreview}
          apiProps={apiProps}
        />
      );
    
    case 'preview':
      return (
        <TaskPreview 
          tasks={reviewedTasks}
          projectName={projectName}
          onBack={onBackToReview}
          onComplete={onComplete}
          apiProps={apiProps}
        />
      );
    
    default:
      return null;
  }
};

export default TaskConverterContent;
