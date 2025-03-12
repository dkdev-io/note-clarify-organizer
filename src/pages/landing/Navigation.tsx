
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Navigation = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    console.log('Navigating to signup page');
    // Clear any existing skip_auth flag
    sessionStorage.removeItem('skip_auth');
    navigate('/login?signup=true');
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tighter">Project Notes</h1>
        <div className="flex space-x-6 items-center">
          <Link to="/learn-more" className="text-black hover:text-[#fbbc05] font-bold">Learn More</Link>
          <Link to="/about" className="text-black hover:text-[#fbbc05] font-bold">About</Link>
          <Link to="/contact" className="text-black hover:text-[#fbbc05] font-bold">Contact</Link>
          <Button 
            onClick={handleSignUp}
            variant="outline" 
            className="ml-4 flex items-center gap-1 text-black font-bold bg-yellow-400 hover:bg-yellow-500 border-2 border-black hover:border-black"
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};
