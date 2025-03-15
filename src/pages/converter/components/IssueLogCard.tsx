
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TaskToIssueConverter from '@/components/task-review/TaskToIssueConverter';

interface IssueLogCardProps {
  extractedTasks: Task[];
}

const IssueLogCard: React.FC<IssueLogCardProps> = ({ extractedTasks }) => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle>Add to Issue Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskToIssueConverter tasks={extractedTasks} />
      </CardContent>
    </Card>
  );
};

export default IssueLogCard;
