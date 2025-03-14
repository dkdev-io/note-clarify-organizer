
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { CallToAction } from './CallToAction';
import { Progress } from '@/components/ui/progress';

interface PricingCardProps {
  title: string;
  description: string;
  note: string;
  onSignUp: () => void;
  featured?: boolean;
  statusBar?: {
    max: number;
    current: number;
    label: string;
  };
}

export const PricingCard = ({ 
  title, 
  description, 
  note, 
  onSignUp, 
  featured = false,
  statusBar 
}: PricingCardProps) => {
  return (
    <div className={`bg-white p-8 rounded-xl shadow-lg ${featured ? 'ring-2 ring-[#fbbc05] transform -translate-y-4' : ''} transition-all hover:shadow-xl`}>
      {featured && (
        <div className="bg-[#fbbc05] text-black font-medium py-1 px-4 rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-3xl font-bold my-4">$45.25</p>
      <p className="text-gray-600 mb-6">Everything you need to streamline your project management</p>
      
      <div className="text-left mb-8">
        <p className="text-gray-600 mb-4">{description}</p>
        <p className="font-medium">{note}</p>
      </div>
      
      <ul className="space-y-4 mb-8 text-left">
        <li className="flex items-start">
          <CheckCircle className="h-5 w-5 text-[#fbbc05] mr-3 flex-shrink-0" />
          <span className="text-gray-600">Unlimited note processing</span>
        </li>
        <li className="flex items-start">
          <CheckCircle className="h-5 w-5 text-[#fbbc05] mr-3 flex-shrink-0" />
          <span className="text-gray-600">Integration with popular project management tools</span>
        </li>
        <li className="flex items-start">
          <CheckCircle className="h-5 w-5 text-[#fbbc05] mr-3 flex-shrink-0" />
          <span className="text-gray-600">Advanced AI task extraction</span>
        </li>
      </ul>
      
      {statusBar && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">{statusBar.label}</span>
            <span className="text-sm font-medium text-gray-600">{statusBar.current}/{statusBar.max}</span>
          </div>
          <Progress 
            value={(statusBar.current / statusBar.max) * 100} 
            className="h-2 bg-gray-200"
          />
        </div>
      )}
      
      <CallToAction onClick={onSignUp} className="w-full">
        Get Started
      </CallToAction>
    </div>
  );
};
