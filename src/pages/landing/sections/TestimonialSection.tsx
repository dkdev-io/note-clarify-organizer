
import React from 'react';

export const TestimonialSection = () => {
  return (
    <section className="container mx-auto px-4 py-28 text-center relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#fbbc05] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-[#fbbc05] rounded-full opacity-15 blur-3xl"></div>
      
      <h2 className="text-5xl font-bebas-neue mb-16 font-bold tracking-tight">The Problem <span className="text-[#fbbc05]">We Solve</span></h2>
      
      <div className="max-w-3xl mx-auto bg-white p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10 transition-all hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="font-georgia text-xl space-y-4">
          <p className="font-bold">Every manager has been there.</p>
          <p>You just had a great meeting and talked about the plans for your project.</p>
          <p>You asked everyone to make updates in your project management software.</p>
          <p>The tasks and deadlines you discussed in your meeting are a little more cloudy.</p>
          <p>And you don't quite remember who was responsible for what.</p>
        </div>
        <p className="font-georgia text-2xl mt-8 font-bold text-[#fbbc05]">
          Project Notes changes that.
        </p>
      </div>
    </section>
  );
};
