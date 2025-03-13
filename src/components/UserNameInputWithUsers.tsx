
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
  // The UserNameInput component needs workspaceId, apiKey and onUserSelected props
  // Let's create a wrapper function to adapt the onChange to the expected format
  const handleUserSelected = (userId: string, userName: string) => {
    onChange(userName);
  };

  return (
    <UserNameInput
      workspaceId={users[0]?.workspaceId || ''}
      apiKey={undefined}
      onUserSelected={handleUserSelected}
    />
  );
};

export default UserNameInputWithUsers;
