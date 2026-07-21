import { motion } from "motion/react";

export default function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-16 md:py-24 select-none">
      <motion.div
        className="flex items-center gap-4 w-full max-w-[280px] md:max-w-[400px]"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#C6A96B]/35 to-[#C6A96B]/50" />
        
        {/* Minimal Royal Crest Pattern */}
        <div className="relative flex items-center justify-center w-8 h-8">
          <div className="absolute w-2 h-2 border border-[#C6A96B] rotate-45 transform" />
          <div className="absolute w-4 h-4 border border-[#C6A96B]/40 rotate-45 transform" />
          <div className="absolute w-[2px] h-[2px] bg-[#C6A96B] rounded-full" />
        </div>

        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#C6A96B]/35 to-[#C6A96B]/50" />
      </motion.div>
    </div>
  );
}
