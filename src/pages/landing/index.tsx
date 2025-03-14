
import React from 'react';
import { LandingLayout } from './LandingLayout';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { TestimonialSection } from './sections/TestimonialSection';
import { PricingSection } from './sections/PricingSection';

const Landing = () => {
  return (
    <LandingLayout>
      <HeroSection />
      <FeaturesSection />
      <TestimonialSection />
      <PricingSection />
    </LandingLayout>
  );
};

export default Landing;
