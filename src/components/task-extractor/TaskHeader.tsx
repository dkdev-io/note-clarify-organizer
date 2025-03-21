
import React from 'react';
import { FileTextIcon, ClipboardListIcon, FileSpreadsheetIcon } from 'lucide-react';

interface TaskHeaderProps {
  projectName: string | null;
  selectedTasksCount: number;
  totalTasksCount: number;
  sourceType?: 'notes' | 'spreadsheet';
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ 
  projectName, 
  selectedTasksCount, 
  totalTasksCount,
  sourceType = 'notes'
}) => {
  const isSpreadsheet = sourceType === 'spreadsheet';
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {isSpreadsheet ? (
          <FileSpreadsheetIcon className="h-5 w-5 text-blue-600" />
        ) : (
          <FileTextIcon className="h-5 w-5 text-blue-600" />
        )}
        <h2 className="text-xl font-semibold">
          {isSpreadsheet ? 'Spreadsheet Tasks' : 'Extracted Tasks'}
        </h2>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Select the tasks you want to add to 
            {projectName ? (
              <span className="font-medium text-gray-700"> {projectName}</span>
            ) : (
              ' your project'
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
          <ClipboardListIcon className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs font-medium">
            {selectedTasksCount} of {totalTasksCount} selected
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;
