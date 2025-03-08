
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileTextIcon, SendIcon, ArrowRightIcon, PlusIcon } from 'lucide-react';

interface NoteInputProps {
  onParseTasks: (text: string, projectName: string | null) => void;
}

const NoteInput: React.FC<NoteInputProps> = ({ onParseTasks }) => {
  const [noteText, setNoteText] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const sampleNotes = [
    "Team Meeting Notes - April 5:\n- Sarah needs to prepare the Q2 sales report by May 1st.\n- Update the client presentation with new metrics - high priority.\n- Schedule follow-up meeting with the marketing team next week.\n- John to review the product roadmap document before Friday.",
    "Project Alpha Planning:\n1. Research competitors by end of month\n2. Create wireframes for the new dashboard - assigned to Mike\n3. Urgent: Fix the login bug reported by users\n4. Schedule user interviews for next sprint",
    "Weekly Stand-up:\n• Implement new search functionality within 24 hours\n• Create documentation for API - low priority\n• Meet with stakeholders about budget concerns on Tuesday\n• Danny must finish the website before March 20th. He'll need to send the MVP of the site by March 18th to Edward and James for approval"
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
        <CardFooter className="flex justify-end pt-2 pb-4 px-6">
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
