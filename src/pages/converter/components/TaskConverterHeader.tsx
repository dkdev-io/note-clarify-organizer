
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckIcon } from 'lucide-react';
import { Step } from '../types';

interface TaskConverterHeaderProps {
  isConnected: boolean;
  step: Step;
  workspaces: any[];
  selectedWorkspaceId?: string;
  selectedProject?: string;
}

const TaskConverterHeader: React.FC<TaskConverterHeaderProps> = ({
  isConnected,
  step,
  workspaces,
  selectedWorkspaceId,
  selectedProject
}) => {
  return (
    <header className="text-center mb-8">
      <h1 className="text-3xl font-medium text-gray-900 mb-2">It's Time to Projectize</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        Transform your meeting notes into structured tasks for Motion
      </p>
      {isConnected && step !== 'connect' && step !== 'complete' && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Badge className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
            <CheckIcon className="h-3 w-3 mr-1" />
            Connected to Motion API
          </Badge>
          
          {selectedWorkspaceId && (
            <Badge className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
              Workspace: {workspaces.find(w => w.id === selectedWorkspaceId)?.name || selectedWorkspaceId}
            </Badge>
          )}
          
          {selectedProject && (
            <Badge className="px-3 py-1 bg-purple-50 text-purple-700 border-purple-200">
              Project: {selectedProject}
            </Badge>
          )}
        </div>
      )}
    </header>
  );
};

export default TaskConverterHeader;
