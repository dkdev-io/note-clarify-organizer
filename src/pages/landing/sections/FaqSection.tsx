
import React from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

export const FaqSection = () => {
  const faqs = [
    {
      question: "How does Projectize work?",
      answer: "Projectize uses AI to analyze your meeting notes, identify tasks, assignees, and deadlines, then creates them directly in your project management tool. Simply paste your notes, review the extracted tasks, and send them to your preferred platform with one click."
    },
    {
      question: "What project management tools does Projectize work with?",
      answer: "Currently, Projectize integrates with Motion, with plans to add support for Asana, ClickUp, Monday.com, and other popular project management platforms in the near future."
    }
  ];

  return (
    <section className="container mx-auto px-4 py-28">
      <h2 className="text-5xl font-bebas-neue mb-16 font-bold tracking-tight text-center">Frequently Asked <span className="text-[#fbbc05]">Questions</span></h2>
      
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-xl font-bold text-left py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-lg text-gray-700">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
