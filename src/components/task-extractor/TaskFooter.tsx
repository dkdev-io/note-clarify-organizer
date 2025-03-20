
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon, LoaderIcon } from 'lucide-react';

interface TaskFooterProps {
  selectedTasksCount: number;
  isLoading: boolean;
  isTransitioning: boolean;
  onBack: () => void;
  onContinue: () => void;
}

const TaskFooter: React.FC<TaskFooterProps> = ({ 
  selectedTasksCount,
  isLoading,
  isTransitioning,
  onBack,
  onContinue
}) => {
  return (
    <div className="flex justify-between py-4 mt-4">
      <Button 
        variant="outline" 
        onClick={onBack}
        disabled={isLoading || isTransitioning}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button 
        onClick={onContinue}
        disabled={selectedTasksCount === 0 || isLoading || isTransitioning}
        className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          <>
            Review Tasks
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default TaskFooter;
