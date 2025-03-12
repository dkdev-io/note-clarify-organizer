
import React from 'react';
import NoteInput from '@/components/NoteInput';
import { ApiProps } from '../types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '../context/AppContextProvider';

interface InputStepProps {
  onParseTasks: (text: string, providedProjectName: string | null) => void;
  apiProps: ApiProps;
}

const InputStep: React.FC<InputStepProps> = ({
  onParseTasks,
  apiProps
}) => {
  const { handleReconnect } = useAppContext();
  
  // Determine if we should show the Motion connection alert
  const showMotionAlert = apiProps.isConnected && 
    (!apiProps.users || apiProps.users.length === 0);
  
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
        onParseTasks={onParseTasks} 
        apiProps={apiProps}
      />
      
      <div className="text-sm text-gray-500 mt-2">
        <p>
          <strong>Pro tip:</strong> When assigning tasks to people (e.g., "Dan will..."), make sure their names match 
          exactly with your Motion users.
        </p>
      </div>
    </div>
  );
};

export default InputStep;
