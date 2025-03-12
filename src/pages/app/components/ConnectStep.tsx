
import React from 'react';
import MotionApiConnect from '@/components/MotionApiConnect';

interface ConnectStepProps {
  onConnect: (apiKey: string, fetchedWorkspaces: any[], workspaceId?: string, project?: string, users?: any[]) => void;
  onSkip: () => void;
}

const ConnectStep: React.FC<ConnectStepProps> = ({
  onConnect,
  onSkip
}) => {
  return (
    <MotionApiConnect 
      onConnect={onConnect} 
      onSkip={onSkip} 
    />
  );
};

export default ConnectStep;
