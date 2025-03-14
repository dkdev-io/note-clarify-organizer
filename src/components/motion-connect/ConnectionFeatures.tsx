
import React from 'react';

const ConnectionFeatures: React.FC = () => {
  return (
    <div className="text-sm text-muted-foreground border-t pt-4">
      <p>Connecting to Motion API allows us to:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Validate assignee names against existing Motion users</li>
        <li>Check if projects already exist or need to be created</li>
        <li>Load your actual workspaces</li>
      </ul>
    </div>
  );
};

export default ConnectionFeatures;
