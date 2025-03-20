
import { Task } from './types';

/**
 * Converts an array of tasks into a CSV string
 * @param tasks Array of tasks to convert to CSV
 * @returns CSV formatted string
 */
export const tasksToCSV = (tasks: Task[]): string => {
  if (!tasks || tasks.length === 0) {
    return '';
  }

  // Define the columns we want to include in the CSV
  const columns = [
    'title',
    'description',
    'dueDate',
    'priority',
    'status',
    'assignee',
    'project',
    'duration',
  ];

  // Create the header row
  const header = columns.join(',');

  // Create the data rows
  const rows = tasks.map(task => {
    return columns
      .map(column => {
        // Get the value for this column from the task
        const value = task[column as keyof Task];
        
        // Format the value for CSV (handle null, quotes, etc.)
        if (value === null || value === undefined) {
          return '';
        }
        
        // Escape quotes and wrap in quotes if the value contains commas or quotes
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      })
      .join(',');
  });

  // Combine header and rows
  return [header, ...rows].join('\n');
};

/**
 * Triggers a download of the given tasks as a CSV file
 * @param tasks Array of tasks to download
 * @param filename Name of the file to download
 */
export const downloadTasksAsCSV = (tasks: Task[], filename = 'tasks.csv'): void => {
  // Convert tasks to CSV
  const csv = tasksToCSV(tasks);
  
  // Create a Blob from the CSV
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
