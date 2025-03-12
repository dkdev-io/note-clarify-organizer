
import React from 'react';
import NoteInput from '@/components/NoteInput';
import { ApiProps } from '../types';

interface InputStepProps {
  onParseTasks: (text: string, providedProjectName: string | null) => void;
  apiProps: ApiProps;
}

const InputStep: React.FC<InputStepProps> = ({
  onParseTasks,
  apiProps
}) => {
  return (
    <NoteInput 
      onParseTasks={onParseTasks} 
      apiProps={apiProps}
    />
  );
};

export default InputStep;
