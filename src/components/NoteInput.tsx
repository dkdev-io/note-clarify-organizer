
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileTextIcon, SendIcon, ArrowRightIcon, PlusIcon, InfoIcon } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  const sampleNotes = [
    "XYZ Client Marketing Campaign - March 12:\n- Sarah needs to prepare the Q2 sales report by May 1st.\n- Update the client presentation with new metrics - high priority.\n- Schedule follow-up meeting with the marketing team next week.\n- John to review the product roadmap document before Friday.",
    "Project Alpha Planning:\n1. Research competitors by end of month\n2. Mike must create wireframes for the new dashboard\n3. Urgent: Fix the login bug reported by users\n4. Schedule user interviews for next sprint",
    "Creative Agency Rebranding:\n• Jennifer must take the logo and add the tagline by March 11.\n• Meet with stakeholders about budget concerns on Tuesday\n• Mark to redesign the website homepage by end of week"
  ];

  // Create a sample based on the connected users if available
  if (apiProps.isConnected && apiProps.users && apiProps.users.length > 0) {
    // Get up to 3 random users from the list
    const availableUsers = [...apiProps.users];
    const selectedUsers = [];
    
    for (let i = 0; i < Math.min(3, availableUsers.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableUsers.length);
      const user = availableUsers.splice(randomIndex, 1)[0];
      if (user && user.name) {
        // Extract first name
        const firstName = user.name.split(' ')[0];
        selectedUsers.push(firstName);
      }
    }
    
    if (selectedUsers.length > 0) {
      // Replace sample 3 with a sample that uses the actual Motion users
      const userSample = `Team Project Updates:\n• ${selectedUsers[0] || 'Alex'} will research new tools by March 15th.\n• ${selectedUsers[1] || 'Jamie'} needs to finish the documentation by next Friday.\n• ${selectedUsers[2] || 'Taylor'} will set up the project meeting for next week.`;
      
      sampleNotes[2] = userSample;
    }
  }

  const loadSample = (index: number) => {
    setNoteText(sampleNotes[index]);
    
    // Small toast to confirm sample loaded
    toast({
      title: "Sample loaded",
      description: "You can now extract tasks from this sample text.",
    });
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      <h2 className="text-xl font-medium text-center mb-4">Connect your notetaking app</h2>
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-medium text-gray-900">
              <FileTextIcon className="inline-block mr-2 h-6 w-6 text-primary" />
              Paste your notes below
            </CardTitle>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-4 bg-white" side="left">
                  <div className="space-y-2">
                    <p className="font-medium">How to assign tasks to people:</p>
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      <li>Use the format "Name will [task]"</li>
                      <li>Make sure names match Motion users exactly</li>
                      <li>Names like "Dn", "Mat", "Juan" may not match if not in Motion</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Paste your meeting notes or any text to extract tasks and project name
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your meeting notes, to-do lists, or any text here..."
            className="min-h-[240px] p-4 text-base leading-relaxed resize-none bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 mt-4">
            <p className="text-xs text-muted-foreground w-full mb-1">Try one of these examples:</p>
            {sampleNotes.map((_, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                className="text-xs bg-secondary hover:bg-secondary/80"
                onClick={() => loadSample(index)}
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                Sample {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-2 pb-4 px-6">
          <Button 
            onClick={handleSubmit}
            disabled={!noteText.trim() || isTransitioning || isSubmitting}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <SendIcon className="h-4 w-4 mr-2" />
                Extract Tasks
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoteInput;
