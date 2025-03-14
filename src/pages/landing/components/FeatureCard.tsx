
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
    <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
      {icon && <div className="mb-6 text-[#fbbc05]">{icon}</div>}
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
