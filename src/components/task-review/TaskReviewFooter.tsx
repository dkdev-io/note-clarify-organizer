
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ArrowLeftIcon, LoaderIcon, ExternalLinkIcon, ArrowRightIcon } from 'lucide-react';

interface TaskReviewFooterProps {
  onBack: () => void;
  onAddToMotion?: () => void;
  onContinue?: () => void;
  isLoading: boolean;
  isProcessing: boolean;
  isTransitioning: boolean;
  editingTaskId: string | null;
  tasksLength: number;
}

const TaskReviewFooter: React.FC<TaskReviewFooterProps> = ({ 
  onBack, 
  onAddToMotion,
  onContinue, 
  isLoading, 
  isProcessing, 
  isTransitioning,
  editingTaskId,
  tasksLength
}) => {
  // Determine which action button to show based on provided props
  const renderActionButton = () => {
    if (onContinue) {
      return (
        <Button 
          onClick={onContinue}
          disabled={tasksLength === 0 || isLoading || isProcessing || isTransitioning || editingTaskId !== null}
          className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Continue to Preview
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    }
    
    if (onAddToMotion) {
      return (
        <Button 
          onClick={onAddToMotion}
          disabled={tasksLength === 0 || isLoading || isProcessing || isTransitioning || editingTaskId !== null}
          className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isProcessing ? (
            <>
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            <>
              Add to Motion
              <ExternalLinkIcon className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      );
    }
    
    return null;
  };

  return (
    <CardFooter className="flex justify-between py-4 mt-4">
      <Button 
        variant="outline" 
        onClick={onBack}
        disabled={isLoading || isProcessing || isTransitioning}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back
      </Button>
      {renderActionButton()}
    </CardFooter>
  );
};

export default TaskReviewFooter;
