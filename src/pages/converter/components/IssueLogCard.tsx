
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

interface IssueLogCardProps {
  extractedTasks: Task[];
}

const IssueLogCard: React.FC<IssueLogCardProps> = ({ extractedTasks }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Issue Log Ready</CardTitle>
        <CardDescription>
          These tasks are ready to be added to your issue log
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <Lightbulb className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Ready to Track Issues</h3>
              <p className="text-sm text-blue-700 mb-2">
                {extractedTasks.length} task{extractedTasks.length !== 1 ? 's' : ''} {extractedTasks.length !== 1 ? 'are' : 'is'} ready to be added to your issue log. Click "Add to Issue Log" button to proceed.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {extractedTasks.length} Task{extractedTasks.length !== 1 ? 's' : ''}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {extractedTasks.filter(t => t.priority === 'high').length} High Priority
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {extractedTasks.filter(t => t.dueDate).length} With Due Date
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueLogCard;
