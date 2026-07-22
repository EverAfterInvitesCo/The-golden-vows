import React, { useState } from "react";
import { motion } from "motion/react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
let rawSupabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "https://pvuszjcuvkycprbggweo.supabase.co";
if (rawSupabaseUrl) {
  rawSupabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}
const supabaseUrl = rawSupabaseUrl;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_xPvR3HkIozZaxNLxPCIRfw_dvljpvdV";
const supabase = supabaseUrl && supabaseUrl.startsWith("http") && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const WEDDING_SLUG = (import.meta as any).env?.VITE_WEDDING_SLUG || "tasneem-yehia";

export default function RSVPSection() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState("true"); // "true" for attending, "false" for not
  const [guestsCount, setGuestsCount] = useState("1");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [wellWishes, setWellWishes] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setStatusMessage({ type: "error", text: "Supabase is not configured. Please check your environment variables." });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        attending: attending === "true", // Converts to boolean matching your schema
        guestsCount: parseInt(guestsCount, 10) || 1,
        dietaryNotes: dietaryNotes.trim(),
        wellWishes: wellWishes.trim(),
        wedding_slug: WEDDING_SLUG,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("rsvps")
        .insert([payload]);

      if (error) {
        throw new Error(error.message);
      }

      setStatusMessage({ type: "success", text: "Thank you! Your RSVP has been received successfully." });
      // Reset form
      setFullName("");
      setPhone("");
      setEmail("");
      setGuestsCount("1");
      setDietaryNotes("");
      setWellWishes("");
    } catch (err: any) {
      console.error("RSVP error:", err);
      setStatusMessage({ type: "error", text: err.message || "Failed to submit RSVP. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative px-6 py-20 md:py-28 bg-[#FAF8F4] overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#C6A96B_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.15]" />

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-serif text-xs tracking-[0.3em] text-[#C6A96B] uppercase block mb-3">
            Be Our Guest
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#2D2D2D] leading-tight">
            Wedding RSVP
          </h2>
          <p className="font-sans text-[11px] text-[#2D2D2D]/60 tracking-wider uppercase mt-3 max-w-md mx-auto">
            Please respond by the 1st of September to help us finalize our special celebration.
          </p>
          <div className="h-[1px] w-20 bg-[#C6A96B]/30 mx-auto mt-4" />
        </motion.div>

        {/* Card Form */}
        <motion.div
          className="bg-white/80 backdrop-blur-md border border-[#C6A96B]/30 rounded-2xl p-8 md:p-12 shadow-2xl relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-[#C6A96B]/50" />
          <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-[#C6A96B]/50" />
          <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-[#C6A96B]/50" />
          <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-[#C6A96B]/50" />

          {!supabase ? (
            <div className="text-center py-10 px-4 border border-dashed border-red-300 rounded-xl bg-red-50/50">
              <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
              <p className="text-xs text-red-800 font-sans">
                Supabase is not configured. Please check your environment variables.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {statusMessage && (
                <div className={`p-4 rounded-xl text-xs flex items-center gap-3 ${
                  statusMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {statusMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  <span className="font-sans leading-relaxed">{statusMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div>
                  <label className="font-serif text-[11px] uppercase tracking-widest text-[#C6A96B] block mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Ahmed"
                    disabled={submitting}
                    className="w-full p-3 border-b border-[#C6A96B]/30 text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] text-[#2D2D2D]"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="font-serif text-[11px] uppercase tracking-widest text-[#C6A96B] block mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    disabled={submitting}
                    className="w-full p-3 border-b border-[#C6A96B]/30 text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] text-[#2D2D2D]"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Email Address */}
                <div>
                  <label className="font-serif text-[11px] uppercase tracking-widest text-[#C6A96B] block mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    disabled={submitting}
                    className="w-full p-3 border-b border-[#C6A96B]/30 text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] text-[#2D2D2D]"
                  />
                </div>

                {/* Attendance */}
                <div>
                  <label className="font-serif text-[11px] uppercase tracking-widest text-[#C6A96B] block mb-2">
                    Will You Attend? *
                  </label>
                  <select
                    value={attending}
                    onChange={(e) => setAttending(e.target.value)}
                    disabled={submitting}
                    className="w-full p-3 border-b border-[#C6A96B]/30 text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] text-[#2D2D2D] cursor-pointer"
                  >
                    <option value="true">Joyfully Attending</option>
                    <option value="false">Regretfully Decline</option>
                  </select>
                </div>

              </div>

              {/* Number of Guests */}
              {attending === "true" && (
                <div>
                  <label className="font-serif text-[11px] uppercase tracking-widest text-[#C6A96B] block mb-2">
                    Number of Guests (Including You)
                  </label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(e.target.value)}
                    disabled={submitting}
                    className="w-full p-3 border-b border-[#C6A96B]/30 text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] text-[#2D2D2D] cursor-pointer"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                  </select>
                </div>
              )}

              {/* Dietary Requirements */}
              <div>
                <label className="font-serif text-[11px] uppercase tracking-widest text-[#C6A96B] block mb-2">
                  Dietary Requirements or Notes
                </label>
                <input
                  type="text"
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  placeholder="e.g. Vegetarian, Allergies, etc."
                  disabled={submitting}
                  className="w-full p-3 border-b border-[#C6A96B]/30 text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] text-[#2D2D2D]"
                />
              </div>

              {/* Well Wishes */}
              <div>
                <label className="font-serif text-[11px] uppercase tracking-widest text-[#C6A96B] block mb-2">
                  Well Wishes for the Couple
                </label>
                <textarea
                  rows={3}
                  value={wellWishes}
                  onChange={(e) => setWellWishes(e.target.value)}
                  placeholder="Leave a sweet message for the bride and groom..."
                  disabled={submitting}
                  className="w-full p-3 border border-[#C6A96B]/30 rounded-xl text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] text-[#2D2D2D] resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#C6A96B] hover:bg-[#B5985A] text-white rounded-full font-serif text-xs uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending RSVP...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send RSVP
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </motion.div>

      </div>
    </section>
  );
}
