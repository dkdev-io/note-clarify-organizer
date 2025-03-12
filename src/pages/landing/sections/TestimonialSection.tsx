
import React from 'react';

export const TestimonialSection = () => {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-3xl mx-auto bg-white p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="font-georgia text-xl space-y-4">
          <p className="font-bold">Every manager has been there.</p>
          <p>You just had a great meeting and talked about the plans for your project.</p>
          <p>You asked everyone to make updates in your project management software.</p>
          <p>The tasks and deadlines you discussed in your meeting are a little more cloudy.</p>
          <p>And you don't quite remember who was responsible for what.</p>
        </div>
        <p className="font-georgia text-xl mt-6 font-bold">
          Project Notes changes that.
        </p>
      </div>
    </section>
  );
};
