
import React, { ReactNode } from 'react';
import { Label } from "@/components/ui/label";

interface TaskFormFieldProps {
  id: string;
  label: string | ReactNode;
  children: ReactNode;
  className?: string;
}

const TaskFormField: React.FC<TaskFormFieldProps> = ({ 
  id, 
  label, 
  children,
  className = ""
}) => {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-sm font-medium mb-1 block">
        {label}
      </Label>
      {children}
    </div>
  );
};

export default TaskFormField;
