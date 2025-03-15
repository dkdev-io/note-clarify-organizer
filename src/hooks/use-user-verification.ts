import { useState, useCallback } from 'react';
import { fetchUsers } from '@/utils/motion';
import { findPotentialMatches } from '@/utils/name-matching';

interface UseUserVerificationProps {
  workspaceId: string;
  apiKey?: string;
}

interface User {
  id: string;
  name: string;
  email?: string;
}

export function useUserVerification({ workspaceId, apiKey }: UseUserVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const loadUsers = useCallback(async () => {
    if (hasLoaded || !workspaceId) return;
    
    try {
      const fetchedUsers = await fetchUsers(workspaceId, apiKey);
      setUsers(fetchedUsers);
      setHasLoaded(true);
      return fetchedUsers;
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }, [workspaceId, apiKey, hasLoaded]);
  
  const checkNameMatch = useCallback(async (name: string, threshold = 0.8) => {
    let currentUsers = users;
    
    if (!hasLoaded) {
      currentUsers = await loadUsers() || [];
    }
    
    const matches = findPotentialMatches(name, currentUsers, threshold);
    return matches.length > 0 ? matches : null;
  }, [users, hasLoaded, loadUsers]);
  
  const verifyName = useCallback((name: string) => {
    setCurrentName(name);
    setIsVerifying(true);
    return loadUsers();
  }, [loadUsers]);
  
  const cancelVerification = useCallback(() => {
    setIsVerifying(false);
    setCurrentName(null);
  }, []);
  
  const completeVerification = useCallback((userId: string, userName: string) => {
    setIsVerifying(false);
    setCurrentName(null);
    return { userId, userName };
  }, []);
  
  return {
    isVerifying,
    currentName,
    users,
    loadUsers,
    checkNameMatch,
    verifyName,
    cancelVerification,
    completeVerification
  };
}
