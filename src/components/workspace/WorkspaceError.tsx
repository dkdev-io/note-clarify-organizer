
import React from 'react';
import { AlertTriangleIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WorkspaceErrorProps {
  error: string | null;
  onOpenMotionSettings: () => void;
}

const WorkspaceError: React.FC<WorkspaceErrorProps> = ({ error, onOpenMotionSettings }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mt-2">
      <AlertTriangleIcon className="h-4 w-4" />
      <AlertDescription>
        {error}
        {error.includes("API key") && (
          <Button
            size="sm"
            variant="link"
            className="px-0 h-6 text-sm font-normal underline-offset-2 mt-1 flex items-center"
            onClick={onOpenMotionSettings}
          >
            <ExternalLinkIcon className="h-3 w-3 mr-1" />
            Check your API keys in Motion
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default WorkspaceError;
