
import React from 'react';

export const DemoSection = () => {
  return (
    <section className="container mx-auto px-4 py-28 text-center relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#fbbc05] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-[#fbbc05] rounded-full opacity-15 blur-3xl"></div>
      
      <h2 className="text-5xl font-bebas-neue mb-4 font-bold tracking-tight">Watch <span className="text-black">Project</span><span className="text-[#fbbc05]">ize</span> in Action</h2>
      <p className="text-xl font-georgia mb-16 text-gray-800">See <span className="text-black">Project</span><span className="text-[#fbbc05]">ize</span> go from notes to tasks in under thirty seconds.</p>
      
      <div className="max-w-4xl mx-auto bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
        <p className="text-gray-500 text-lg">Video coming soon</p>
      </div>
    </section>
  );
};
