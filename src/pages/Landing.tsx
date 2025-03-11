
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b-4 border-black">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tighter">Project Notes</h1>
          <div className="flex space-x-6">
            <Link to="/learn-more" className="text-black hover:text-[#fbbc05] font-bold">Learn More</Link>
            <Link to="/about" className="text-black hover:text-[#fbbc05] font-bold">About</Link>
            <Link to="/contact" className="text-black hover:text-[#fbbc05] font-bold">Contact</Link>
            <Link to="/connect" className="text-black hover:text-[#fbbc05] font-bold">Connect</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-6xl font-bebas-neue leading-none mb-6">FROM MEETING NOTES TO ACTIONABLE TASKS IN SECONDS</h1>
            <p className="font-georgia text-xl mb-10">
              Project Notes eliminates the tedious work of turning notes into action items, saving hours of data entry time and preventing missed details.
            </p>
            <Link to="/login">
              <Button className="bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-black font-bold text-lg px-10 py-7 rounded-none border-black border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
                Sign Up <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
          <div className="md:w-1/2">
            <div className="bg-[#fbbc05] p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <img 
                src="/placeholder.svg" 
                alt="Project Notes App Preview" 
                className="w-full border-4 border-black"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-[#fbbc05] py-20 border-y-4 border-black">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bebas-neue text-center mb-16">HOW IT WORKS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-3xl font-bebas-neue mb-4">1. CONNECT OR PASTE</h3>
              <p className="font-georgia">
                Connect your favorite notetaking tool or paste your meeting notes directly into Project Notes.
              </p>
            </div>
            
            <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-3xl font-bebas-neue mb-4">2. AI TRANSFORMS</h3>
              <p className="font-georgia">
                Our AI extracts tasks, deadlines, and responsibilities, turning your notes into structured project language.
              </p>
            </div>
            
            <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-3xl font-bebas-neue mb-4">3. AUTOMATIC SYNC</h3>
              <p className="font-georgia">
                After your review, tasks are automatically added to your project management tool for everyone to see.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Pain Point Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-white p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-georgia text-xl italic mb-6">
            "Every manager has been there. You just had a great meeting and talked about the plans for your project. You asked everyone to make updates in your project management software. The tasks and deadlines you discussed in your meeting are a little more cloudy. And you don't quite remember who was responsible for what."
          </p>
          <p className="font-georgia text-xl">
            Project Notes changes that.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-20 border-y-4 border-black">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bebas-neue text-center mb-16">PRICING</h2>
          
          <div className="max-w-md mx-auto bg-white p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-5xl font-bebas-neue mb-2">$19/month</h3>
            <p className="font-georgia text-lg mb-6">Everything you need to streamline your project management</p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start font-georgia">
                <CheckCircle className="h-6 w-6 text-[#fbbc05] mr-3 flex-shrink-0" />
                <span>Unlimited note processing</span>
              </li>
              <li className="flex items-start font-georgia">
                <CheckCircle className="h-6 w-6 text-[#fbbc05] mr-3 flex-shrink-0" />
                <span>Integration with popular project management tools</span>
              </li>
              <li className="flex items-start font-georgia">
                <CheckCircle className="h-6 w-6 text-[#fbbc05] mr-3 flex-shrink-0" />
                <span>Advanced AI task extraction</span>
              </li>
              <li className="flex items-start font-georgia">
                <CheckCircle className="h-6 w-6 text-[#fbbc05] mr-3 flex-shrink-0" />
                <span>Email notifications</span>
              </li>
            </ul>
            
            <Link to="/login">
              <Button className="w-full bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-black font-bold text-lg py-6 rounded-none border-black border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bebas-neue mb-4">Project Notes</h2>
          <p className="font-georgia mb-6">© 2023 Project Notes. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            <Link to="/terms" className="text-white hover:text-[#fbbc05] font-georgia">Terms</Link>
            <Link to="/privacy" className="text-white hover:text-[#fbbc05] font-georgia">Privacy</Link>
            <Link to="/contact" className="text-white hover:text-[#fbbc05] font-georgia">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
