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
  return <div className="flex gap-1 self-end mt-8">
      
      
    </div>;
};
export default ProjectActions;