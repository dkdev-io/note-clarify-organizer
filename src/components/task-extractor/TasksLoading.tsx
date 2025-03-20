
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const TasksLoading: React.FC = () => {
  return (
    <div className="space-y-4 py-2">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TasksLoading;
