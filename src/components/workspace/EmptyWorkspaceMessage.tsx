
import React from 'react';

interface EmptyWorkspaceMessageProps {
  isLoading: boolean;
  error: string | null;
  workspaces: any[];
}

const EmptyWorkspaceMessage: React.FC<EmptyWorkspaceMessageProps> = ({ 
  isLoading, 
  error, 
  workspaces 
}) => {
  if (isLoading || error || workspaces.length > 0) {
    return null;
  }
  
  return (
    <p className="text-sm text-amber-600 mt-1">
      No workspaces found. You can create a new one or check your API key.
    </p>
  );
};

export default EmptyWorkspaceMessage;
