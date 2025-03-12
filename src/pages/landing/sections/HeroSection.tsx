
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const HeroSection = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    console.log('Navigating to signup page');
    // Clear any existing skip_auth flag
    sessionStorage.removeItem('skip_auth');
    navigate('/login?signup=true');
  };
  
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="flex flex-col items-center">
        <div className="max-w-2xl mb-10">
          <h1 className="text-6xl font-bebas-neue leading-none mb-6 font-bold">From Meeting Notes to Actionable Tasks in Seconds</h1>
          <p className="font-georgia text-xl mb-10">
            Project Notes eliminates the tedious work of turning notes into action items, saving hours of data entry time and preventing missed details.
          </p>
          <Button 
            onClick={handleSignUp}
            className="bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-black font-bold text-lg px-10 py-7 rounded-none border-black border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
          >
            Get Started <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
