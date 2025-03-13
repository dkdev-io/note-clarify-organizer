
import React from 'react';
import { CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from 'lucide-react';
import ProjectNameInput from './ProjectNameInput';

interface TaskReviewHeaderProps {
  tasksCount: number;
  projectName: string | null;
  onProjectNameChange: (name: string | null) => void;
}

const TaskReviewHeader: React.FC<TaskReviewHeaderProps> = ({ 
  tasksCount, 
  projectName, 
  onProjectNameChange 
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl font-medium text-gray-900">
          <CheckIcon className="inline-block mr-2 h-6 w-6 text-primary" />
          Review Tasks
        </CardTitle>
        <Badge variant="outline" className="font-normal">
          {tasksCount} Tasks
        </Badge>
      </div>
      <CardDescription>
        Review and edit tasks before adding them to Motion
      </CardDescription>
      <ProjectNameInput 
        projectName={projectName} 
        onChange={onProjectNameChange} 
      />
    </CardHeader>
  );
};

export default TaskReviewHeader;
