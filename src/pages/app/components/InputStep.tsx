
import React, { useState } from 'react';
import NoteInput from '@/components/NoteInput';
import { ApiProps } from '../types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '../context/AppContextProvider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface InputStepProps {
  onParseTasks: (text: string, providedProjectName: string | null, unrecognizedUserMappings?: Record<string, string | null>) => void;
  apiProps: ApiProps;
}

const InputStep: React.FC<InputStepProps> = ({
  onParseTasks,
  apiProps
}) => {
  const { handleReconnect } = useAppContext();
  const [unrecognizedNames, setUnrecognizedNames] = useState<string[]>([]);
  const [userMappings, setUserMappings] = useState<Record<string, string | null>>({});
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [pendingText, setPendingText] = useState('');
  const [pendingProjectName, setPendingProjectName] = useState<string | null>(null);
  
  // Determine if we should show the Motion connection alert
  const showMotionAlert = apiProps.isConnected && 
    (!apiProps.users || apiProps.users.length === 0);
  
  const handleNoteSubmit = (text: string, providedProjectName: string | null) => {
    // Store the text and project name for later use
    setPendingText(text);
    setPendingProjectName(providedProjectName);
    
    // Reset unrecognized names
    setUnrecognizedNames([]);
    
    // We'll handle unrecognized users differently now
    const tempSetUnrecognizedNames = (names: string[]) => {
      setUnrecognizedNames(names);
      if (names.length > 0) {
        // Initialize user mappings with null (unassigned)
        const initialMappings: Record<string, string | null> = {};
        names.forEach(name => {
          initialMappings[name] = null;
        });
        setUserMappings(initialMappings);
        setShowUserDialog(true);
      } else {
        // No unrecognized names, proceed directly
        onParseTasks(text, providedProjectName);
      }
    };
    
    // If not connected to Motion, skip the name checking
    if (!apiProps.isConnected || !apiProps.users || apiProps.users.length === 0) {
      onParseTasks(text, providedProjectName);
      return;
    }
    
    // Check for unrecognized names
    tempSetUnrecognizedNames([]);
    onParseTasks(text, providedProjectName, tempSetUnrecognizedNames);
  };
  
  const handleConfirmUserMapping = () => {
    setShowUserDialog(false);
    onParseTasks(pendingText, pendingProjectName, userMappings);
  };
  
  return (
    <div className="w-full space-y-4">
      {showMotionAlert && (
        <Alert variant="destructive" className="mb-4 bg-amber-50 border-amber-300">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">User Information Missing</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">
              We couldn't load your Motion users list. This may limit task assignee verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <Button 
                variant="outline" 
                size="sm"
                className="border-amber-400 text-amber-700 hover:bg-amber-100 flex items-center"
                onClick={handleReconnect}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reconnect to Motion
              </Button>
              <p className="text-xs pt-1 sm:pt-0">
                Or continue anyway - assignee names won't be verified against your Motion account.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <NoteInput 
        onParseTasks={handleNoteSubmit} 
        apiProps={apiProps}
      />
      
      <div className="text-sm text-gray-500 mt-2">
        <p>
          <strong>Pro tip:</strong> When assigning tasks to people (e.g., "Dan will..."), make sure their names match 
          exactly with your Motion users.
        </p>
      </div>
      
      {/* Dialog for unrecognized users */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unrecognized Users</DialogTitle>
            <DialogDescription>
              We found some names in your notes that don't match your Motion users.
              Please select the correct user for each name or choose "No Assignment" to create unassigned tasks.
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InputStep;
