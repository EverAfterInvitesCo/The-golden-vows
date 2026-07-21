import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, Heart, Sparkles } from "lucide-react";

export default function CountdownCalendar() {
  const targetDate = new Date("September 27, 2026 18:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Calendar dates for September 2026
  // September 1st, 2026 is a Tuesday.
  // September has 30 days.
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  // Grid layout helper: September 1 is Tuesday, so we need 2 empty slots at start
  const calendarSlots = [
    null, null, // Sunday, Monday empty
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30
  ];

  return (
    <section className="relative px-6 py-12 overflow-hidden bg-[#FAF8F4] z-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-serif text-xs tracking-[0.3em] text-[#C6A96B] uppercase block mb-3">
            Save The Date
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] leading-tight">
            Counting Down to Forever
          </h2>
          <div className="h-[1px] w-20 bg-[#C6A96B]/30 mx-auto mt-4" />
        </motion.div>

        {/* Countdown Cards Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 w-full max-w-2xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl p-5 md:p-6 flex flex-col items-center justify-center border border-[#C6A96B]/20 relative overflow-hidden group hover:border-[#C6A96B]/40 transition-colors"
            >
              {/* Inner gold frame */}
              <div className="absolute inset-1.5 border border-[#C6A96B]/10 rounded-lg group-hover:border-[#C6A96B]/20 transition-colors" />
              
              <span className="font-serif text-3xl md:text-4xl font-light text-[#2D2D2D] tracking-tight relative">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="font-sans text-[10px] tracking-[0.2em] text-[#C6A96B] uppercase mt-2 relative">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Monthly Calendar */}
        <motion.div
          className="w-full max-w-sm glass-card border border-[#C6A96B]/20 rounded-2xl p-6 md:p-8 shadow-xl relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#C6A96B]/15">
            <h3 className="font-serif text-lg tracking-wider text-[#2D2D2D]">
              September 2026
            </h3>
            <div className="flex items-center text-[#C6A96B] gap-1 text-xs">
              <CalendarIcon className="w-4 h-4" />
              <span className="font-serif tracking-widest uppercase">The Wedding</span>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 text-center mb-4">
            {daysOfWeek.map((day, idx) => (
              <span
                key={idx}
                className="font-sans text-[10px] font-semibold tracking-wider text-[#C6A96B] uppercase"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-2 text-center items-center">
            {calendarSlots.map((day, idx) => {
              if (day === null) {
                return <div key={idx} className="h-9" />;
              }

              const isWeddingDay = day === 27;

              return (
                <div key={idx} className="relative h-9 flex items-center justify-center">
                  {isWeddingDay ? (
                    /* Pulsing and Sparkly interactive Wedding Day 27 */
                    <motion.div
                      className="absolute w-9 h-9 flex items-center justify-center cursor-pointer group"
                      whileHover={{ scale: 1.12 }}
                    >
                      {/* Animated heart border overlay */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center text-[#9A1B1E]"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Heart className="w-9 h-9 stroke-[#C6A96B] fill-[#C6A96B]/10 stroke-[1.5]" />
                      </motion.div>

                      {/* Sparkle icon when hovered */}
                      <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-[#C6A96B] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />

                      <span className="relative font-serif text-xs font-semibold text-[#2D2D2D] z-10">
                        {day}
                      </span>
                    </motion.div>
                  ) : (
                    <span className="font-serif text-xs text-[#2D2D2D]/80 hover:text-[#C6A96B] transition-colors cursor-default">
                      {day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          
          <p className="text-center font-serif text-xs text-[#C6A96B]/80 mt-6 italic">
            Sunday, September 27 at 6:00 PM
          </p>
        </motion.div>

      </div>
    </section>
  );
}
