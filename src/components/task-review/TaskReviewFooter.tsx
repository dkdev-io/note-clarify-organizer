
import React from 'react';
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

interface TaskReviewFooterProps {
  onBack: () => void;
  onContinue: () => void;
  isTransitioning?: boolean;
  editingTaskId?: string | null;
  tasksCount: number;
}

const TaskReviewFooter: React.FC<TaskReviewFooterProps> = ({
  onBack,
  onContinue,
  isTransitioning = false,
  editingTaskId = null,
  tasksCount
}) => {
  return (
    <CardFooter className="flex justify-between py-4">
      <Button 
        variant="outline" 
        onClick={onBack}
        disabled={isTransitioning || editingTaskId !== null}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <Button 
        onClick={onContinue}
        disabled={tasksCount === 0 || isTransitioning || editingTaskId !== null}
      >
        Continue to Motion
        <ArrowRightIcon className="ml-2 h-4 w-4" />
      </Button>
    </CardFooter>
  );
};

export default TaskReviewFooter;
