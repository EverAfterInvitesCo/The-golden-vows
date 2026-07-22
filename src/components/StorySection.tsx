import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Quote, Edit3, Check, RefreshCw } from "lucide-react";

export default function StorySection() {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("How We Met");
  const [quote, setQuote] = useState(
    "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine."
  );
  const [author, setAuthor] = useState("Maya Angelou");
  const [story, setStory] = useState(
    "Our story began on a warm autumn evening, a simple meeting of eyes that would forever alter the course of our lives. What started as a casual conversation about literature and travel slowly blossomed into a profound connection that words could scarcely define.\n\nThrough shared laughter, silent support, and endless adventures across lands and dreams, we realized we had found our safe harbor in each other. Now, as we stand on the threshold of our forever, we are overjoyed to embark on this beautiful sacred bond surrounded by those we love most."
  );
  const [imageUrl, setImageUrl] = useState(
    `${import.meta.env.BASE_URL}download.jpg`
  );

  // Load from localStorage if exists
  useEffect(() => {
    const savedTitle = localStorage.getItem("wedding_story_title");
    const savedQuote = localStorage.getItem("wedding_story_quote");
    const savedAuthor = localStorage.getItem("wedding_story_author");
    const savedStory = localStorage.getItem("wedding_story_story");
    const savedImage = localStorage.getItem("wedding_story_image");

    if (savedTitle) setTitle(savedTitle);
    if (savedQuote) setQuote(savedQuote);
    if (savedAuthor) setAuthor(savedAuthor);
    if (savedStory) setStory(savedStory);
    if (savedImage && savedImage !== "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200") setImageUrl(savedImage);
  }, []);

  const handleSave = () => {
    localStorage.setItem("wedding_story_title", title);
    localStorage.setItem("wedding_story_quote", quote);
    localStorage.setItem("wedding_story_author", author);
    localStorage.setItem("wedding_story_story", story);
    localStorage.setItem("wedding_story_image", imageUrl);
    setIsEditing(false);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset our story to the default text?")) {
      setTitle("How We Met");
      setQuote("In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.");
      setAuthor("Maya Angelou");
      setStory("Our story began on a warm autumn evening, a simple meeting of eyes that would forever alter the course of our lives. What started as a casual conversation about literature and travel slowly blossomed into a profound connection that words could scarcely define.\n\nThrough shared laughter, silent support, and endless adventures across lands and dreams, we realized we had found our safe harbor in each other. Now, as we stand on the threshold of our forever, we are overjoyed to embark on this beautiful sacred bond surrounded by those we love most.");
      setImageUrl(`${import.meta.env.BASE_URL}download.jpg`);
      
      localStorage.removeItem("wedding_story_title");
      localStorage.removeItem("wedding_story_quote");
      localStorage.removeItem("wedding_story_author");
      localStorage.removeItem("wedding_story_story");
      localStorage.removeItem("wedding_story_image");
    }
  };

  return (
    <section className="relative px-6 py-16 md:py-24 bg-[#FAF8F4] overflow-hidden z-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Title Container */}
        <div className="flex items-center justify-between mb-12">
          <div className="w-12 h-[1px]" /> {/* Spacer */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-serif text-xs tracking-[0.3em] text-[#C6A96B] uppercase block mb-3">
              Our Journey
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] leading-tight">
              {title}
            </h2>
            <div className="h-[1px] w-20 bg-[#C6A96B]/30 mx-auto mt-4" />
          </motion.div>

          {/* Quick Edit button */}
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C6A96B]/30 hover:bg-[#C6A96B]/10 hover:border-[#C6A96B] transition-colors font-serif text-[11px] text-[#C6A96B] uppercase tracking-wider"
          >
            {isEditing ? (
              <>
                <Check className="w-3 h-3" /> Save Story
              </>
            ) : (
              <>
                <Edit3 className="w-3 h-3" /> Edit Story
              </>
            )}
          </button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Image Container */}
          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Elegant Background Gold Offset Frame */}
            <div className="absolute inset-4 -right-4 -bottom-4 border border-[#C6A96B]/30 rounded-2xl pointer-events-none z-0" />

            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#C6A96B]/15 bg-white aspect-[3/4] z-10 group">
              <img
                src={imageUrl}
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1200";
                }}
                alt="Our Story"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>

            {/* Editable Image Link Input */}
            {isEditing && (
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-[#C6A96B] shadow-lg z-20">
                <label className="block text-[10px] uppercase tracking-wider text-[#C6A96B] font-semibold mb-1">
                  Image URL (Paste Unsplash or Pexels link)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs p-1.5 border border-[#C6A96B]/20 rounded bg-transparent focus:outline-none focus:border-[#C6A96B]"
                />
              </div>
            )}
          </motion.div>

          {/* Text/Content Container */}
          <motion.div
            className="lg:col-span-7 space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Elegant Quote Section */}
            <div className="relative pl-8 md:pl-12 py-2">
              <Quote className="absolute left-0 top-0 w-8 h-8 md:w-10 md:h-10 text-[#C6A96B]/25 transform rotate-180" />
              
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className="w-full font-serif italic text-base md:text-lg text-[#2D2D2D]/85 p-2 border border-[#C6A96B]/30 rounded bg-white focus:outline-none focus:border-[#C6A96B]"
                    rows={2}
                    placeholder="Inspirational wedding quote..."
                  />
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-1/2 font-serif text-xs text-[#C6A96B] p-1.5 border border-[#C6A96B]/20 rounded bg-white focus:outline-none"
                    placeholder="Quote Author"
                  />
                </div>
              ) : (
                <>
                  <p className="font-serif italic text-base md:text-lg text-[#2D2D2D]/85 leading-relaxed">
                    "{quote}"
                  </p>
                  <span className="font-serif text-xs text-[#C6A96B] tracking-wider block mt-2 uppercase">
                    — {author}
                  </span>
                </>
              )}
            </div>

            {/* Paragraph / Narrative */}
            <div className="prose prose-sm text-[#2D2D2D]/85 font-sans leading-relaxed">
              {isEditing ? (
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full text-xs md:text-sm p-3 border border-[#C6A96B]/30 rounded bg-white focus:outline-none focus:border-[#C6A96B]"
                  rows={8}
                  placeholder="Share how you met..."
                />
              ) : (
                story.split("\n\n").map((para, idx) => (
                  <p key={idx} className="mb-4">
                    {para}
                  </p>
                ))
              )}
            </div>

            {/* Edit actions bottom row */}
            {isEditing && (
              <div className="flex gap-4 pt-4 border-t border-[#C6A96B]/15">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-[#C6A96B] text-white hover:bg-[#B5985A] transition-colors rounded-full font-serif text-xs uppercase tracking-wider"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-[#C6A96B]/30 hover:bg-[#C6A96B]/10 rounded-full font-serif text-xs uppercase tracking-wider text-[#C6A96B]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs text-red-700/70 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Reset to defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Default
                </button>
              </div>
            )}
          </motion.div>

        </div>

      </div>
    </section>
  );
}
