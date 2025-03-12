
import React from 'react';
import { Step } from './types';
import { CheckCircle, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: Step;
  isConnected: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, isConnected }) => {
  // Define the steps based on whether Motion API is connected
  let steps: { id: string; label: string; key: Step }[] = [];

  if (isConnected) {
    steps = [
      { id: '1', label: 'Connect', key: 'connect' },
      { id: '2', label: 'Workspace', key: 'workspace' },
      { id: '3', label: 'Input', key: 'input' },
      { id: '4', label: 'Tasks', key: 'tasks' },
    ];
  } else {
    steps = [
      { id: '1', label: 'Connect', key: 'connect' },
      { id: '2', label: 'Input', key: 'input' },
      { id: '3', label: 'Tasks', key: 'tasks' },
    ];
  }

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = getStepState(step.key, currentStep) === 'completed';
          const isActive = getStepState(step.key, currentStep) === 'active';
          
          // Determine if this is the last step
          const isLastStep = index === steps.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2 transition-all",
                    isCompleted ? "border-primary bg-primary text-white" : 
                    isActive ? "border-primary bg-white text-primary" : 
                    "border-gray-300 bg-white text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <CircleDashed className="w-5 h-5" />
                  )}
                </div>
                <span 
                  className={cn(
                    "text-sm font-medium",
                    isCompleted || isActive ? "text-gray-900" : "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {!isLastStep && (
                <div 
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    isCompleted ? "bg-primary" : "bg-gray-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to determine the state of each step
const getStepState = (stepKey: Step, currentStep: Step) => {
  const stepOrder: Step[] = ['connect', 'workspace', 'input', 'tasks', 'complete'];
  const currentIndex = stepOrder.indexOf(currentStep);
  const stepIndex = stepOrder.indexOf(stepKey);
  
  if (stepIndex < currentIndex) {
    return 'completed';
  } else if (stepIndex === currentIndex) {
    return 'active';
  } else {
    return 'upcoming';
  }
};

export default StepIndicator;
