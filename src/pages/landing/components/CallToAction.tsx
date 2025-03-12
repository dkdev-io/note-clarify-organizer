
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
        "bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-black font-bold rounded-none border-black border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1",
        size === 'large' ? "text-lg px-10 py-7" : "px-6 py-5",
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
