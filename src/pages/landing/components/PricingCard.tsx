
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { CallToAction } from './CallToAction';

interface PricingCardProps {
  title: string;
  description: string;
  note: string;
  onSignUp: () => void;
  featured?: boolean;
}

export const PricingCard = ({ title, description, note, onSignUp, featured = false }: PricingCardProps) => {
  return (
    <div className={`bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] ${featured ? 'transform -translate-y-4 border-[#fbbc05]' : ''}`}>
      {featured && (
        <div className="bg-[#fbbc05] text-black font-bold py-1 px-4 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-4xl font-bebas-neue mb-2 font-bold">{title}</h3>
      <p className="text-5xl font-bebas-neue my-4 font-bold">$45.25</p>
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
      
      <CallToAction onClick={onSignUp} className="w-full">
        Get Started
      </CallToAction>
    </div>
  );
};
