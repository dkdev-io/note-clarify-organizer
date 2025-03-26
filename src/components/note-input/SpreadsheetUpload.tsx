
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheetIcon, UploadIcon, FileIcon, XCircleIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SpreadsheetUploadProps {
  onSpreadsheetData: (data: any[]) => void;
}

const SpreadsheetUpload: React.FC<SpreadsheetUploadProps> = ({ onSpreadsheetData }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    // Check if file is a spreadsheet type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
      'text/comma-separated-values'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel or CSV file.",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Mock processing the file - in a real implementation, you would parse the Excel/CSV here
      // For this example, we'll just return some mock data after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in a real implementation, this would come from parsing the file
      const mockData = [
        { id: 1, title: "Project Planning", description: "Create project roadmap", assignee: "John" },
        { id: 2, title: "Requirements Gathering", description: "Interview stakeholders", assignee: "Sarah" },
        { id: 3, title: "Design Phase", description: "Create wireframes", assignee: "Michael" }
      ];
      
      onSpreadsheetData(mockData);
      
      toast({
        title: "Spreadsheet uploaded",
        description: `Successfully processed ${mockData.length} project items from ${file.name}`,
      });
    } catch (error) {
      console.error("Error processing spreadsheet:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem processing your spreadsheet.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <div className="rounded-lg bg-white p-4 border border-gray-100 shadow-sm mb-4">
      <h2 className="text-xl font-bold text-left mb-3">
        <span role="img" aria-label="spreadsheet" className="mr-2">📊</span>
        Option 2: Upload Project Spreadsheet
      </h2>
      
      <div className="space-y-4">
        {!file ? (
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              disabled={isUploading}
            >
              <FileSpreadsheetIcon className="h-4 w-4 mr-2" />
              Select File
            </Button>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium truncate max-w-[180px]">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearFile}
                className="h-7 w-7"
                disabled={isUploading}
              >
                <XCircleIcon className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
            
            <Button 
              onClick={handleFileUpload} 
              className="w-full mt-3 bg-primary text-primary-foreground font-bold"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload & Process Spreadsheet
                </>
              )}
            </Button>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          Upload an Excel (.xlsx, .xls) or CSV file with your project information. 
          The spreadsheet should include columns for task title, description, assignee, and due date.
        </p>
      </div>
    </div>
  );
};

export default SpreadsheetUpload;
