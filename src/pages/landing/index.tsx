
import React from 'react';
import { LandingLayout } from './LandingLayout';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { TestimonialSection } from './sections/TestimonialSection';
import { DemoSection } from './sections/DemoSection';
import { PricingSection } from './sections/PricingSection';
import { FaqSection } from './sections/FaqSection';

const Landing = () => {
  return (
    <LandingLayout>
      <HeroSection />
      <FeaturesSection />
      <TestimonialSection />
      <DemoSection />
      <PricingSection />
      <FaqSection />
    </LandingLayout>
  );
};

export default Landing;
