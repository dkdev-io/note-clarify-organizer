
import React from 'react';
import { Step } from './types';
import { CheckIcon, ClipboardIcon, LinkIcon } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: Step;
  isConnected: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, isConnected }) => {
  // Define steps and their properties
  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'connect', label: 'Connect API', icon: <LinkIcon className="h-4 w-4" /> },
    { key: 'input', label: 'Input Notes', icon: <ClipboardIcon className="h-4 w-4" /> },
    { key: 'tasks', label: 'Review Tasks', icon: <CheckIcon className="h-4 w-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex items-center">
        {steps.map((s, index) => {
          // Skip the connect step in the display if we're already connected and past that step
          if (s.key === 'connect' && isConnected && currentStep !== 'connect') return null;
          
          const isCompleted = index < currentStepIndex || currentStep === 'complete';
          const isCurrent = s.key === currentStep;
          
          return (
            <React.Fragment key={`step-${s.key}`}>
              {index > 0 && (
                // Only show connection lines between visible steps
                (!(isConnected && (s.key === 'connect' || steps[index-1].key === 'connect') && currentStep !== 'connect')) && (
                  <div 
                    className={`h-[1px] w-10 mx-1 ${
                      isCompleted ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )
              )}
              <div 
                className={`flex flex-col items-center ${
                  isCurrent ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-40'
                }`}
              >
                <div 
                  className={`
                    h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted 
                      ? 'bg-primary text-white' 
                      : isCurrent 
                        ? 'bg-accent border border-primary/50 text-primary' 
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  {s.icon}
                </div>
                <span 
                  className={`text-xs mt-1 ${
                    isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
