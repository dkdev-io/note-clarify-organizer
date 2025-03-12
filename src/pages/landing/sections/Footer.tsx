
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-black text-white py-10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bebas-neue mb-4">Project Notes</h2>
        <p className="font-georgia mb-6">© 2023 Project Notes. All rights reserved.</p>
        <div className="flex justify-center space-x-6">
          <Link to="/terms" className="text-white hover:text-[#fbbc05] font-georgia">Terms</Link>
          <Link to="/privacy" className="text-white hover:text-[#fbbc05] font-georgia">Privacy</Link>
          <Link to="/contact" className="text-white hover:text-[#fbbc05] font-georgia">Contact</Link>
        </div>
      </div>
    </footer>
  );
};
