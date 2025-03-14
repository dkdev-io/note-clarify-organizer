
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <h3 className="text-2xl font-bebas-neue mb-4 text-[#fbbc05]">Projectize</h3>
            <p className="font-georgia text-gray-400">
              Transforming meeting notes into actionable tasks in seconds.
            </p>
          </div>
          
          <div>
            <h4 className="text-xl font-bebas-neue mb-4 text-[#fbbc05]">Product</h4>
            <ul className="space-y-2 font-georgia">
              <li><Link to="/features" className="text-gray-400 hover:text-[#fbbc05]">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-[#fbbc05]">Pricing</Link></li>
              <li><Link to="/integrations" className="text-gray-400 hover:text-[#fbbc05]">Integrations</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bebas-neue mb-4 text-[#fbbc05]">Company</h4>
            <ul className="space-y-2 font-georgia">
              <li><Link to="/about" className="text-gray-400 hover:text-[#fbbc05]">About</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-[#fbbc05]">Blog</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-[#fbbc05]">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bebas-neue mb-4 text-[#fbbc05]">Legal</h4>
            <ul className="space-y-2 font-georgia">
              <li><Link to="/terms" className="text-gray-400 hover:text-[#fbbc05]">Terms</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-[#fbbc05]">Privacy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8 text-center font-georgia text-gray-400">
          <p>Projectize was created by <a href="https://DKDev.io" className="text-[#fbbc05] hover:underline" target="_blank" rel="noopener noreferrer">DKDev</a></p>
          <p className="mt-2">© 2025 Projectize. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
