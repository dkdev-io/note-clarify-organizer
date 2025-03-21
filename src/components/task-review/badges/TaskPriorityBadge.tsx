
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface TaskPriorityBadgeProps {
  priority: string | null | undefined;
}

const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority }) => {
  if (!priority) return null;
  
  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-green-100 text-green-800 border-green-200',
    normal: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  const priorityColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors.normal;
  
  return (
    <Badge variant="outline" className={`${priorityColor} capitalize`}>
      {priority}
    </Badge>
  );
};

export default TaskPriorityBadge;
