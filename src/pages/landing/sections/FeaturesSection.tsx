
import React from 'react';

export const FeaturesSection = () => {
  return (
    <section className="bg-[#fbbc05] py-20 border-y-4 border-black">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-5xl font-bebas-neue mb-16 font-bold">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-3xl font-bebas-neue mb-4 font-bold">1. Connect or Paste</h3>
            <p className="font-georgia">
              Connect your favorite notetaking tool or paste your meeting notes directly into Project Notes.
            </p>
          </div>
          
          <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-3xl font-bebas-neue mb-4 font-bold">2. AI Transforms</h3>
            <p className="font-georgia">
              Our AI extracts tasks, deadlines, and responsibilities, turning your notes into structured project language.
            </p>
          </div>
          
          <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-3xl font-bebas-neue mb-4 font-bold">3. Automatic Sync</h3>
            <p className="font-georgia">
              After your review, tasks are automatically added to your project management tool for everyone to see.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
