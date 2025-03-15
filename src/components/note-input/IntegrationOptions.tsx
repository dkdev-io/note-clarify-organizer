
import React from 'react';
import { VideoIcon, FileAudioIcon, MailIcon } from 'lucide-react';

const IntegrationOptions: React.FC = () => {
  return (
    <div className="mb-4 rounded-lg bg-white p-4 border border-gray-100 shadow-sm">
      <h3 className="font-medium mb-3">Option 1: Connect Your Note Taking App</h3>
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
  );
};

export default IntegrationOptions;
