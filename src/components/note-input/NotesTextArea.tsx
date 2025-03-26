
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileTextIcon, SendIcon, ArrowRightIcon, InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NotesTextAreaProps {
  noteText: string;
  setNoteText: (text: string) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  isTransitioning: boolean;
}

const NotesTextArea: React.FC<NotesTextAreaProps> = ({
  noteText,
  setNoteText,
  handleSubmit,
  isSubmitting,
  isTransitioning
}) => {
  return (
    <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-left">
            <FileTextIcon className="inline-block mr-2 h-5 w-5 text-primary" />
            <strong>Option 3: Paste Your Notes</strong>
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
      </CardHeader>

      <CardContent>
        <Textarea
          placeholder="Paste your meeting notes, to-do lists, or any text here..."
          className="min-h-[240px] p-4 text-base leading-relaxed resize-none bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
      </CardContent>

      <CardFooter className="flex justify-start pt-2 pb-4 px-6">
        <Button 
          onClick={handleSubmit}
          disabled={!noteText.trim() || isTransitioning || isSubmitting}
          className="bg-primary text-primary-foreground font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
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
  );
};

export default NotesTextArea;
