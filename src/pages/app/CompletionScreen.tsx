
import React, { useState } from 'react';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task } from '@/utils/parser';

interface CompletionScreenProps {
  tasks: Task[];
  projectName: string | null;
  isConnected: boolean;
  onStartOver: () => void;
  onReconnect: () => void;
  onAddMore?: () => void;
  unassignedCount?: number;
  onTimeEstimateUpdate?: (timeEstimate: string) => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  tasks,
  projectName,
  isConnected,
  onStartOver,
  onReconnect,
  onAddMore,
  unassignedCount = 0,
  onTimeEstimateUpdate
}) => {
  const [timeEstimate, setTimeEstimate] = useState<string>('');

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeEstimate(value);
    if (onTimeEstimateUpdate) {
      onTimeEstimateUpdate(value);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center animate-fade-in">
      <div className="bg-green-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
        <CheckIcon className="h-10 w-10 text-green-500" />
      </div>
      <h2 className="text-2xl font-medium text-gray-900 mb-2">All Done!</h2>
      <p className="text-muted-foreground mb-6">
        Your tasks have been successfully added to Motion
        {projectName && <span className="font-medium"> under project '{projectName}'</span>}.
      </p>
      <div className="flex justify-center gap-3 flex-wrap">
        <Badge 
          className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200"
        >
          {tasks.length} Tasks Added
        </Badge>
        {projectName && (
          <Badge 
            className="px-3 py-1 bg-purple-50 text-purple-700 border-purple-200"
          >
            Project: {projectName}
          </Badge>
        )}
        {unassignedCount > 0 && (
          <Badge 
            className="px-3 py-1 bg-gray-50 text-gray-700 border-gray-200"
          >
            {unassignedCount} Unassigned
          </Badge>
        )}
      </div>
      
      {isConnected && (
        <div className="mt-6 mb-6">
          <label htmlFor="timeEstimate" className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Time (minutes)
          </label>
          <Input
            id="timeEstimate"
            type="number"
            min="0"
            placeholder="Enter time estimate"
            value={timeEstimate}
            onChange={handleTimeChange}
            className="max-w-xs mx-auto"
          />
        </div>
      )}
      
      <div className="mt-8 flex justify-center gap-3">
        {isConnected && onAddMore && (
          <Button 
            onClick={onAddMore}
            variant="outline"
            className="bg-[#FEF7CD] hover:bg-[#FEF7CD]/90 text-black border-yellow-300 font-bold flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add More?
          </Button>
        )}
        
        {!isConnected && (
          <Button 
            onClick={onReconnect}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Connect to Motion API
          </Button>
        )}
      </div>
    </div>
  );
};

export default CompletionScreen;
