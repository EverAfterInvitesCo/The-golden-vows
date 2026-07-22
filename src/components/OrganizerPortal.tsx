import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RSVPResponse } from "../types";
import { supabase, WEDDING_SLUG } from "../supabaseClient";
import { Users, Heart, Sparkles, ShieldCheck, Mail, UserCheck, UserX } from "lucide-react";

interface OrganizerPortalProps {
  tick?: number;
  onReset?: () => void;
}

export default function OrganizerPortal({ tick = 0 }: OrganizerPortalProps) {
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
    setAuthError(false);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      setAuthError(true);
      return;
    }

    const userSlug = authData.user.user_metadata?.wedding_slug;
    if (userSlug && userSlug !== WEDDING_SLUG) {
      await supabase.auth.signOut();
      setAuthError(true);
      return;
    }

    setIsUnlocked(true);
    loadSubmissions();
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
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full px-4 py-2 text-sm rounded-lg border bg-white" 
                      required 
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full px-4 py-2 text-sm rounded-lg border bg-white" 
                      required 
                    />
                    <button type="submit" className="w-full py-2 bg-[#C5A059] text-white text-sm font-semibold rounded-lg hover:bg-[#b08d4a] transition-colors">Login</button>
                    {authError && <p className="text-xs text-red-600 text-center">* Invalid email or password. Please try again.</p>}
                  </form>
                ) : (
                  <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-[#F3EBDD]">
                        <Users className="w-6 h-6 mb-2 text-[#5F6F5E]"/>
                        <span className="text-xs uppercase tracking-widest text-gray-500 block">Total Guests</span>
                        <span className="text-2xl font-serif mt-1 block">{totalAttendingGuests}</span>
                      </div>
                      <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-[#F3EBDD]">
                        <Heart className="w-6 h-6 mb-2 text-[#C5A059]"/>
                        <span className="text-xs uppercase tracking-widest text-gray-500 block">Accepted</span>
                        <span className="text-2xl font-serif mt-1 block">{accepts.length}</span>
                      </div>
                      <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-[#F3EBDD]">
                        <Sparkles className="w-6 h-6 mb-2 text-[#2C261F]/50"/>
                        <span className="text-xs uppercase tracking-widest text-gray-500 block">Declined</span>
                        <span className="text-2xl font-serif mt-1 block">{declines.length}</span>
                      </div>
                    </div>

                    {/* Guest List Details Table */}
                    <div className="bg-white/90 rounded-xl border border-[#F3EBDD] overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-[#F3EBDD] flex items-center justify-between">
                        <h5 className="font-serif text-sm uppercase tracking-wider text-[#2A2825]">Guest Submissions</h5>
                        <span className="text-xs text-gray-500">{submss.length} total response{submss.length === 1 ? '' : 's'}</span>
                      </div>
                      
                      {submss.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 py-8">No RSVP submissions received yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-[#FAF6EE] text-[#2A2825] font-serif uppercase text-xs tracking-wider border-b border-[#F3EBDD]">
                              <tr>
                                <th className="px-6 py-3">Guest Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Party Size</th>
                                <th className="px-6 py-3">Notes / Message</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F3EBDD]">
                              {submss.map((sub, idx) => {
                                const isAttending = String(sub.attending).toLowerCase() === 'true' || String(sub.attending).toLowerCase() === 'yes';
                                return (
                                  <tr key={idx} className="hover:bg-[#FAF6EE]/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#2A2825]">{sub.name || sub.guestName || "Anonymous"}</td>
                                    <td className="px-6 py-4">
                                      {isAttending ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          <UserCheck className="w-3.5 h-3.5" /> Attending
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                          <UserX className="w-3.5 h-3.5" /> Declined
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{sub.guestsCount || 1}</td>
                                    <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">{sub.notes || sub.message || "—"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
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
