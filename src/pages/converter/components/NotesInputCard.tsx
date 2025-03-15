
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface NotesInputCardProps {
  textAreaValue: string;
  setTextAreaValue: (value: string) => void;
  handleTextSubmit: () => Promise<void>;
  addSampleTasks: () => void;
  isProcessing: boolean;
  addDirectTestIssue: () => Promise<void>;
  createAllIssueReports: () => Promise<void>;
}

const NotesInputCard: React.FC<NotesInputCardProps> = ({
  textAreaValue,
  setTextAreaValue,
  handleTextSubmit,
  addSampleTasks,
  isProcessing,
  addDirectTestIssue,
  createAllIssueReports
}) => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Enter your notes</span>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addDirectTestIssue}
              className="text-xs"
            >
              Add Test Issue Directly
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={createAllIssueReports}
              className="text-xs"
            >
              Create Issue Reports
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          className="w-full p-3 border rounded-md min-h-[150px]"
          value={textAreaValue}
          onChange={(e) => setTextAreaValue(e.target.value)}
          placeholder="Type or paste your notes here..."
        />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        <Button 
          onClick={handleTextSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Extract Tasks & Add to Issue Log'}
        </Button>
        <Button 
          variant="outline" 
          onClick={addSampleTasks}
          disabled={isProcessing}
        >
          Add Sample Tasks
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotesInputCard;
