
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangleIcon } from 'lucide-react';

interface TaskHardDeadlineBadgeProps {
  hardDeadline: boolean;
}

const TaskHardDeadlineBadge: React.FC<TaskHardDeadlineBadgeProps> = ({ hardDeadline }) => {
  if (!hardDeadline) return null;
  
  return (
    <Badge variant="outline" className="flex items-center gap-1 border-red-200 bg-red-50 text-red-700">
      <AlertTriangleIcon className="h-3 w-3" />
      Hard Deadline
    </Badge>
  );
};

export default TaskHardDeadlineBadge;
