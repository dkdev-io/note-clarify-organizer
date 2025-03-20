
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from 'lucide-react';

interface TasksEmptyProps {
  onBack: () => void;
}

const TasksEmpty: React.FC<TasksEmptyProps> = ({ onBack }) => {
  return (
    <div className="py-10 text-center">
      <p className="text-muted-foreground">No tasks could be extracted from your notes.</p>
      <Button variant="outline" onClick={onBack} className="mt-4">
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Notes
      </Button>
    </div>
  );
};

export default TasksEmpty;
