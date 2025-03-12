
import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
}

export const FeatureCard = ({ title, description, icon, className = '' }: FeatureCardProps) => {
  return (
    <div className={`bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      {icon && <div className="mb-4 text-[#fbbc05]">{icon}</div>}
      <h3 className="text-3xl font-bebas-neue mb-4 font-bold">{title}</h3>
      <p className="font-georgia">{description}</p>
    </div>
  );
};
