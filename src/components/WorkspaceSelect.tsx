
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoaderIcon, PlusCircleIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getWorkspacesForDropdown, createProject } from '@/utils/motion';

interface WorkspaceSelectProps {
  apiKey: string | null;
  selectedWorkspaceId: string | null;
  onWorkspaceSelect: (workspaceId: string) => void;
}

const WorkspaceSelect: React.FC<WorkspaceSelectProps> = ({ 
  apiKey, 
  selectedWorkspaceId, 
  onWorkspaceSelect 
}) => {
  const [workspaces, setWorkspaces] = useState<{label: string, value: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewWorkspaceForm, setShowNewWorkspaceForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (apiKey) {
      loadWorkspaces();
    }
  }, [apiKey]);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const workspaceOptions = await getWorkspacesForDropdown();
      setWorkspaces(workspaceOptions);
      
      // If we have workspaces and none is selected, select the first one
      if (workspaceOptions.length > 0 && !selectedWorkspaceId) {
        onWorkspaceSelect(workspaceOptions[0].value);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // In a real app, this would be implemented to create workspaces in Motion
  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    setIsCreating(true);
    try {
      // This is a placeholder for actual API implementation
      // In this mock implementation, we'll just add to our local state
      const newWorkspaceId = `workspace-${Math.random().toString(36).substring(2, 8)}`;
      
      const newWorkspace = {
        label: newWorkspaceName,
        value: newWorkspaceId
      };
      
      setWorkspaces([...workspaces, newWorkspace]);
      onWorkspaceSelect(newWorkspaceId);
      setShowNewWorkspaceForm(false);
      setNewWorkspaceName('');
    } catch (error) {
      console.error('Failed to create workspace:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Please connect to Motion API first to view workspaces.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showNewWorkspaceForm ? (
        <div className="space-y-2">
          <Label htmlFor="workspace">Select Workspace</Label>
          <div className="flex gap-2">
            <Select
              value={selectedWorkspaceId || undefined}
              onValueChange={onWorkspaceSelect}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a workspace" />
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
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowNewWorkspaceForm(true)}
              title="Create New Workspace"
            >
              <PlusCircleIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border border-dashed">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Create New Workspace</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="space-y-2">
              <Label htmlFor="newWorkspaceName">Workspace Name</Label>
              <Input
                id="newWorkspaceName"
                value={newWorkspaceName}
                onChange={e => setNewWorkspaceName(e.target.value)}
                placeholder="Enter workspace name"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 py-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setShowNewWorkspaceForm(false);
                setNewWorkspaceName('');
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <LoaderIcon className="mr-2 h-3 w-3 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default WorkspaceSelect;
