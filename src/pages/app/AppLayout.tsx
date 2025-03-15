
import React from 'react';
import { BadgeProps } from '@/components/ui/badge';
import { Step } from './types';

interface AppHeaderProps {
  isConnected: boolean;
  step: Step;
  workspaces: any[];
  selectedWorkspaceId?: string;
  selectedProject?: string;
}

// Header component for the application
export const AppHeader: React.FC<AppHeaderProps> = ({ 
  isConnected, 
  step, 
  workspaces, 
  selectedWorkspaceId, 
  selectedProject 
}) => {
  return (
    <header className="text-center mb-8">
      <h1 className="text-3xl font-medium text-gray-900 mb-2">Projectize Step Two: Connect Your Note Taking App</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        Option 1: Connect Your Note Taking App
      </p>
      {isConnected && step !== 'connect' && step !== 'complete' && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <ConnectionBadge type="connected" />
          
          {selectedWorkspaceId && (
            <ConnectionBadge 
              type="workspace" 
              label={workspaces.find(w => w.id === selectedWorkspaceId)?.name || selectedWorkspaceId} 
            />
          )}
          
          {selectedProject && (
            <ConnectionBadge type="project" label={selectedProject} />
          )}
        </div>
      )}
    </header>
  );
};

interface ConnectionBadgeProps {
  type: 'connected' | 'workspace' | 'project';
  label?: string;
}

// Badge component for connection status
export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({ type, label }) => {
  const badgeProps: Partial<BadgeProps> & { children: React.ReactNode } = {
    className: "",
    children: null
  };
  
  switch (type) {
    case 'connected':
      badgeProps.className = "px-3 py-1 bg-green-50 text-green-700 border-green-200";
      badgeProps.children = (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-3 w-3 mr-1"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Connected to Motion API
        </>
      );
      break;
    case 'workspace':
      badgeProps.className = "px-3 py-1 bg-blue-50 text-blue-700 border-blue-200";
      badgeProps.children = <>Workspace: {label}</>;
      break;
    case 'project':
      badgeProps.className = "px-3 py-1 bg-purple-50 text-purple-700 border-purple-200";
      badgeProps.children = <>Project: {label}</>;
      break;
  }
  
  // Using a div with the appropriate classes instead of importing Badge
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${badgeProps.className}`}>
      {badgeProps.children}
    </div>
  );
};
