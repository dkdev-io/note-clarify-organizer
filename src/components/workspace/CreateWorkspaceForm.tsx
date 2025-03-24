
import React from 'react';
import { LoaderIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CreateWorkspaceFormProps {
  newWorkspaceName: string;
  onNameChange: (name: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isCreating: boolean;
}

const CreateWorkspaceForm: React.FC<CreateWorkspaceFormProps> = ({
  newWorkspaceName,
  onNameChange,
  onCancel,
  onSubmit,
  isCreating
}) => {
  return (
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
            onChange={e => onNameChange(e.target.value)}
            placeholder="Enter workspace name"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 py-3">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onCancel}
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button 
          size="sm"
          onClick={onSubmit}
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
  );
};

export default CreateWorkspaceForm;
