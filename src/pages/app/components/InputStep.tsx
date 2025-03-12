
import React from 'react';
import NoteInput from '@/components/NoteInput';
import { ApiProps } from '../types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface InputStepProps {
  onParseTasks: (text: string, providedProjectName: string | null) => void;
  apiProps: ApiProps;
}

const InputStep: React.FC<InputStepProps> = ({
  onParseTasks,
  apiProps
}) => {
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
            We couldn't load your Motion users list. Task assignee verification is limited.
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
