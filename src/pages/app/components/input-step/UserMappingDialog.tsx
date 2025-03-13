
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X as XIcon, AlertCircle } from 'lucide-react';
import { ApiProps } from '../../types';
import UserNameInput from '@/components/UserNameInput';

interface UserMappingDialogProps {
  showUserDialog: boolean;
  unrecognizedNames: string[];
  userMappings: Record<string, string | null>;
  setUserMappings: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  handleOpenChange: (open: boolean) => void;
  handleCloseDialog: () => void;
  handleConfirmUserMapping: () => void;
  isProcessingNames: boolean;
  apiProps: ApiProps;
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
  const handleNameMapping = (originalName: string, motionUserName: string | null) => {
    setUserMappings(prev => ({
      ...prev,
      [originalName]: motionUserName
    }));
  };
  
  return (
    <Dialog open={showUserDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Assign Users</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-8 p-0" 
              onClick={handleCloseDialog}
              disabled={isProcessingNames}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogDescription>
            Map these names to Motion users or leave them unassigned
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
          {unrecognizedNames.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <AlertCircle className="mr-2 h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No unrecognized names found</p>
            </div>
          ) : (
            unrecognizedNames.map(name => (
              <div key={name} className="space-y-1.5">
                <p className="text-sm font-medium">"{name}" maps to:</p>
                <UserNameInput
                  users={apiProps.users || []}
                  value={userMappings[name]}
                  onChange={(value) => handleNameMapping(name, value)}
                  disabled={isProcessingNames}
                />
              </div>
            ))
          )}
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseDialog}
            disabled={isProcessingNames}
          >
            Skip Mapping
          </Button>
          <Button
            type="button"
            onClick={handleConfirmUserMapping}
            disabled={isProcessingNames}
          >
            {isProcessingNames ? 'Processing...' : 'Confirm Mapping'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserMappingDialog;
