
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle, User } from 'lucide-react';
import { useUserVerification } from '@/hooks/use-user-verification';
import UserVerifier from './UserVerifier';

interface UserNameInputProps {
  workspaceId: string;
  apiKey?: string;
  onUserSelected: (userId: string, userName: string) => void;
}

const UserNameInput: React.FC<UserNameInputProps> = ({
  workspaceId,
  apiKey,
  onUserSelected
}) => {
  const [name, setName] = useState('');
  const [nameStatus, setNameStatus] = useState<'idle' | 'checking' | 'invalid' | 'valid'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    isVerifying,
    verifyName,
    cancelVerification,
    completeVerification,
    checkNameMatch
  } = useUserVerification({ workspaceId, apiKey });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameStatus('idle');
    setErrorMessage(null);
  };

  const handleCheck = async () => {
    if (!name.trim()) {
      setNameStatus('invalid');
      setErrorMessage('Please enter a name');
      return;
    }

    setNameStatus('checking');
    try {
      const matches = await checkNameMatch(name);
      
      if (matches) {
        // If there's exactly one match with high confidence, auto-select it
        if (matches.length === 1) {
          setNameStatus('valid');
          onUserSelected(matches[0].id, matches[0].name);
        } else {
          // Open verifier UI for multiple matches
          verifyName(name);
        }
      } else {
        setNameStatus('invalid');
        setErrorMessage("We can't match that user. Please confirm that they're a Motion user or add them to your account?");
        // Open the verifier anyway to let the user see all options
        verifyName(name);
      }
    } catch (error) {
      setNameStatus('invalid');
      setErrorMessage('Error checking name. Please try again.');
      console.error('Error checking name:', error);
    }
  };

  const handleVerifiedUser = (userId: string, userName: string) => {
    const result = completeVerification(userId, userName);
    setNameStatus('valid');
    setName(userName); // Update input with the verified name
    onUserSelected(result.userId, result.userName);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Assign to</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="username"
              placeholder="Enter user name"
              value={name}
              onChange={handleNameChange}
              className={nameStatus === 'valid' ? 'pr-10 border-green-500' : ''}
            />
            {nameStatus === 'valid' && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Check className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
          <Button 
            onClick={handleCheck} 
            disabled={nameStatus === 'checking' || !name.trim()}
          >
            <User className="mr-2 h-4 w-4" />
            Verify
          </Button>
        </div>
      </div>
      
      {nameStatus === 'invalid' && errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {isVerifying && (
        <div className="mt-4">
          <UserVerifier
            name={name}
            workspaceId={workspaceId}
            apiKey={apiKey}
            onVerified={handleVerifiedUser}
            onCancel={cancelVerification}
          />
        </div>
      )}
    </div>
  );
};

export default UserNameInput;
