
import React from 'react';
import { LinkIcon } from 'lucide-react';

const NoteInputHeader: React.FC = () => {
  return (
    <h2 className="text-xl font-bold text-left mb-4 flex items-center">
      <LinkIcon className="inline-block mr-2 h-5 w-5 text-primary" />
      Projectize Step Two: Connect Your Note Taking App or Paste Your Notes Below
    </h2>
  );
};

export default NoteInputHeader;
