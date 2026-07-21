import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronDown, 
  Instagram, 
  Facebook, 
  Music, 
  MapPin, 
  Heart,
  Volume2,
  VolumeX,
  Sparkles
} from "lucide-react";

// Components
import IntroExperience from "./components/IntroExperience";
import SectionDivider from "./components/SectionDivider";
import CountdownCalendar from "./components/CountdownCalendar";
import StorySection from "./components/StorySection";
import WeddingTimeline from "./components/WeddingTimeline";
import WeddingVenue from "./components/WeddingVenue";
import RSVPSection from "./components/RSVPSection";
import PhotoUploadSection from "./components/PhotoUploadSection";
import OrganizerPortal from "./components/OrganizerPortal";

export default function App() {
  const [showWebsite, setShowWebsite] = useState(false);
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Floating Petals State
  const [petals, setPetals] = useState<{ id: number; left: number; delay: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    // Generate petals positions for floating background effect
    const newPetals = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage
      delay: Math.random() * 8, // seconds
      duration: 10 + Math.random() * 12, // seconds
      size: 8 + Math.random() * 12, // pixels
    }));
    setPetals(newPetals);
  }, []);

  const handleHeroVideoError = () => {
    console.log("Hero video Window.mp4 failed or is missing, loading custom beautiful slow-motion scenery loop.");
    setHeroVideoFailed(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#2D2D2D] relative overflow-x-hidden selection:bg-[#C6A96B]/25 selection:text-[#2D2D2D]">
      
      {/* 1. INTRO EXPERIENCE */}
      <AnimatePresence>
        {!showWebsite && (
          <IntroExperience onComplete={() => setShowWebsite(true)} />
        )}
      </AnimatePresence>

      {/* 2. MAIN WEBSITE SITE */}
      {showWebsite && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "linear" }}
          className="relative w-full"
        >
          {/* Subtle Ambient Background Music or Audio controls (Optional high-end feature) */}
          <div className="fixed top-6 right-6 z-40 flex items-center gap-2">
            {/* Elegant sound indicator/music can go here */}
          </div>

          {/* Floating Rose Petals / Flower Accents for luxury romance vibe */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
            {petals.map((petal) => (
              <motion.div
                key={petal.id}
                className="absolute bg-gradient-to-br from-[#C6A96B]/15 to-[#EFE9DF]/10 rounded-tr-[50%] rounded-bl-[50%]"
                style={{
                  left: `${petal.left}%`,
                  width: `${petal.size}px`,
                  height: `${petal.size}px`,
                  top: "-5%",
                }}
                animate={{
                  top: "105%",
                  x: [0, 40, -40, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: petal.duration,
                  delay: petal.delay,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* ================= HERO SECTION ================= */}
          <header className="relative w-full h-screen flex flex-col items-center justify-center text-center overflow-hidden z-10">
            {/* Background Cinematic Video Loop */}
            {!heroVideoFailed ? (
              <video
                src={`${import.meta.env.BASE_URL}Window.mp4`}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                onError={handleHeroVideoError}
              />
            ) : (
              /* Fallback Luxury Scenery Video Link (Mixkit stable CDN) */
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-wedding-rings-and-flowers-40243-large.mp4"
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            )}

            {/* Slightly dark premium overlay */}
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] pointer-events-none" />

            {/* Content Card with elegant entry stagger */}
            <div className="relative z-10 px-6 max-w-3xl flex flex-col items-center">
              
              {/* Monogram crest */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.2 }}
                className="w-16 h-16 border border-[#C6A96B]/40 rounded-full flex items-center justify-center mb-6 relative group"
              >
                <div className="absolute inset-0.5 border border-[#C6A96B]/20 rounded-full animate-pulse" />
                <span className="font-serif text-lg text-[#C6A96B] tracking-wider uppercase font-light">
                  TY
                </span>
              </motion.div>

              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="font-serif text-xs md:text-sm tracking-[0.35em] text-[#C6A96B] uppercase block mb-4"
              >
                EverAfter Invites
              </motion.span>

              {/* Title Names */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.6 }}
                className="font-script text-6xl md:text-8xl text-white drop-shadow-md py-2 italic font-light selection:bg-[#C6A96B]/40"
              >
                Tasneem & Yehia
              </motion.h1>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.9 }}
                className="mt-6 flex flex-col items-center"
              >
                <h3 className="font-serif text-xl md:text-2xl text-white tracking-widest font-light">
                  "Tied the Knot"
                </h3>
                <p className="font-serif text-xs md:text-sm text-[#C6A96B] mt-2 tracking-[0.2em] uppercase">
                  September 27, 2026
                </p>
              </motion.div>

            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="absolute bottom-10 z-10 flex flex-col items-center gap-1 cursor-pointer select-none"
              onClick={() => {
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: "smooth",
                });
              }}
            >
              <span className="font-serif text-[10px] tracking-[0.25em] text-[#C6A96B] uppercase">
                Scroll Down
              </span>
              <ChevronDown className="w-4 h-4 text-[#C6A96B]" />
            </motion.div>
          </header>

          {/* ================= SECTION 2: THE INVITATION ================= */}
          <section className="relative px-6 py-24 md:py-32 bg-[#FAF8F4] z-10 overflow-hidden">
            {/* Elegant Background Accents */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-[#C6A96B]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-[#C6A96B]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            {/* Vintage Ornamental Corner Borders */}
            <div className="absolute top-12 left-12 w-10 h-10 border-t border-l border-[#C6A96B]/20 hidden md:block" />
            <div className="absolute top-12 right-12 w-10 h-10 border-t border-r border-[#C6A96B]/20 hidden md:block" />
            <div className="absolute bottom-12 left-12 w-10 h-10 border-b border-l border-[#C6A96B]/20 hidden md:block" />
            <div className="absolute bottom-12 right-12 w-10 h-10 border-b border-r border-[#C6A96B]/20 hidden md:block" />

            <div className="max-w-6xl mx-auto">
              {/* Main Premium Invitation Card */}
              <div className="relative bg-[#FAF8F4]/40 backdrop-blur-md rounded-3xl p-8 md:p-16 border border-[#C6A96B]/15 shadow-[0_20px_50px_rgba(198,169,107,0.04)]">
                
                {/* Thin internal gold double border frame */}
                <div className="absolute inset-3 border border-[#C6A96B]/10 rounded-[22px] pointer-events-none" />
                <div className="absolute inset-4 border border-[#C6A96B]/5 rounded-[21px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
                  
                  {/* Left Column: Staggered text invitation message */}
                  <motion.div
                    className="w-full md:w-1/2 text-center md:text-left space-y-6"
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <div className="space-y-3">
                      <span className="font-sans text-[10px] md:text-xs tracking-[0.4em] text-[#C6A96B] uppercase font-semibold block">
                        The Wedding Celebration
                      </span>
                      <div className="h-[1px] w-12 bg-[#C6A96B]/30 mx-auto md:mx-0" />
                    </div>

                    <h2 className="font-serif text-3xl md:text-5xl text-[#2D2D2D] leading-snug font-light tracking-wide">
                      You are cordially invited to our special day
                    </h2>
                    
                    <p className="font-script text-5xl md:text-6xl text-[#C6A96B] italic font-normal py-2 select-none">
                      Tasneem & Yehia
                    </p>
                    
                    <p className="font-body text-sm md:text-base text-[#2D2D2D]/70 leading-relaxed max-w-lg italic">
                      "Together with our families, we request the honor of your presence to celebrate the beginning of our forever, bound by love, blessings, and cherishable memories."
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                      <span className="font-sans text-[9px] tracking-[0.25em] text-[#C6A96B] uppercase border-y border-[#C6A96B]/20 py-2 px-3">
                        Save The Date
                      </span>
                      <span className="font-serif text-sm text-[#2D2D2D]/60 tracking-wider">
                        September 27, 2026
                      </span>
                    </div>
                  </motion.div>

                  {/* Right Column: Kids Illustration / Childhood Picture with elegant frame */}
                  <motion.div
                    className="w-full md:w-1/2 flex justify-center md:justify-end"
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  >
                    <div className="relative w-full max-w-[420px] group">
                      
                      {/* Decorative Gold Rings Background Behind Image */}
                      <div className="absolute -inset-4 border border-[#C6A96B]/20 rounded-2xl rotate-2 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" />
                      <div className="absolute -inset-4 border border-[#C6A96B]/10 rounded-2xl -rotate-2 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" />
                      
                      {/* Glassmorphism Frame wrapper */}
                      <div className="relative overflow-hidden rounded-2xl bg-white/40 p-4 border border-[#C6A96B]/15 shadow-xl">
                        <img
                          src={`${import.meta.env.BASE_URL}kids.png`}
                          onError={(e) => {
                            console.log("kids.png not found, loading childhood/vintage style fallback.");
                            e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200";
                          }}
                          alt="Tasneem and Yehia Childhood"
                          className="w-full h-auto max-h-[380px] object-contain rounded-lg transition-transform duration-700 group-hover:scale-102"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      {/* Subtle elegant gold emblem overlay */}
                      <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#FAF8F4] border border-[#C6A96B]/30 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                        <Heart className="w-4 h-4 text-[#C6A96B] fill-[#C6A96B]/10 stroke-[1.5]" />
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* ================= SECTION 3: QURANIC VERSE ================= */}
          <section className="relative px-6 py-16 md:py-24 bg-[#FAF8F4] z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              
              {/* Amiri Arabic script font verse */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="px-4"
              >
                <p className="font-arabic text-3xl md:text-4xl text-[#2D2D2D] leading-[1.8] text-center antialiased">
                  وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ
                </p>
              </motion.div>

              {/* Gold heart line ornament */}
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="h-[1px] w-8 bg-[#C6A96B]/20" />
                <Heart className="w-4 h-4 text-[#C6A96B]/60 stroke-[1]" />
                <div className="h-[1px] w-8 bg-[#C6A96B]/20" />
              </div>

              {/* English Surah Ar-Rum Translation */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="px-6"
              >
                <p className="font-serif italic text-base md:text-lg text-[#2D2D2D]/80 leading-relaxed max-w-2xl mx-auto">
                  "And among His Signs is this, that He created for you mates from among yourselves, that ye may dwell in tranquillity with them, and He has put love and mercy between your (hearts): verily in that are Signs for those who reflect."
                </p>
                <span className="font-serif text-[11px] text-[#C6A96B] uppercase tracking-[0.25em] block mt-4">
                  Surah Ar-Rum — 30:21
                </span>
              </motion.div>

            </div>
          </section>

          <SectionDivider />

          {/* ================= SECTION 4: COUNTDOWN & CALENDAR ================= */}
          <CountdownCalendar />

          <SectionDivider />

          {/* ================= SECTION 5: OUR STORY ================= */}
          <StorySection />

          <SectionDivider />

          {/* ================= SECTION 6: WEDDING TIMELINE ================= */}
          <WeddingTimeline />

          <SectionDivider />

          {/* ================= SECTION 7: VENUE ================= */}
          <WeddingVenue />

          <SectionDivider />

          {/* ================= SECTION 8: RSVP FORM ================= */}
          <RSVPSection />

          <SectionDivider />

          {/* ================= SECTION 9: PHOTO UPLOAD & WALL ================= */}
          <PhotoUploadSection />

          <SectionDivider />

          {/* ================= SECTION 10: ORGANIZER PORTAL ================= */}
          <OrganizerPortal />

          {/* ================= FOOTER ================= */}
          <footer className="relative bg-[#FAF8F4] border-t border-[#C6A96B]/15 pt-16 pb-12 px-6 z-10">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
              
              {/* Intertwined Wedding Rings Logo */}
              <motion.div
                className="relative w-20 h-14 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              >
                {/* Left Ring */}
                <div className="absolute w-10 h-10 border-2 border-[#C6A96B] rounded-full left-3 top-2 flex items-center justify-center shadow-sm">
                  <span className="font-serif text-[9px] text-[#C6A96B] font-bold">T</span>
                </div>
                {/* Right Ring */}
                <div className="absolute w-10 h-10 border-2 border-[#C6A96B] rounded-full right-3 bottom-2 flex items-center justify-center shadow-sm">
                  <span className="font-serif text-[9px] text-[#C6A96B] font-bold">Y</span>
                </div>
                {/* Sparkle badge */}
                <Sparkles className="absolute top-1 right-2 w-3 h-3 text-[#C6A96B] animate-pulse" />
              </motion.div>

              {/* Title & Brand */}
              <div className="space-y-1">
                <span className="font-serif text-[10px] tracking-[0.3em] text-[#C6A96B] uppercase block">
                  EverAfter Invites
                </span>
                <p className="font-serif text-sm text-[#2D2D2D]/75 italic mt-1">
                  Made with love by EverAfterInvites
                </p>
              </div>

              {/* Social Icons Links with gold hover effects */}
              <div className="flex gap-6 py-4">
                <a
                  href="https://www.instagram.com/_everafterinvites_/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full border border-[#C6A96B]/25 text-[#2D2D2D]/70 hover:text-white hover:bg-[#C6A96B] hover:border-[#C6A96B] transition-all duration-300 transform hover:scale-110"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61591686334310"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full border border-[#C6A96B]/25 text-[#2D2D2D]/70 hover:text-white hover:bg-[#C6A96B] hover:border-[#C6A96B] transition-all duration-300 transform hover:scale-110"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://www.tiktok.com/@_everafterinvites_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full border border-[#C6A96B]/25 text-[#2D2D2D]/70 hover:text-white hover:bg-[#C6A96B] hover:border-[#C6A96B] transition-all duration-300 transform hover:scale-110"
                  title="TikTok"
                >
                  <Music className="w-4 h-4" />
                </a>
              </div>

              {/* Copyright */}
              <div className="pt-6 border-t border-[#C6A96B]/10 w-full text-center">
                <span className="font-sans text-[10px] text-[#2D2D2D]/40 uppercase tracking-widest">
                  © 2026 EVERAFTERINVITES. ALL RIGHTS RESERVED.
                </span>
              </div>

            </div>
          </footer>

        </motion.div>
      )}

    </div>
  );
}
