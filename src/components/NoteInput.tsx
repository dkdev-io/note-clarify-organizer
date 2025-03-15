
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileTextIcon, SendIcon, ArrowRightIcon, InfoIcon, LinkIcon, VideoIcon, FileAudioIcon, MailIcon } from 'lucide-react';
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

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      {/* Integration icons */}
      <div className="mb-4 rounded-lg bg-white p-4 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-xl mb-3">Option 1: Connect Your Note Taking App</h3>
        <div className="flex items-center justify-start space-x-6">
          <div className="flex flex-col items-center">
            <VideoIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xs mt-1">Zoom</span>
          </div>
          <div className="flex flex-col items-center">
            <FileAudioIcon className="h-8 w-8 text-purple-600" />
            <span className="text-xs mt-1">Otter AI</span>
          </div>
          <div className="flex flex-col items-center">
            <MailIcon className="h-8 w-8 text-red-500" />
            <span className="text-xs mt-1">Google</span>
          </div>
        </div>
      </div>
      
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-medium text-gray-900">
              <FileTextIcon className="inline-block mr-2 h-6 w-6 text-primary" />
              <strong>Option 2: Paste Your Notes Below</strong>
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
