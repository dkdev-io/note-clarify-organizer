
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

// Define proper type for user mappings
interface UserMapping {
  name: string;
  mappedUserId: string | null;
}

interface UserMappingDialogProps {
  showUserDialog: boolean;
  unrecognizedNames: string[];
  userMappings: Record<string, string | null>;
  setUserMappings: (mappings: Record<string, string | null>) => void;
  handleOpenChange: (open: boolean) => void;
  handleCloseDialog: () => void;
  handleConfirmUserMapping: () => void;
  isProcessingNames: boolean;
  apiProps: any;
}

const UserMappingDialog: React.FC<UserMappingDialogProps> = ({
  showUserDialog,
  unrecognizedNames,
  userMappings,
  setUserMappings,
  handleOpenChange,
  handleCloseDialog,
  handleConfirmUserMapping,
  isProcessingNames,
  apiProps
}) => {
  const { toast } = useToast();

  const handleUpdateMapping = (name: string, userId: string | null) => {
    console.log(`Updating mapping for ${name} to userId: ${userId}`);
    setUserMappings({
      ...userMappings,
      [name]: userId
    });
  };

  return (
    <Dialog open={showUserDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Map Users</DialogTitle>
          <DialogDescription>
            Match names in your notes to Motion users for accurate task assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {unrecognizedNames.map((name) => (
              <div key={name} className="flex items-center space-x-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{name}</p>
                </div>
                <div className="flex-1">
                  <UserNameInputWithUsers
                    users={apiProps.users || []}
                    value={userMappings[name] || ''}
                    onChange={(value) => handleUpdateMapping(name, value)}
                    disabled={isProcessingNames}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCloseDialog} type="button">
            Cancel
          </Button>
          <Button onClick={handleConfirmUserMapping} disabled={isProcessingNames}>
            {isProcessingNames ? (
              <>
                <span className="mr-2">Processing</span>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </>
            ) : (
              "Confirm Mappings"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserMappingDialog;
