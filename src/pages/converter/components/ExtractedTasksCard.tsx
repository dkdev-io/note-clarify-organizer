
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Flag, 
  AlertCircle,
  User
} from 'lucide-react';

interface ExtractedTasksCardProps {
  extractedTasks: Task[];
  isProcessing: boolean;
  forceAddToIssueLog: () => Promise<void>;
}

const ExtractedTasksCard: React.FC<ExtractedTasksCardProps> = ({
  extractedTasks,
  isProcessing,
  forceAddToIssueLog
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">Extracted Tasks</CardTitle>
            <CardDescription>
              Found {extractedTasks.length} task{extractedTasks.length !== 1 ? 's' : ''} in your notes
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            AI Enhanced
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {extractedTasks.map((task, index) => (
            <div 
              key={task.id || index} 
              className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{task.title}</h3>
                {task.priority && (
                  <Badge 
                    className={`
                      ${task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 
                        task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-green-50 text-green-700 border-green-200'}
                    `}
                  >
                    <Flag className="h-3 w-3 mr-1" /> {task.priority}
                  </Badge>
                )}
              </div>
              
              {task.description && (
                <p className="text-gray-600 text-sm mb-3">{task.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-2">
                {task.dueDate && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Clock className="h-3 w-3 mr-1" /> 
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </Badge>
                )}
                
                {task.assignee && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <User className="h-3 w-3 mr-1" /> 
                    {task.assignee}
                  </Badge>
                )}
                
                {task.status && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> 
                    {task.status}
                  </Badge>
                )}
              </div>
              
              {/* Display LLM suggestions if available */}
              {task.suggestions && (
                <div className="mt-3 bg-amber-50 p-3 rounded-md border border-amber-200">
                  <h4 className="text-sm font-medium text-amber-700 flex items-center mb-2">
                    <AlertCircle className="h-3 w-3 mr-1" /> AI Suggestions
                  </h4>
                  <ul className="space-y-1 text-xs text-amber-800">
                    {task.suggestions.dueDate && (
                      <li className="flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        {task.suggestions.dueDate}
                      </li>
                    )}
                    {task.suggestions.priority && (
                      <li className="flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        {task.suggestions.priority}
                      </li>
                    )}
                    {task.suggestions.description && (
                      <li className="flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        {task.suggestions.description}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={forceAddToIssueLog} 
          disabled={isProcessing}
        >
          Add to Issue Log
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExtractedTasksCard;
