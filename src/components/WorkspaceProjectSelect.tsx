import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from 'lucide-react';
import WorkspaceSelect from './WorkspaceSelect';
import { ProjectSelect } from './project';

interface WorkspaceProjectSelectProps {
  apiKey: string | null;
  workspaces: any[];
  selectedWorkspaceId: string | null;
  selectedProject: string | null;
  onWorkspaceSelect: (workspaceId: string) => void;
  onProjectSelect: (projectName: string, projectId?: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

const WorkspaceProjectSelect: React.FC<WorkspaceProjectSelectProps> = ({ 
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
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-gray-900">
            Projectize Step One: Select Your Workspace and Project
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Picking your workspace and project will help get your Projectized notes in the right spot
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <WorkspaceSelect 
              apiKey={apiKey} 
              selectedWorkspaceId={selectedWorkspaceId}
              onWorkspaceSelect={onWorkspaceSelect}
            />
            
            {selectedWorkspaceId && (
              <ProjectSelect
                apiKey={apiKey}
                workspaceId={selectedWorkspaceId}
                selectedProject={selectedProject}
                onProjectSelect={onProjectSelect}
              />
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 pb-4 px-6">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-1"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={onContinue}
            disabled={!selectedWorkspaceId}
            className="bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-black transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkspaceProjectSelect;
