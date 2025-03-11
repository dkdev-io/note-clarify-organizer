
import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/utils/parser';

interface CompletionScreenProps {
  tasks: Task[];
  projectName: string | null;
  isConnected: boolean;
  onStartOver: () => void;
  onReconnect: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  tasks,
  projectName,
  isConnected,
  onStartOver,
  onReconnect
}) => {
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
      <div className="flex justify-center gap-3">
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
      </div>
      <div className="mt-8 space-x-4">
        <Button 
          onClick={onStartOver}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Start Over
        </Button>
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
