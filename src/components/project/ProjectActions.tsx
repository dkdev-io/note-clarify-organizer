
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, PlusCircleIcon } from "lucide-react";

interface ProjectActionsProps {
  onRefresh: () => void;
  onCreateNew: () => void;
  isLoading: boolean;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({
  onRefresh,
  onCreateNew,
  isLoading
}) => {
  return (
    <div className="flex gap-1 self-end mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={isLoading}
        title="Refresh Projects"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onCreateNew}
        title="Create New Project"
      >
        <PlusCircleIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProjectActions;
