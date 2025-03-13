
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, User } from 'lucide-react';
import { ApiProps } from '../../types';

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
  return (
    <Dialog open={showUserDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
        if (isProcessingNames) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>Unrecognized Users</DialogTitle>
          <DialogDescription>
            We found some names in your notes that don't match your Motion users.
            Please select the correct user for each name or choose "No Assignment" to create unassigned tasks.
            <p className="mt-2 text-amber-600">If you select no user, their tasks will appear in your project as unassigned.</p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {unrecognizedNames.map((name) => (
            <div key={name} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`user-${name}`} className="text-right">
                {name}:
              </Label>
              <div className="col-span-3">
                <Select
                  value={userMappings[name] || ""}
                  onValueChange={(value) => setUserMappings(prev => ({
                    ...prev, 
                    [name]: value === "none" ? null : value
                  }))}
                >
                  <SelectTrigger id={`user-${name}`}>
                    <SelectValue placeholder="Select user or none" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="flex items-center">
                        <User className="mr-2 h-4 w-4 opacity-50" />
                        No Assignment
                      </span>
                    </SelectItem>
                    {apiProps.users?.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button type="submit" onClick={handleConfirmUserMapping}>
            Continue with Selected Users
          </Button>
        </DialogFooter>
        
        <Button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={handleCloseDialog}
          disabled={isProcessingNames}
          variant="ghost"
          size="icon"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UserMappingDialog;
