
import React, { useState, useEffect } from 'react';
import { PlusCircleIcon } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getWorkspacesForDropdown } from '@/utils/motion';
import { 
  WorkspaceList, 
  CreateWorkspaceForm, 
  WorkspaceError,
  EmptyWorkspaceMessage
} from '@/components/workspace';

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
  const [lastApiKey, setLastApiKey] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Only fetch if API key changed and is valid
    if (apiKey && apiKey.trim() && apiKey !== lastApiKey) {
      setLastApiKey(apiKey);
      loadWorkspaces();
    } else if (!apiKey || !apiKey.trim()) {
      setWorkspaces([]);
      setError(null);
      setLastApiKey(null);
    }
  }, [apiKey, lastApiKey]);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!apiKey) {
        console.error('No API key provided to WorkspaceSelect');
        setError("No API key provided. Please enter a valid Motion API key.");
        setIsLoading(false);
        return;
      }
      
      // Fetch workspaces from real API
      const workspaceOptions = await getWorkspacesForDropdown(apiKey);
      
      console.log('Loaded workspaces:', workspaceOptions);
      
      if (workspaceOptions.length === 0) {
        setError("No workspaces found. Make sure your API key has the correct permissions.");
        toast({
          title: "No workspaces found",
          description: "Couldn't find any workspaces. Make sure your key has the correct permissions.",
          variant: "destructive",
        });
      }
      
      setWorkspaces(workspaceOptions);
      
      // If we have workspaces and none is selected, select the first one
      if (workspaceOptions.length > 0 && !selectedWorkspaceId) {
        onWorkspaceSelect(workspaceOptions[0].value);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      
      let errorMessage = "Failed to load workspaces. Please check your API key and try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error loading workspaces",
        description: errorMessage,
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

  const handleOpenMotionSettings = () => {
    window.open('https://app.usemotion.com/settings/developers/api-keys', '_blank');
  };

  const isDisabled = !apiKey || !apiKey.trim();

  return (
    <div className="space-y-4">
      {!showNewWorkspaceForm ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="workspace">Select Workspace</Label>
            {isDisabled && <span className="text-sm text-muted-foreground">Enter API key first</span>}
          </div>
          
          <WorkspaceList
            workspaces={workspaces}
            selectedWorkspaceId={selectedWorkspaceId}
            onWorkspaceSelect={isDisabled ? () => {} : onWorkspaceSelect}
            onRefresh={isDisabled ? () => {} : loadWorkspaces}
            onCreateNew={isDisabled ? () => {} : () => setShowNewWorkspaceForm(true)}
            isLoading={isLoading && !isDisabled}
          />
          
          <WorkspaceError 
            error={error} 
            onOpenMotionSettings={handleOpenMotionSettings} 
          />
          
          <EmptyWorkspaceMessage 
            isLoading={isLoading} 
            error={error} 
            workspaces={workspaces} 
          />
        </div>
      ) : (
        <CreateWorkspaceForm
          newWorkspaceName={newWorkspaceName}
          onNameChange={setNewWorkspaceName}
          onCancel={() => {
            setShowNewWorkspaceForm(false);
            setNewWorkspaceName('');
          }}
          onSubmit={handleCreateWorkspace}
          isCreating={isCreating}
        />
      )}
    </div>
  );
};

export default WorkspaceSelect;
