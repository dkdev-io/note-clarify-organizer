
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoaderIcon } from "lucide-react";
import { createProject } from '@/utils/motion';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateProjectDialogProps {
  open: boolean;
  workspaceId: string;
  apiKey: string | null;
  onClose: () => void;
  onProjectCreated: (projectName: string, projectId: string) => void;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  workspaceId,
  apiKey,
  onClose,
  onProjectCreated
}) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateProject = async () => {
    if (!projectName.trim() || !workspaceId) return;
    
    setIsCreating(true);
    try {
      const result = await createProject(workspaceId, projectName, apiKey || undefined);
      
      if (result && result.id) {
        toast({
          title: "Project Created",
          description: `Project "${projectName}" has been created successfully.`,
        });
        
        onProjectCreated(result.name, result.id);
      } else {
        throw new Error('Failed to create project - no valid response from API');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      
      let errorMessage = "Failed to create project. Check API key permissions.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Failed to Create Project",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter the details for your new Motion project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="col-span-4">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="col-span-4"
              placeholder="Enter project name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="col-span-4">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-4"
              placeholder="Enter project description"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            disabled={!projectName.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
