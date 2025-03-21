
import React, { ReactNode } from 'react';

interface TaskFormSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const TaskFormSection: React.FC<TaskFormSectionProps> = ({ 
  title,
  children,
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default TaskFormSection;
