
import React from 'react';
import { LoaderIcon, RefreshCw, PlusCircleIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkspaceListProps {
  workspaces: {label: string, value: string}[];
  selectedWorkspaceId: string | null;
  onWorkspaceSelect: (workspaceId: string) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
  isLoading: boolean;
}

const WorkspaceList: React.FC<WorkspaceListProps> = ({
  workspaces,
  selectedWorkspaceId,
  onWorkspaceSelect,
  onRefresh,
  onCreateNew,
  isLoading
}) => {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select
          value={selectedWorkspaceId || undefined}
          onValueChange={onWorkspaceSelect}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            {isLoading ? (
              <div className="flex items-center">
                <LoaderIcon className="mr-2 h-3 w-3 animate-spin" />
                <span>Loading workspaces...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select a workspace" />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Workspaces</SelectLabel>
              {workspaces.map(workspace => (
                <SelectItem key={workspace.value} value={workspace.value}>
                  {workspace.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-1">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh Workspaces"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onCreateNew}
          title="Create New Workspace"
        >
          <PlusCircleIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceList;
