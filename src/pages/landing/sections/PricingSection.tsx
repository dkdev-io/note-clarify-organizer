
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { PricingCard } from '../components/PricingCard';
import { CallToAction } from '../components/CallToAction';

export const PricingSection = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    console.log('Navigating to signup page');
    // Clear any existing skip_auth flag
    sessionStorage.removeItem('skip_auth');
    navigate('/login?signup=true');
  };
  
  return (
    <section className="bg-white py-28 border-y-4 border-black relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#fbbc05] rounded-full opacity-20 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#fbbc05] rounded-full opacity-15 translate-y-1/2 blur-3xl"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-5xl font-bebas-neue mb-4 font-bold tracking-tight">Simple <span className="text-[#fbbc05]">Pricing</span></h2>
        <p className="font-georgia text-xl max-w-2xl mx-auto mb-16 text-gray-800">
          Join our early access program and lock in special pricing.
        </p>
        
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
            featured={true}
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
