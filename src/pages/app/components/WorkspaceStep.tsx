
import React from 'react';
import WorkspaceProjectSelect from '@/components/WorkspaceProjectSelect';

interface WorkspaceStepProps {
  apiKey: string | null;
  workspaces: any[];
  selectedWorkspaceId: string | null;
  selectedProject: string | null;
  onWorkspaceSelect: (workspaceId: string) => void;
  onProjectSelect: (projectName: string, projectId?: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

const WorkspaceStep: React.FC<WorkspaceStepProps> = ({
  apiKey,
  workspaces,
  selectedWorkspaceId,
  selectedProject,
  onWorkspaceSelect,
  onProjectSelect,
  onContinue,
  onBack
}) => {
  return (
    <WorkspaceProjectSelect 
      apiKey={apiKey}
      workspaces={workspaces}
      selectedWorkspaceId={selectedWorkspaceId}
      selectedProject={selectedProject}
      onWorkspaceSelect={onWorkspaceSelect}
      onProjectSelect={onProjectSelect}
      onContinue={onContinue}
      onBack={onBack}
    />
  );
};

export default WorkspaceStep;
