
import React from 'react';
import { AppHeader } from '../AppLayout';
import StepIndicator from '../StepIndicator';
import { Step } from '../types';

interface AppLayoutProps {
  children: React.ReactNode;
  step: Step;
  isConnected: boolean;
  workspaces: any[];
  selectedWorkspaceId?: string;
  selectedProject?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  step,
  isConnected,
  workspaces,
  selectedWorkspaceId,
  selectedProject
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        <AppHeader 
          isConnected={isConnected}
          step={step}
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          selectedProject={selectedProject}
        />
        
        {step !== 'complete' && (
          <StepIndicator 
            currentStep={step} 
            isConnected={isConnected} 
          />
        )}
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
