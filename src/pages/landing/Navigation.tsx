
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CallToAction } from './components/CallToAction';

export const Navigation = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    console.log('Navigating to signup page');
    // Clear any existing skip_auth flag
    sessionStorage.removeItem('skip_auth');
    navigate('/login?signup=true');
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bebas-neue font-bold tracking-tight flex items-center">
          <span className="text-[#fbbc05] mr-1">P</span>rojectize
        </Link>
        <div className="flex space-x-8 items-center">
          <Link to="/features" className="text-gray-700 hover:text-[#fbbc05] font-medium transition-colors">Features</Link>
          <Link to="/pricing" className="text-gray-700 hover:text-[#fbbc05] font-medium transition-colors">Pricing</Link>
          <Link to="/about" className="text-gray-700 hover:text-[#fbbc05] font-medium transition-colors">About</Link>
          <CallToAction onClick={handleSignUp}>
            Get Started
          </CallToAction>
        </div>
      </div>
    </nav>
  );
};
