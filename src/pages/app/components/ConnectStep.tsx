
import React, { useState } from 'react';
import MotionApiConnect from '@/components/MotionApiConnect';
import TaskConverterContent from '../../converter/components/TaskConverterContent';

interface ConnectStepProps {
  onConnect: (apiKey: string, fetchedWorkspaces: any[], workspaceId?: string, project?: string, users?: any[]) => void;
  onSkip: () => void;
}

const ConnectStep: React.FC<ConnectStepProps> = ({
  onConnect,
  onSkip
}) => {
  const [isConnected, setIsConnected] = useState(false);
  
  const handleConnect = (apiKey: string, fetchedWorkspaces: any[], workspaceId?: string, project?: string, users?: any[]) => {
    setIsConnected(true);
    onConnect(apiKey, fetchedWorkspaces, workspaceId, project, users);
  };
  
  const handleSkip = () => {
    setIsConnected(true);
    onSkip();
  };
  
  if (isConnected) {
    return <TaskConverterContent />;
  }
  
  return (
    <MotionApiConnect 
      onConnect={handleConnect} 
      onSkip={handleSkip} 
    />
  );
};

export default ConnectStep;
