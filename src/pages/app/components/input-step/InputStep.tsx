
import React, { useState } from 'react';
import NoteInput from '@/components/NoteInput';
import { ApiProps } from '../../types';
import { useAppContext } from '../../context/AppContextProvider';
import MotionAlert from './MotionAlert';
import UserMappingDialog from './UserMappingDialog';
import ProTips from './ProTips';

interface InputStepProps {
  onParseTasks: (
    text: string, 
    providedProjectName: string | null, 
    unrecognizedUserMappingsOrCallback?: Record<string, string | null> | ((names: string[]) => void)
  ) => void;
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
  const [isProcessingNames, setIsProcessingNames] = useState(false);
  
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
      if (names.length > 0) {
        setIsProcessingNames(true);
        setUnrecognizedNames(names);
        
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
    
    // Check for unrecognized names - we're only checking, not processing yet
    // Pass the callback function directly
    onParseTasks(text, providedProjectName, tempSetUnrecognizedNames);
  };
  
  const handleConfirmUserMapping = () => {
    setShowUserDialog(false);
    setIsProcessingNames(false);
    
    // Now actually process with the user mappings
    onParseTasks(pendingText, pendingProjectName, userMappings);
  };
  
  // Allow dialog to be closed manually with the X button or by clicking the backdrop
  // but only when we're not in the middle of processing
  const handleOpenChange = (open: boolean) => {
    if (!open && !isProcessingNames) {
      setShowUserDialog(false);
    }
  };
  
  // Fixed handler for the close button
  const handleCloseDialog = () => {
    if (!isProcessingNames) {
      setShowUserDialog(false);
    }
  };
  
  return (
    <div className="w-full space-y-4">
      {showMotionAlert && <MotionAlert handleReconnect={handleReconnect} />}
      
      <NoteInput 
        onParseTasks={handleNoteSubmit} 
        apiProps={apiProps}
      />
      
      <ProTips />
      
      <UserMappingDialog
        showUserDialog={showUserDialog}
        unrecognizedNames={unrecognizedNames}
        userMappings={userMappings}
        setUserMappings={setUserMappings}
        handleOpenChange={handleOpenChange}
        handleCloseDialog={handleCloseDialog}
        handleConfirmUserMapping={handleConfirmUserMapping}
        isProcessingNames={isProcessingNames}
        apiProps={apiProps}
      />
    </div>
  );
};

export default InputStep;
