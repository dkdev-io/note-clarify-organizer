
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import IntegrationOptions from './IntegrationOptions';
import NotesTextArea from './NotesTextArea';
import NoteInputHeader from './NoteInputHeader';
import SpreadsheetUpload from './SpreadsheetUpload';

interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[];
  selectedWorkspaceId?: string;
  selectedProject?: string;
  users?: any[];
}

interface NoteInputProps {
  onParseTasks: (text: string, projectName: string | null) => void;
  apiProps: ApiProps;
}

const NoteInput: React.FC<NoteInputProps> = ({ onParseTasks, apiProps }) => {
  const [noteText, setNoteText] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!noteText.trim()) {
      toast({
        title: "Empty notes",
        description: "Please enter some notes to extract tasks from.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTransitioning(true);
    setIsSubmitting(true);
    
    console.log('Submitting note text:', noteText.substring(0, 50) + '...');
    console.log('Selected project:', apiProps.selectedProject);
    
    // Short delay for animation
    setTimeout(() => {
      try {
        // Pass null for project name to extract from text or use selectedProject from apiProps
        onParseTasks(noteText, apiProps.selectedProject || null);
      } catch (error) {
        console.error("Error submitting notes:", error);
        toast({
          title: "Error submitting notes",
          description: "There was a problem processing your notes. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsTransitioning(false);
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleSpreadsheetData = (data: any[]) => {
    // Convert spreadsheet data to text format that can be processed
    const formattedText = data.map(item => {
      let taskText = `- ${item.title}`;
      
      if (item.description) {
        taskText += `: ${item.description}`;
      }
      
      if (item.assignee) {
        taskText += ` (assigned to ${item.assignee})`;
      }
      
      if (item.dueDate) {
        taskText += ` due ${item.dueDate}`;
      }
      
      if (item.priority) {
        taskText += ` [${item.priority} priority]`;
      }
      
      return taskText;
    }).join('\n\n');
    
    // Set the formatted text to the noteText state
    setNoteText(formattedText);
    
    toast({
      title: "Spreadsheet data imported",
      description: `${data.length} tasks have been extracted from your spreadsheet and added to the notes.`,
    });
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      <NoteInputHeader />
      <IntegrationOptions />
      
      {/* Add Spreadsheet Upload component */}
      <div className="mb-4">
        <SpreadsheetUpload onSpreadsheetData={handleSpreadsheetData} />
      </div>
      
      <NotesTextArea 
        noteText={noteText}
        setNoteText={setNoteText}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isTransitioning={isTransitioning}
      />
    </div>
  );
};

export default NoteInput;
