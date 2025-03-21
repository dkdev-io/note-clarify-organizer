
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from 'lucide-react';
import { formatDate } from 'date-fns';

interface TaskDueDateBadgeProps {
  dueDate: string | null | undefined;
}

const TaskDueDateBadge: React.FC<TaskDueDateBadgeProps> = ({ dueDate }) => {
  if (!dueDate) return null;
  
  return (
    <Badge variant="outline" className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700">
      <CalendarIcon className="h-3 w-3" />
      {formatDate(new Date(dueDate), 'MMM d, yyyy')}
    </Badge>
  );
};

export default TaskDueDateBadge;
