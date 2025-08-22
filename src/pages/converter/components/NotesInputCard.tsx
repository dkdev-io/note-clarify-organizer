
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import DebugActions from './DebugActions';

interface NotesInputCardProps {
  textAreaValue: string;
  setTextAreaValue: (value: string) => void;
  handleTextSubmit: () => Promise<void>;
  addSampleTasks: () => void;
  isProcessing: boolean;
  createAllIssueReports: () => Promise<void>;
}

const NotesInputCard: React.FC<NotesInputCardProps> = ({
  textAreaValue,
  setTextAreaValue,
  handleTextSubmit,
  addSampleTasks,
  isProcessing,
  createAllIssueReports
}) => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Enter your notes</span>
          <DebugActions onCreateReports={createAllIssueReports} />
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
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isProcessing ? 'Processing...' : 'Submit'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotesInputCard;
