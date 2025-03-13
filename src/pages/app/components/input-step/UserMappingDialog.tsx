
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserNameInputWithUsers from "@/components/UserNameInputWithUsers";
import { useToast } from "@/components/ui/use-toast";

interface UserMapping {
  id: string;
  noteRef: string;
  motionUser: string;
}

interface UserMappingDialogProps {
  userMappings: UserMapping[];
  users: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (mappings: UserMapping[]) => void;
}

const UserMappingDialog: React.FC<UserMappingDialogProps> = ({
  userMappings,
  users,
  open,
  onOpenChange,
  onSave,
}) => {
  const [mappings, setMappings] = useState<UserMapping[]>(userMappings);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleUpdateMapping = (id: string, motionUser: string) => {
    setMappings(
      mappings.map((mapping) =>
        mapping.id === id ? { ...mapping, motionUser } : mapping
      )
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate saving process
    setTimeout(() => {
      onSave(mappings);
      setIsSaving(false);
      onOpenChange(false);
      
      toast({
        title: "User mappings saved",
        description: "Your user mappings have been updated successfully.",
      });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Map Users</DialogTitle>
          <DialogDescription>
            Match names in your notes to Motion users for accurate task assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {mappings.map((mapping) => (
              <div key={mapping.id} className="flex items-center space-x-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{mapping.noteRef}</p>
                </div>
                <div className="flex-1">
                  <UserNameInputWithUsers
                    users={users}
                    value={mapping.motionUser}
                    onChange={(value) => handleUpdateMapping(mapping.id, value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="mr-2">Saving</span>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </>
            ) : (
              "Save Mappings"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserMappingDialog;
