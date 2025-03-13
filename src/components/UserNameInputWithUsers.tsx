
import React from 'react';
import UserNameInput from './UserNameInput';

interface UserNameInputWithUsersProps {
  users: any[];
  value: string;
  onChange: (value: any) => void;
  disabled: boolean;
}

const UserNameInputWithUsers: React.FC<UserNameInputWithUsersProps> = ({ 
  users, 
  value, 
  onChange, 
  disabled 
}) => {
  // Extract the workspaceId from the first user (all users should have the same workspaceId)
  const workspaceId = users.length > 0 ? users[0]?.workspaceId : '';
  
  // The UserNameInput component needs workspaceId, apiKey and onUserSelected props
  // Let's create a wrapper function to adapt the onChange to the expected format
  const handleUserSelected = (userId: string, userName: string) => {
    onChange(userId); // Pass the userId, not userName to parent component
  };

  return (
    <UserNameInput
      workspaceId={workspaceId}
      apiKey={undefined} // This will be handled internally by the component
      value={value}
      disabled={disabled}
      onUserSelected={handleUserSelected}
    />
  );
};

export default UserNameInputWithUsers;
