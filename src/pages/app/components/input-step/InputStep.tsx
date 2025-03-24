
import React, { useState } from 'react';
import NoteInput from '@/components/note-input';
import { ApiProps } from '../../types';
import { useAppContext } from '../../context/AppContextProvider';
import MotionAlert from './MotionAlert';
import ProTips from './ProTips';

interface InputStepProps {
  onParseTasks: (
    text: string, 
    providedProjectName: string | null
  ) => void;
  apiProps: ApiProps;
}

const InputStep: React.FC<InputStepProps> = ({
  onParseTasks,
  apiProps
}) => {
  const { handleReconnect } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Determine if we should show the Motion connection alert
  const showMotionAlert = apiProps.isConnected && 
    (!apiProps.users || apiProps.users.length === 0);
  
  const handleNoteSubmit = (text: string, providedProjectName: string | null) => {
    // Process directly without user mapping step
    onParseTasks(text, providedProjectName);
  };
  
  return (
    <div className="w-full space-y-4">
      {showMotionAlert && <MotionAlert handleReconnect={handleReconnect} />}
      
      <NoteInput 
        onParseTasks={handleNoteSubmit} 
        apiProps={apiProps}
      />
      
      <ProTips />
    </div>
  );
};

export default InputStep;
