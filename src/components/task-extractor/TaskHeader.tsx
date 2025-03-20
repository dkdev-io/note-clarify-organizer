
import React from 'react';
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListTodoIcon } from 'lucide-react';

interface TaskHeaderProps {
  projectName: string | null;
  selectedTasksCount: number;
  totalTasksCount: number;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ 
  projectName, 
  selectedTasksCount, 
  totalTasksCount 
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl font-medium text-gray-900">
          <ListTodoIcon className="inline-block mr-2 h-6 w-6 text-primary" />
          Extracted Tasks
        </CardTitle>
        <Badge variant="outline" className="font-normal gap-1.5">
          {selectedTasksCount} of {totalTasksCount} selected
        </Badge>
      </div>
      <CardDescription>
        Select the items you want to convert into tasks
        {projectName && (
          <div className="mt-2">
            <Badge className="bg-purple-50 text-purple-700 border-purple-200">
              Project: {projectName}
            </Badge>
          </div>
        )}
      </CardDescription>
    </>
  );
};

export default TaskHeader;
