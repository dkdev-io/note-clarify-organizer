
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";

interface ProjectMessagesProps {
  error: string | null;
  isLoading: boolean;
  projectsCount: number;
}

const ProjectMessages: React.FC<ProjectMessagesProps> = ({
  error,
  isLoading,
  projectsCount
}) => {
  return (
    <>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {projectsCount === 0 && !isLoading && !error && (
        <p className="text-sm text-amber-600 mt-1">
          No projects found in this workspace. You can create a new one.
        </p>
      )}
    </>
  );
};

export default ProjectMessages;
