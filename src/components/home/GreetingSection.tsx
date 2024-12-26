'use client';

import { Accordion } from '@/components/ui/Accordion';

export function GreetingSection() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
      <Accordion
        title="Greetings Fellow Travelers"
        preview="We're festival-goers, ravers, and dreamers just like you—dedicated to giving back to the community we love."
        content="We're festival-goers, ravers, and dreamers just like you—dedicated to giving back to the community we love. 
          Explore our collection of festival clothing, rave outfits, and essential festival gear designed to keep you 
          stylish, comfortable, and ready for every beat. From festival-ready fits to camping must-haves, we're here 
          to fuel your adventures and celebrate the spirit of peace, love, unity, and respect."
      />
    </div>
  );
}
