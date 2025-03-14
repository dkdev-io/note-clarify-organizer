
import React from 'react';
import { FeatureCard } from '../components/FeatureCard';
import { FileText, Zap, RefreshCw } from 'lucide-react';

export const FeaturesSection = () => {
  return (
    <section className="bg-[#fbbc05] py-24 border-y-4 border-black relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#e9af00] rounded-full opacity-30 translate-x-1/3 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-[#e9af00] rounded-full opacity-40 -translate-x-1/3 blur-3xl"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-5xl font-bebas-neue mb-4 font-bold tracking-tight">How It Works</h2>
        <p className="font-georgia text-xl max-w-2xl mx-auto mb-16 text-black">
          Our simple three-step process transforms your meeting notes into structured tasks in seconds.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
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
