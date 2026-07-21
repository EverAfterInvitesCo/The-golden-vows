import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MailOpen, Play } from "lucide-react";

interface IntroExperienceProps {
  onComplete: () => void;
}

export default function IntroExperience({ onComplete }: IntroExperienceProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Fallback timer: if the video is stuck, or if it doesn't play after 8 seconds, allow bypass
    const timer = setTimeout(() => {
      if (!isOpened && !isFading) {
        // Just let it skip to preserve user experience
      }
    }, 9000);
    return () => clearTimeout(timer);
  }, [isOpened, isFading]);

  const handleVideoEnded = () => {
    onComplete();
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration && video.duration > 2.5) {
      // Trigger onComplete slightly early (1.2 seconds before video ends)
      // to cut the trailing static/empty frames and seamlessly transition to the hero video.
      const remainingTime = video.duration - video.currentTime;
      if (remainingTime <= 1.2) {
        onComplete();
      }
    }
  };

  const handleVideoError = () => {
    console.log("Intro video Envelope.mp4 failed or is missing, loading custom interactive envelope fallback.");
    setVideoFailed(true);
  };

  const handleOpenEnvelope = () => {
    setIsOpened(true);
    // Wait for the breaking animation, then fade out
    setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF8F4] overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: isFading ? 0 : 1 }}
        transition={{ duration: 1 }}
      >
        {!videoFailed ? (
          <video
            ref={videoRef}
            src="/assets/Envelope.mp4"
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            onError={handleVideoError}
            onEnded={handleVideoEnded}
            onTimeUpdate={handleTimeUpdate}
          />
        ) : (
          /* Custom Interactive Luxury Wax-Sealed Envelope */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-[#FAF8F4]">
            {/* Background Elegant Frame */}
            <div className="absolute inset-4 md:inset-12 border border-[#C6A96B]/20 pointer-events-none rounded-sm" />
            <div className="absolute inset-6 md:inset-14 border border-[#C6A96B]/10 pointer-events-none rounded-sm" />

            <div className="text-center mb-8 max-w-md z-10">
              <span className="font-serif text-xs tracking-[0.25em] text-[#C6A96B] uppercase block mb-3">
                EverAfter Invites
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-[#2D2D2D] leading-relaxed">
                You have received a personal invitation
              </h2>
              <p className="font-sans text-xs text-[#2D2D2D]/60 mt-2">
                Click the gold wax seal to open the letter
              </p>
            </div>

            {/* Envelope Container */}
            <div className="relative w-full max-w-[420px] aspect-[4/3] bg-white rounded-xl shadow-2xl border border-[#C6A96B]/15 overflow-hidden flex items-center justify-center cursor-pointer z-10 transition-transform hover:scale-[1.01]"
                 onClick={!isOpened ? handleOpenEnvelope : undefined}>
              
              {/* Envelope Flaps (Drawn in CSS/Tailwind) */}
              <div className="absolute inset-0 bg-[#EFE9DF]/30" />
              
              {/* Top Flap */}
              <motion.div 
                className="absolute top-0 inset-x-0 h-1/2 bg-[#EFE9DF]/80 border-b border-[#C6A96B]/10 origin-top"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                animate={isOpened ? { rotateX: 180, translateY: -20, opacity: 0.3 } : {}}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />

              {/* Side Flaps */}
              <div className="absolute left-0 inset-y-0 w-1/2 bg-[#FAF8F4]/50 border-r border-[#C6A96B]/5 pointer-events-none" style={{ clipPath: "polygon(0 0, 50% 50%, 0 100%)" }} />
              <div className="absolute right-0 inset-y-0 w-1/2 bg-[#FAF8F4]/50 border-l border-[#C6A96B]/5 pointer-events-none" style={{ clipPath: "polygon(100% 0, 50% 50%, 100% 100%)" }} />

              {/* Bottom Flap */}
              <div className="absolute bottom-0 inset-x-0 h-1/2 bg-[#FAF8F4]/90 border-t border-[#C6A96B]/10" style={{ clipPath: "polygon(0 100%, 100% 100%, 50% 0)" }} />

              {/* Inner Invitation Card sliding up */}
              <motion.div
                className="absolute w-[85%] h-[80%] bg-[#FAF8F4] border border-[#C6A96B]/30 rounded-md p-6 flex flex-col items-center justify-center shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={isOpened ? { y: -50, opacity: 1, scale: 1.05 } : { opacity: 0.9 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              >
                <span className="font-serif text-[10px] tracking-[0.2em] text-[#C6A96B] uppercase mb-1">Wedding Invitation</span>
                <div className="h-[1px] w-12 bg-[#C6A96B]/30 my-2" />
                <h3 className="font-script text-3xl text-[#C6A96B]">Tasneem & Yehia</h3>
                <p className="font-serif text-[11px] text-[#2D2D2D]/70 mt-2 italic">September 27, 2026</p>
              </motion.div>

              {/* Wax Seal Button (Floating in center) */}
              <motion.div 
                className="absolute z-20 flex items-center justify-center"
                animate={isOpened ? { scale: [1, 1.2, 0], opacity: [1, 1, 0] } : { scale: 1 }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.08 }}
              >
                <div className="relative w-20 h-20 bg-[#9A1B1E] rounded-full border border-[#801012] flex items-center justify-center shadow-lg cursor-pointer">
                  {/* Seal outer ripple ring */}
                  <div className="absolute inset-1 border border-dashed border-[#FAF8F4]/30 rounded-full" />
                  {/* Seal Inner circle with Initials */}
                  <div className="flex flex-col items-center justify-center select-none text-center">
                    <span className="font-script text-2xl text-[#FAF8F4] leading-none drop-shadow-md">
                      T&Y
                    </span>
                    <span className="text-[7px] text-[#FAF8F4]/70 uppercase tracking-widest font-sans font-medium mt-0.5">
                      OPEN
                    </span>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full pointer-events-none" />
                </div>
                {/* Ring of pulse light around seal */}
                <span className="absolute -inset-1 border border-[#C6A96B]/40 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
              </motion.div>
            </div>

            {/* Quick manual bypass button in corner */}
            <button
              onClick={handleVideoEnded}
              className="absolute bottom-6 right-6 font-serif text-xs text-[#C6A96B] hover:text-[#2D2D2D] transition-colors border-b border-[#C6A96B]/30 pb-0.5 tracking-wider"
            >
              Skip Intro
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
