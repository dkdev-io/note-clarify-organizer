
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-10 text-center">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-gray-900">
              Transform Your Meeting Notes Into Actionable Tasks
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our AI-powered tool extracts tasks from your meeting notes and seamlessly integrates them with Motion. 
              Get organized and stay productive with minimal effort.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/app">
              <Button size="lg" className="h-12 px-8 text-base">
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
