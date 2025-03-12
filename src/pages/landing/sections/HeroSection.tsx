
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CallToAction } from '../components/CallToAction';

export const HeroSection = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    console.log('Navigating to signup page');
    // Clear any existing skip_auth flag
    sessionStorage.removeItem('skip_auth');
    navigate('/login?signup=true');
  };
  
  return (
    <section className="container mx-auto px-4 py-28 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#fbbc05] rounded-full opacity-30 -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#fbbc05] rounded-full opacity-20 translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
      
      <div className="flex flex-col items-center relative z-10">
        <div className="max-w-2xl mb-12">
          <h1 className="text-7xl font-bebas-neue leading-none mb-6 font-bold tracking-tight">
            From Meeting Notes to Actionable Tasks in <span className="text-[#fbbc05]">Seconds</span>
          </h1>
          <p className="font-georgia text-xl mb-12 text-gray-800">
            Project Notes eliminates the tedious work of turning notes into action items, saving hours of data entry time and preventing missed details.
          </p>
          <CallToAction 
            onClick={handleSignUp}
            size="large"
            icon={<ArrowRight className="ml-2" />}
          >
            Get Started
          </CallToAction>
        </div>
      </div>
    </section>
  );
};
