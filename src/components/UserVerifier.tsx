
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, UserCheck, UserX, InfoIcon, User } from 'lucide-react';
import { findPotentialMatches } from '@/utils/name-matching';
import { fetchUsers } from '@/utils/motion';

interface UserVerifierProps {
  name: string;
  workspaceId: string;
  apiKey?: string;
  onVerified: (userId: string, name: string) => void;
  onCancel: () => void;
}

interface MotionUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
}

const UserVerifier: React.FC<UserVerifierProps> = ({
  name,
  workspaceId,
  apiKey,
  onVerified,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<MotionUser[]>([]);
  const [matches, setMatches] = useState<MotionUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch users when component mounts
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedUsers = await fetchUsers(workspaceId, apiKey);
        setUsers(fetchedUsers);
        
        // Find potential matches
        const potentialMatches = findPotentialMatches(name, fetchedUsers);
        setMatches(potentialMatches);
        
        // Pre-select first match if available
        if (potentialMatches.length > 0) {
          setSelectedUserId(potentialMatches[0].id);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users from Motion');
        toast({
          title: "Error",
          description: "Failed to fetch users from Motion.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsers();
  }, [name, workspaceId, apiKey, toast]);

  const handleConfirm = () => {
    if (!selectedUserId) {
      toast({
        title: "No user selected",
        description: "Please select a matching user or cancel.",
        variant: "destructive"
      });
      return;
    }
    
    const selectedUser = users.find(user => user.id === selectedUserId);
    if (selectedUser) {
      onVerified(selectedUser.id, selectedUser.name);
      toast({
        title: "User verified",
        description: `Assigned to ${selectedUser.name}`,
      });
    }
  };

  const handleCancel = () => {
    onCancel();
    toast({
      title: "Verification cancelled",
      description: "User verification was cancelled."
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" />
          Verify Motion User
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : matches.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                We found potential matches for <span className="font-medium">{name}</span>. 
                Please select the correct user:
              </p>
            </div>
            
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <RadioGroup value={selectedUserId} onValueChange={setSelectedUserId}>
                {matches.map(user => (
                  <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md">
                    <RadioGroupItem id={user.id} value={user.id} />
                    <Label htmlFor={user.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{user.name}</div>
                      {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </ScrollArea>
          </>
        ) : (
          <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
            <UserX className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              We can't match "{name}" to any Motion users in your workspace. 
              Please confirm that they're a Motion user or add them to your account.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        {matches.length > 0 && (
          <Button onClick={handleConfirm} disabled={!selectedUserId}>
            <UserCheck className="mr-2 h-4 w-4" />
            Confirm User
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserVerifier;
