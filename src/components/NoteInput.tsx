import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileTextIcon, SendIcon, ArrowRightIcon, PlusIcon, SaveIcon } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface NoteInputProps {
  onParseTasks: (text: string, projectName: string | null) => void;
}

const NoteInput: React.FC<NoteInputProps> = ({ onParseTasks }) => {
  const [noteText, setNoteText] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (noteText.trim()) {
      setIsTransitioning(true);
      setTimeout(() => {
        // Pass null for project name to extract from text
        onParseTasks(noteText, null);
        setIsTransitioning(false);
      }, 400);
    }
  };

  const handleSaveToKeep = () => {
    if (noteText.trim()) {
      // Create the Google Keep URL with the note content
      const keepUrl = `https://keep.google.com/u/0/#create/${encodeURIComponent(noteText)}`;
      
      // Open Google Keep in a new tab
      window.open(keepUrl, '_blank');
      
      toast({
        title: "Note ready for Keep",
        description: "Google Keep has been opened with your note content.",
      });
    } else {
      toast({
        title: "Empty note",
        description: "Please enter some text before saving to Keep.",
        variant: "destructive",
      });
    }
  };

  const sampleNotes = [
    "XYZ Client Marketing Campaign - March 12:\n- Sarah needs to prepare the Q2 sales report by May 1st.\n- Update the client presentation with new metrics - high priority.\n- Schedule follow-up meeting with the marketing team next week.\n- John to review the product roadmap document before Friday.",
    "Project Alpha Planning:\n1. Research competitors by end of month\n2. Mike must create wireframes for the new dashboard\n3. Urgent: Fix the login bug reported by users\n4. Schedule user interviews for next sprint",
    "Creative Agency Rebranding:\n• Jennifer must take the logo and add the tagline by March 11.\n• Meet with stakeholders about budget concerns on Tuesday\n• Mark to redesign the website homepage by end of week"
  ];

  const loadSample = (index: number) => {
    setNoteText(sampleNotes[index]);
    // Project name will be extracted from text
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-medium text-gray-900">
            <FileTextIcon className="inline-block mr-2 h-6 w-6 text-primary" />
            Meeting Notes
          </CardTitle>
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
        <CardFooter className="flex justify-between pt-2 pb-4 px-6">
          <Button 
            variant="outline"
            onClick={handleSaveToKeep}
            disabled={!noteText.trim() || isTransitioning}
            className="transition-all duration-300"
          >
            <SaveIcon className="h-4 w-4 mr-2" />
            Save to Keep
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!noteText.trim() || isTransitioning}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <SendIcon className="h-4 w-4 mr-2" />
            Extract Tasks
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoteInput;
