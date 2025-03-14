
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CallToActionProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  size?: 'default' | 'large';
  icon?: ReactNode;
}

export const CallToAction = ({ 
  onClick, 
  children, 
  className = '', 
  size = 'default',
  icon
}: CallToActionProps) => {
  return (
    <Button 
      onClick={onClick}
      className={cn(
        "bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-black font-medium rounded-full transition-all",
        size === 'large' ? "text-lg px-10 py-6" : "px-6 py-2",
        className
      )}
    >
      <span className="flex items-center gap-2">
        {children}
        {icon && <span>{icon}</span>}
      </span>
    </Button>
  );
};
