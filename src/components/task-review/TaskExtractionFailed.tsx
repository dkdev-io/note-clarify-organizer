
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircleIcon, ArrowLeftIcon, FileTextIcon, ListIcon, FileSpreadsheetIcon } from 'lucide-react';

interface TaskExtractionFailedProps {
  onBack: () => void;
  onAddManualTask?: () => void;
  sourceType?: 'notes' | 'spreadsheet';
}

const TaskExtractionFailed: React.FC<TaskExtractionFailedProps> = ({ 
  onBack,
  onAddManualTask,
  sourceType = 'notes'
}) => {
  const isSpreadsheet = sourceType === 'spreadsheet';
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-medium">
            <AlertCircleIcon className="mr-2 h-5 w-5 text-amber-500" />
            Task Extraction Failed
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-amber-800">
              We couldn't extract any tasks from your {isSpreadsheet ? 'spreadsheet' : 'notes'}. 
              This might happen if:
            </p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-amber-700">
              {isSpreadsheet ? (
                <>
                  <li>Your spreadsheet format is not recognized</li>
                  <li>Required columns are missing (title, description, assignee)</li>
                  <li>The spreadsheet is empty or contains invalid data</li>
                </>
              ) : (
                <>
                  <li>Your notes don't contain any clear action items</li>
                  <li>The format of your notes is unusual or complex</li>
                  <li>There was a technical issue with the AI processing</li>
                </>
              )}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Suggestions:</h3>
            
            {isSpreadsheet ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileSpreadsheetIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Check your spreadsheet format</h4>
                    <p className="text-sm text-gray-600">
                      Make sure your spreadsheet has clear headers like "Title", "Description", "Assignee", and "Due Date".
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <ListIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Try a different file format</h4>
                    <p className="text-sm text-gray-600">
                      If you're using Excel, try saving as CSV, or vice versa. Different formats may process better.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileTextIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Try formatting your notes differently</h4>
                    <p className="text-sm text-gray-600">
                      Use bullet points, numbered lists, or phrases like "task:", "todo:", "needs to be done:" to make tasks more recognizable.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <ListIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Be explicit about task details</h4>
                    <p className="text-sm text-gray-600">
                      Include clear assignees (e.g., "John will..."), due dates (e.g., "by Friday"), and priorities (e.g., "high priority").
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {onAddManualTask && (
            <Button
              onClick={onAddManualTask}
              className="w-full mt-4"
            >
              Create Tasks Manually
            </Button>
          )}
        </CardContent>
        
        <CardFooter>
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to {isSpreadsheet ? 'Spreadsheet Upload' : 'Notes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskExtractionFailed;
