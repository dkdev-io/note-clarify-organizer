
import React from 'react';
import { LinkIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

const NoteInputHeader: React.FC = () => {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-left mb-4 flex items-center">
        <LinkIcon className="inline-block mr-2 h-5 w-5 text-primary" />
        Option 1: Import Your Notes (Coming Soon)
      </h2>
      <div className="flex justify-start mt-2">
        <Button 
          className="bg-primary text-primary-foreground font-bold"
          disabled={true}
        >
          Connect & Import
        </Button>
      </div>
    </div>
  );
};

export default NoteInputHeader;
