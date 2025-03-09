
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
import { useToast } from "@/components/ui/use-toast";

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (apiKey) {
      loadWorkspaces();
    }
  }, [apiKey]);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Store the API key in localStorage for other functions to use
      window.localStorage.setItem('motion_api_key', apiKey || '');
      
      const workspaceOptions = await getWorkspacesForDropdown();
      console.log('Loaded workspaces:', workspaceOptions);
      
      if (workspaceOptions.length === 0) {
        setError("No workspaces found in your Motion account or there was an issue fetching them.");
      }
      
      setWorkspaces(workspaceOptions);
      
      // If we have workspaces and none is selected, select the first one
      if (workspaceOptions.length > 0 && !selectedWorkspaceId) {
        onWorkspaceSelect(workspaceOptions[0].value);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      setError("Failed to load workspaces. Please check your API key and try again.");
      toast({
        title: "Error loading workspaces",
        description: "Could not load workspaces from Motion. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      
      toast({
        title: "Workspace created",
        description: `Workspace "${newWorkspaceName}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Failed to create workspace:', error);
      toast({
        title: "Error creating workspace",
        description: "Failed to create workspace. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!apiKey) {
    return null;
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
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowNewWorkspaceForm(true)}
              title="Create New Workspace"
            >
              <PlusCircleIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
          
          {workspaces.length === 0 && !isLoading && !error && (
            <p className="text-sm text-amber-600 mt-1">
              No workspaces found. You can create a new one or check your API key.
            </p>
          )}
          
          <div className="flex justify-end mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadWorkspaces}
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? (
                <>
                  <LoaderIcon className="mr-1 h-3 w-3 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Refresh Workspaces"
              )}
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
