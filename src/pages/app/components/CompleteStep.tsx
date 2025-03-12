
import React from 'react';
import CompletionScreen from '../CompletionScreen';
import { Task } from '@/utils/parser';

interface CompleteStepProps {
  tasks: Task[];
  projectName: string | null;
  isConnected: boolean;
  onReconnect: () => void;
  onAddMore?: () => void;
}

const CompleteStep: React.FC<CompleteStepProps> = ({
  tasks,
  projectName,
  isConnected,
  onReconnect,
  onAddMore
}) => {
  return (
    <CompletionScreen 
      tasks={tasks}
      projectName={projectName}
      isConnected={isConnected}
      onStartOver={() => {}} // Not used anymore
      onReconnect={onReconnect}
      onAddMore={onAddMore}
    />
  );
};

export default CompleteStep;
