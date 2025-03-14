
import React, { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './sections/Footer';

interface LandingLayoutProps {
  children: ReactNode;
}

export const LandingLayout = ({ children }: LandingLayoutProps) => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {/* Added padding top to account for fixed navbar */}
      <div className="pt-20">
        {children}
      </div>
      <Footer />
    </div>
  );
};
