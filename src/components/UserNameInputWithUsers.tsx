
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
  return (
    <UserNameInput
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

export default UserNameInputWithUsers;
