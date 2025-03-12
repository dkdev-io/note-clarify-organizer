
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { PricingCard } from '../components/PricingCard';

export const PricingSection = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    console.log('Navigating to signup page');
    // Clear any existing skip_auth flag
    sessionStorage.removeItem('skip_auth');
    navigate('/login?signup=true');
  };
  
  return (
    <section className="bg-white py-20 border-y-4 border-black">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-5xl font-bebas-neue mb-16 font-bold">Pricing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard 
            title="First Ten"
            description="One month of earliest access (May-June), with slack group and weekly feedback session with founder."
            note="First customers get 2026 access at First year prices"
            onSignUp={handleSignUp}
          />
          
          <PricingCard 
            title="First One Hundred"
            description="Three months (July-Sep) of early access with slack group and weekly feedback sessions with founder."
            note="First customers get 2026 access at First year prices"
            onSignUp={handleSignUp}
          />
          
          <PricingCard 
            title="First Year"
            description="(Oct-Dec 31) early access slack group, weekly feedback session with founder."
            note="First customers get 2026 access at First year prices"
            onSignUp={handleSignUp}
          />
        </div>
      </div>
    </section>
  );
};
