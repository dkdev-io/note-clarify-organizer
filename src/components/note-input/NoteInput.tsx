
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import IntegrationOptions from './IntegrationOptions';
import NotesTextArea from './NotesTextArea';
import NoteInputHeader from './NoteInputHeader';

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

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      <NoteInputHeader />
      <IntegrationOptions />
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
