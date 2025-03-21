
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { User2Icon } from 'lucide-react';

interface TaskAssigneeBadgeProps {
  assignee: string | null | undefined;
}

const TaskAssigneeBadge: React.FC<TaskAssigneeBadgeProps> = ({ assignee }) => {
  if (assignee !== null && assignee !== undefined && assignee !== '') {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <User2Icon className="h-3 w-3" />
        {assignee}
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="flex items-center gap-1 border-gray-200 text-gray-500">
      <User2Icon className="h-3 w-3" />
      Not Assigned
    </Badge>
  );
};

export default TaskAssigneeBadge;
