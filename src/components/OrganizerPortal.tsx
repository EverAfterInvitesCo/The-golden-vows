import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RSVPResponse } from "../types";
import { supabase, WEDDING_SLUG } from "../supabaseClient";
import { Users, Heart, Sparkles, ShieldCheck } from "lucide-react";

interface OrganizerPortalProps {
  tick?: number;
  onReset?: () => void;
}

export default function OrganizerPortal({ tick = 0, onReset }: OrganizerPortalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submss, setSubmss] = useState<RSVPResponse[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState(false);

  const loadSubmissions = async () => {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('wedding_slug', WEDDING_SLUG);
      
    if (error) {
      console.error("Error fetching:", error);
    } else {
      setSubmss(data || []);
    }
  };

  useEffect(() => {
    if (isOpen && isUnlocked) {
      loadSubmissions(); 
      const interval = setInterval(loadSubmissions, 5000); 
      return () => clearInterval(interval); 
    }
  }, [isOpen, isUnlocked, tick]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(true);
    } else {
      setIsUnlocked(true);
      setAuthError(false);
      loadSubmissions();
    }
  };

  const accepts = submss.filter((s) => String(s.attending).toLowerCase() === 'true' || String(s.attending).toLowerCase() === 'yes');
  const declines = submss.filter((s) => String(s.attending).toLowerCase() === 'false' || String(s.attending).toLowerCase() === 'no');
  const totalAttendingGuests = accepts.reduce((acc, curr) => acc + (Number(curr.guestsCount) || 1), 0);

  return (
    <section className="w-full bg-[#FAF6EE] py-12 px-6 sm:px-12 border-t border-[#F3EBDD]/60">
      <div className="w-full max-w-4xl mx-auto border border-[#C5A059]/30 rounded-2xl bg-white/50 backdrop-blur-sm p-8 shadow-sm">
        <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#C5A059]" />
            <h4 className="font-serif text-lg uppercase tracking-widest text-[#2A2825]">Organizer Portal</h4>
          </div>
          <span className="text-sm text-[#C5A059] font-semibold uppercase">{isOpen ? "Collapse" : "Access Data"}</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-8 mt-6 border-t border-[#F3EBDD]">
                {!isUnlocked ? (
                  <form onSubmit={handleLogin} className="max-w-xs mx-auto space-y-4">
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 text-sm rounded-lg border bg-white" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 text-sm rounded-lg border bg-white" />
                    <button type="submit" className="w-full py-2 bg-[#C5A059] text-white text-sm font-semibold rounded-lg hover:bg-[#b08d4a] transition-colors">Login</button>
                    {authError && <p className="text-xs text-red-600 text-center">* Invalid credentials.</p>}
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-[#F3EBDD]"><Users className="w-6 h-6 mb-2 text-[#5F6F5E]"/><span className="text-xs uppercase tracking-widest text-gray-500 block">Total Guests</span><span className="text-2xl font-serif mt-1 block">{totalAttendingGuests}</span></div>
                    <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-[#F3EBDD]"><Heart className="w-6 h-6 mb-2 text-[#C5A059]"/><span className="text-xs uppercase tracking-widest text-gray-500 block">Accepted</span><span className="text-2xl font-serif mt-1 block">{accepts.length}</span></div>
                    <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-[#F3EBDD]"><Sparkles className="w-6 h-6 mb-2 text-[#2C261F]/50"/><span className="text-xs uppercase tracking-widest text-gray-500 block">Declined</span><span className="text-2xl font-serif mt-1 block">{declines.length}</span></div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
