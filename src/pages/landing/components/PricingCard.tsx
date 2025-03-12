
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface PricingCardProps {
  title: string;
  description: string;
  note: string;
  onSignUp: () => void;
}

export const PricingCard = ({ title, description, note, onSignUp }: PricingCardProps) => {
  return (
    <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-4xl font-bebas-neue mb-2 font-bold">{title}</h3>
      <p className="text-5xl font-bebas-neue my-4 font-bold">$50</p>
      <p className="font-georgia text-lg mb-6">Everything you need to streamline your project management</p>
      
      <div className="text-left mb-8">
        <p className="font-georgia mb-4">{description}</p>
        <p className="font-georgia font-bold">{note}</p>
      </div>
      
      <ul className="space-y-4 mb-8 text-left">
        <li className="flex items-start font-georgia">
          <CheckCircle className="h-6 w-6 text-[#fbbc05] mr-3 flex-shrink-0" />
          <span>Unlimited note processing</span>
        </li>
        <li className="flex items-start font-georgia">
          <CheckCircle className="h-6 w-6 text-[#fbbc05] mr-3 flex-shrink-0" />
          <span>Integration with popular project management tools</span>
        </li>
        <li className="flex items-start font-georgia">
          <CheckCircle className="h-6 w-6 text-[#fbbc05] mr-3 flex-shrink-0" />
          <span>Advanced AI task extraction</span>
        </li>
      </ul>
      
      <Button 
        onClick={onSignUp}
        className="w-full bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-black font-bold text-lg py-6 rounded-none border-black border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
      >
        Get Started
      </Button>
    </div>
  );
};
