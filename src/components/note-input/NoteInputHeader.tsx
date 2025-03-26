
import React from 'react';
import { LinkIcon } from 'lucide-react';

const NoteInputHeader: React.FC = () => {
  return (
    <h2 className="text-xl font-bold text-left mb-4 flex items-center">
      <LinkIcon className="inline-block mr-2 h-5 w-5 text-primary" />
      Option 1: Import Your Notes (Coming Soon)
    </h2>
  );
};

export default NoteInputHeader;
