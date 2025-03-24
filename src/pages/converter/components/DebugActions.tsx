
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addDirectTestIssue } from '../services/TaskConverterService';

interface DebugActionsProps {
  onCreateReports: () => Promise<void>;
}

const DebugActions: React.FC<DebugActionsProps> = ({ onCreateReports }) => {
  const { toast } = useToast();

  const handleAddDirectTestIssue = async () => {
    const success = await addDirectTestIssue();
    if (success) {
      toast({
        title: "Test issue created",
        description: "Successfully added a test issue directly to the database.",
      });
    } else {
      toast({
        title: "Error creating test issue",
        description: "Failed to add test issue directly to the database.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleAddDirectTestIssue}
        className="text-xs"
      >
        Add Test Issue Directly
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onCreateReports}
        className="text-xs"
      >
        Create Issue Reports
      </Button>
    </div>
  );
};

export default DebugActions;
