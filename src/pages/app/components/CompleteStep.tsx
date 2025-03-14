
import React, { useState } from 'react';
import CompletionScreen from '../CompletionScreen';
import { Task } from '@/utils/parser';

interface CompleteStepProps {
  tasks: Task[];
  projectName: string | null;
  isConnected: boolean;
  onReconnect: () => void;
  onAddMore?: () => void;
  onTimeEstimateUpdate?: (timeEstimate: string) => void;
}

const CompleteStep: React.FC<CompleteStepProps> = ({
  tasks,
  projectName,
  isConnected,
  onReconnect,
  onAddMore,
  onTimeEstimateUpdate
}) => {
  return (
    <CompletionScreen 
      tasks={tasks}
      projectName={projectName}
      isConnected={isConnected}
      onStartOver={() => {}} // Not used anymore
      onReconnect={onReconnect}
      onAddMore={onAddMore}
      onTimeEstimateUpdate={onTimeEstimateUpdate}
    />
  );
};

export default CompleteStep;
