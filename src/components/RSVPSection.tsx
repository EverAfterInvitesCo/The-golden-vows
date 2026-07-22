import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client with environment variables or secure defaults
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

let cachedRsvpTable: "rsvps" | "guest_rsvps" | null = null;

async function getActiveRsvpTable(): Promise<"rsvps" | "guest_rsvps"> {
  if (cachedRsvpTable) return cachedRsvpTable;
  if (!supabase) return "rsvps";

  try {
    const { error } = await supabase
      .from("rsvps")
      .select("id")
      .limit(1);
    
    if (!error) {
      cachedRsvpTable = "rsvps";
      return "rsvps";
    }
  } catch (err) {
    // Ignore
  }

  try {
    const { error } = await supabase
      .from("guest_rsvps")
      .select("id")
      .limit(1);
    
    if (!error) {
      cachedRsvpTable = "guest_rsvps";
      return "guest_rsvps";
    }
  } catch (err) {
    // Ignore
  }

  cachedRsvpTable = "rsvps";
  return "rsvps";
}

export default function RSVPSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    number_of_guests: "1",
    attendance: "attending",
    dietary_requirements: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple Validation
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      setStatus("error");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Please enter your phone number.");
      setStatus("error");
      return;
    }

    setStatus("submitting");

    if (!supabase) {
      setErrorMessage("Supabase is not configured. Please check your environment variables.");
      setStatus("error");
      return;
    }

    try {
      const table = await getActiveRsvpTable();
      
      const payload = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        number_of_guests: parseInt(formData.number_of_guests, 10) || 1,
        attendance: formData.attendance,
        dietary_requirements: formData.dietary_requirements.trim(),
        wedding_slug: WEDDING_SLUG,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from(table)
        .insert([payload]);

      if (error) {
        throw new Error(error.message);
      }

      setStatus("success");
    } catch (error: any) {
      console.error('RSVP error details:', error);
      setErrorMessage(error.message || "Network error. Please try again later.");
      setStatus("error");
    }
  };

  return (
    <section className="relative px-6 py-16 md:py-24 bg-[#FAF8F4] overflow-hidden z-10">
      
      {/* Background elegant pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#C6A96B_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.15]" />

      <div className="max-w-3xl mx-auto relative">
        
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-serif text-xs tracking-[0.3em] text-[#C6A96B] uppercase block mb-3">
            RSVP
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] leading-tight">
            Kindly Respond
          </h2>
          <p className="font-sans text-[11px] text-[#2D2D2D]/60 tracking-wider uppercase mt-2">
            Please reply by August 25, 2026
          </p>
          <div className="h-[1px] w-20 bg-[#C6A96B]/30 mx-auto mt-4" />
        </motion.div>

        {/* Card Form */}
        <motion.div
          className="glass-card border border-[#C6A96B]/25 rounded-2xl p-8 md:p-12 shadow-2xl relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Accent Gold Corners */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#C6A96B]/40" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#C6A96B]/40" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#C6A96B]/40" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#C6A96B]/40" />

          <AnimatePresence mode="wait">
            {status === "success" ? (
              /* Beautiful Success Animation */
              <motion.div
                key="success"
                className="text-center py-8 flex flex-col items-center justify-center space-y-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative">
                  <CheckCircle2 className="w-16 h-16 text-[#C6A96B] animate-pulse" />
                  <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-[#C6A96B] animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                
                <h3 className="font-serif text-2xl text-[#2D2D2D] font-light">
                  Thank You, {formData.name}!
                </h3>
                
                <p className="font-sans text-xs text-[#2D2D2D]/75 max-w-md leading-relaxed">
                  Your response has been saved. We are absolutely thrilled to celebrate our special day with you!
                </p>

                <div className="h-[1px] w-16 bg-[#C6A96B]/20 my-4" />

                <button
                  onClick={() => {
                    setStatus("idle");
                    setFormData({
                      name: "",
                      phone: "",
                      email: "",
                      number_of_guests: "1",
                      attendance: "attending",
                      dietary_requirements: "",
                    });
                  }}
                  className="font-serif text-[10px] uppercase tracking-wider text-[#C6A96B] border-b border-[#C6A96B]/30 pb-0.5 hover:text-[#2D2D2D] transition-colors cursor-pointer"
                >
                  Edit or Submit another RSVP
                </button>
              </motion.div>
            ) : (
              /* Beautiful RSVP Form */
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Error Banner */}
                {status === "error" && (
                  <motion.div
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Input Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Full Name */}
                  <div className="flex flex-col">
                    <label className="font-serif text-xs uppercase tracking-widest text-[#C6A96B] font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Yehia Ibrahim"
                      disabled={status === "submitting"}
                      className="p-3 border-b border-[#C6A96B]/20 text-[#2D2D2D] text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] transition-colors placeholder-[#2D2D2D]/35"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col">
                    <label className="font-serif text-xs uppercase tracking-widest text-[#C6A96B] font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +20 100 123 4567"
                      disabled={status === "submitting"}
                      className="p-3 border-b border-[#C6A96B]/20 text-[#2D2D2D] text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] transition-colors placeholder-[#2D2D2D]/35"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col">
                    <label className="font-serif text-xs uppercase tracking-widest text-[#C6A96B] font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. yehia@example.com"
                      disabled={status === "submitting"}
                      className="p-3 border-b border-[#C6A96B]/20 text-[#2D2D2D] text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] transition-colors placeholder-[#2D2D2D]/35"
                    />
                  </div>

                  {/* Attendance */}
                  <div className="flex flex-col">
                    <label className="font-serif text-xs uppercase tracking-widest text-[#C6A96B] font-medium mb-2">
                      Will you attend? *
                    </label>
                    <select
                      name="attendance"
                      value={formData.attendance}
                      onChange={handleChange}
                      disabled={status === "submitting"}
                      className="p-3 border-b border-[#C6A96B]/20 text-[#2D2D2D] text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] transition-colors select-none cursor-pointer"
                    >
                      <option value="attending" className="bg-[#FAF8F4] text-[#2D2D2D]">
                        Joyfully Attending
                      </option>
                      <option value="not_attending" className="bg-[#FAF8F4] text-[#2D2D2D]">
                        Regretfully Declining
                      </option>
                    </select>
                  </div>

                  {/* Number of guests */}
                  <div className="flex flex-col">
                    <label className="font-serif text-xs uppercase tracking-widest text-[#C6A96B] font-medium mb-2">
                      Number of Guests (Including you)
                    </label>
                    <select
                      name="number_of_guests"
                      value={formData.number_of_guests}
                      onChange={handleChange}
                      disabled={formData.attendance === "not_attending" || status === "submitting"}
                      className="p-3 border-b border-[#C6A96B]/20 text-[#2D2D2D] text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] transition-colors select-none cursor-pointer disabled:opacity-40"
                    >
                      <option value="1" className="bg-[#FAF8F4] text-[#2D2D2D]">1 Guest</option>
                      <option value="2" className="bg-[#FAF8F4] text-[#2D2D2D]">2 Guests</option>
                      <option value="3" className="bg-[#FAF8F4] text-[#2D2D2D]">3 Guests</option>
                      <option value="4" className="bg-[#FAF8F4] text-[#2D2D2D]">4 Guests</option>
                    </select>
                  </div>

                  {/* Dietary Requirements */}
                  <div className="flex flex-col md:col-span-2">
                    <label className="font-serif text-xs uppercase tracking-widest text-[#C6A96B] font-medium mb-2">
                      Dietary Requirements or Notes
                    </label>
                    <textarea
                      name="dietary_requirements"
                      value={formData.dietary_requirements}
                      onChange={handleChange}
                      placeholder="e.g. Vegetarian, Gluten-Free, Allergies, or congratulations!"
                      rows={2}
                      disabled={status === "submitting"}
                      className="p-3 border-b border-[#C6A96B]/20 text-[#2D2D2D] text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] transition-colors resize-none placeholder-[#2D2D2D]/35"
                    />
                  </div>

                </div>

                {/* Submit Action Button */}
                <div className="pt-6 flex justify-center">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex items-center justify-center gap-2 px-10 py-3.5 bg-[#C6A96B] hover:bg-[#B5985A] text-white transition-all duration-300 rounded-full font-serif text-xs uppercase tracking-[0.2em] shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {status === "submitting" ? (
                      "Saving Response..."
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send RSVP
                      </>
                    )}
                  </button>
                </div>

              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
