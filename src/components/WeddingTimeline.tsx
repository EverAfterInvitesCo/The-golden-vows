import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { 
  Sparkles, 
  Heart, 
  Camera, 
  Utensils, 
  Cake, 
  Music, 
  Smile 
} from "lucide-react";

interface TimelineEvent {
  title: string;
  time: string;
  description: string;
  icon: React.ReactNode;
}

const events: TimelineEvent[] = [
  {
    title: "Welcome Guests",
    time: "6:00 PM",
    description: "Welcome drink reception in the grand palace courtyard, accompanied by classic harp music.",
    icon: <Smile className="w-5 h-5 text-[#C6A96B]" />,
  },
  {
    title: "The Ceremony",
    time: "7:00 PM",
    description: "The exchange of vows and signing of the marriage contract in the royal hall.",
    icon: <Heart className="w-5 h-5 text-[#C6A96B]" />,
  },
  {
    title: "Portrait Sessions",
    time: "8:00 PM",
    description: "Capturing wedding portraits of the beautiful couple with our beloved guests.",
    icon: <Camera className="w-5 h-5 text-[#C6A96B]" />,
  },
  {
    title: "Gala Dinner",
    time: "9:00 PM",
    description: "A customized premium dining experience featuring exquisite traditional and modern cuisine.",
    icon: <Utensils className="w-5 h-5 text-[#C6A96B]" />,
  },
  {
    title: "Cake Cutting",
    time: "10:30 PM",
    description: "Slicing of our majestic 5-tiered wedding cake with celebratory champagne toasts.",
    icon: <Cake className="w-5 h-5 text-[#C6A96B]" />,
  },
  {
    title: "The First Dance",
    time: "11:00 PM",
    description: "Tasneem & Yehia share their first dance as husband and wife under a canopy of stars.",
    icon: <Sparkles className="w-5 h-5 text-[#C6A96B]" />,
  },
  {
    title: "Grand Celebration",
    time: "11:30 PM",
    description: "Live DJ set, dancing, and late-night surprises to celebrate the night away.",
    icon: <Music className="w-5 h-5 text-[#C6A96B]" />,
  },
];

export default function WeddingTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of the timeline section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Map scroll progress (0 to 1) to the flower's Y position (from top to bottom)
  const flowerY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative px-6 py-16 md:py-24 bg-[#FAF8F4] overflow-hidden z-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-serif text-xs tracking-[0.3em] text-[#C6A96B] uppercase block mb-3">
            The Celebration
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] leading-tight">
            Our Wedding Timeline
          </h2>
          <div className="h-[1px] w-20 bg-[#C6A96B]/30 mx-auto mt-4" />
        </motion.div>

        {/* Timeline Container */}
        <div className="relative">
          
          {/* Vertical central line (on md: centered, on mobile: left-aligned) */}
          <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#C6A96B]/10 via-[#C6A96B]/40 to-[#C6A96B]/10 transform md:-translate-x-1/2" />

          {/* Traveling Flower Icon (on md: centered, on mobile: left-aligned) */}
          <motion.div
            className="absolute left-[6px] md:left-1/2 top-4 bottom-4 w-5 pointer-events-none z-20 transform md:-translate-x-1/2"
            style={{ y: flowerY }}
          >
            <div className="w-5 h-5 bg-[#FAF8F4] border-2 border-[#C6A96B] rounded-full flex items-center justify-center shadow-md animate-spin-slow">
              {/* Elegant central floral node */}
              <div className="w-1.5 h-1.5 bg-[#C6A96B] rounded-full" />
            </div>
          </motion.div>

          {/* Timeline Cards */}
          <div className="space-y-12">
            {events.map((event, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className={`flex flex-col md:flex-row relative items-start md:items-center ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Event Marker Dot on Mobile */}
                  <div className="absolute left-[11px] md:hidden w-3 h-3 bg-[#C6A96B] rounded-full border-2 border-[#FAF8F4] z-10 top-5" />

                  {/* Card Content Side */}
                  <motion.div
                    className={`w-full md:w-[45%] pl-10 md:pl-0 ${
                      isEven ? "md:text-right md:pr-10" : "md:pl-10"
                    }`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                  >
                    <div className="glass-card hover:border-[#C6A96B]/50 transition-all duration-500 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md relative group">
                      
                      {/* Subtle hover background highlight */}
                      <div className="absolute inset-1 border border-[#C6A96B]/5 rounded-xl group-hover:border-[#C6A96B]/20 transition-colors" />

                      {/* Header with Time & Icon */}
                      <div className={`flex items-center gap-3 mb-3 ${
                        isEven ? "md:flex-row-reverse" : "flex-row"
                      }`}>
                        <div className="w-10 h-10 rounded-full bg-[#EFE9DF]/50 flex items-center justify-center border border-[#C6A96B]/15 group-hover:scale-105 transition-transform">
                          {event.icon}
                        </div>
                        <div>
                          <span className="font-serif text-[#C6A96B] text-sm tracking-widest font-semibold uppercase block">
                            {event.time}
                          </span>
                          <h3 className="font-serif text-xl text-[#2D2D2D] font-light mt-0.5">
                            {event.title}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="font-sans text-xs text-[#2D2D2D]/75 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </motion.div>

                  {/* Empty balance column for desktop grids */}
                  <div className="hidden md:block w-[10%]" />
                  <div className="hidden md:block w-[45%]" />
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
