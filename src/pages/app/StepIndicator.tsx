import React from 'react';
import { Step } from './types';
import { CheckCircle, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: Step;
  isConnected: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, isConnected }) => {
  // Define the simplified 3-step flow: Connect - Input - Add
  const steps: { id: string; label: string; key: Step }[] = [
    { id: '1', label: 'Connect', key: 'connect' },
    { id: '2', label: 'Input', key: 'input' },
    { id: '3', label: 'Add', key: 'tasks' },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = getStepState(step.key, currentStep) === 'completed';
          const isActive = getStepState(step.key, currentStep) === 'active';
          
          // Determine if this is the last step
          const isLastStep = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all",
                    isCompleted ? "bg-[#fbbc05] text-white" : 
                    isActive ? "border-2 border-[#fbbc05] bg-white text-[#fbbc05]" : 
                    "border-2 border-gray-200 bg-white text-gray-400"
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
                    "text-sm font-medium mt-2",
                    isCompleted || isActive ? "text-gray-900" : "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {!isLastStep && (
                <div 
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full",
                    isCompleted ? "bg-[#fbbc05]" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to determine the state of each step
const getStepState = (stepKey: Step, currentStep: Step) => {
  const stepOrder: Step[] = ['connect', 'input', 'tasks', 'complete'];
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