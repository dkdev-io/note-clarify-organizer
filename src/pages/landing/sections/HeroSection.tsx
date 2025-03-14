
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="py-28 md:py-36">
      <div className="container px-6 md:px-8">
        <div className="flex flex-col items-center space-y-10 text-center">
          <div className="space-y-5 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Transform Your Meeting Notes Into Actionable Tasks
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-xl/relaxed">
              Our AI-powered tool extracts tasks from your meeting notes and seamlessly integrates them with Motion. 
              Get organized and stay productive with just three clicks.
            </p>
          </div>
          <div>
            <Link to="/app">
              <Button size="lg" className="h-12 px-8 text-base font-bold rounded-full bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-black">
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
