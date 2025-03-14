
import React from 'react';
import { FeatureCard } from '../components/FeatureCard';
import { FileText, Zap, RefreshCw } from 'lucide-react';

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent"></div>
      <div className="absolute -top-24 right-0 w-96 h-96 bg-[#fbbc05]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#fbbc05]/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bebas-neue mb-4 font-bold tracking-tight">How It Works</h2>
        <p className="font-georgia text-xl max-w-2xl mx-auto mb-16 text-gray-600">
          Our simple three-step process transforms your meeting notes into structured tasks in seconds.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<FileText size={48} strokeWidth={1.5} />}
            title="1. Connect or Paste"
            description="Connect your favorite notetaking tool or paste your meeting notes directly into Projectize."
          />
          
          <FeatureCard
            icon={<Zap size={48} strokeWidth={1.5} />}
            title="2. AI Transforms"
            description="Our AI extracts tasks, deadlines, and responsibilities, turning your notes into structured project language."
          />
          
          <FeatureCard
            icon={<RefreshCw size={48} strokeWidth={1.5} />}
            title="3. Automatic Sync"
            description="After your review, tasks are automatically added to your project management tool for everyone to see."
          />
        </div>
      </div>
    </section>
  );
};
