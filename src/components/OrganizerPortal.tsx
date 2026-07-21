import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  Users, 
  Search, 
  Download, 
  Check, 
  X, 
  Trash2, 
  Image as ImageIcon, 
  CheckSquare, 
  AlertTriangle,
  UserCheck,
  Percent,
  CalendarCheck
} from "lucide-react";
import { Guest, Photo } from "../types";

export default function OrganizerPortal() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dashboard Data State
  const [guests, setGuests] = useState<Guest[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"guests" | "gallery">("guests");
  const [dbStatus, setDbStatus] = useState<{
    mode: string;
    is_fallback: boolean;
    supabase_url: string;
    connection_error: string | null;
    instructions: string;
    is_photos_rls_blocked?: boolean;
  } | null>(null);

  // Fetch DB connection status on mount
  useEffect(() => {
    fetch("/api/db-status")
      .then((res) => res.json())
      .then((data) => {
        setDbStatus({
          ...data,
          is_fallback: data.mode === "local_json",
          connection_error: data.connection_error || null,
          instructions: data.instructions || ""
        });
      })
      .catch((err) => console.error("Failed to fetch database status:", err));
  }, []);

  // Load token from storage at start
  useEffect(() => {
    const savedToken = localStorage.getItem("wedding_admin_token");
    if (savedToken) {
      setToken(savedToken);
      setIsAuthorized(true);
    }
  }, []);

  // Fetch admin data once authorized
  useEffect(() => {
    if (isAuthorized && token) {
      fetchAdminData();
    }
  }, [isAuthorized, token]);

  const fetchAdminData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [guestsRes, photosRes] = await Promise.all([
        fetch("/api/guests", { headers }),
        fetch("/api/photos") // Photos is public but management actions are protected
      ]);

      if (guestsRes.ok && photosRes.ok) {
        const guestsData = await guestsRes.json();
        const photosData = await photosRes.json();
        setGuests(guestsData);
        setPhotos(photosData);
      } else {
        // If fetch fails, token might be expired/invalid
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("wedding_admin_token", data.token);
        setToken(data.token);
        setIsAuthorized(true);
      } else {
        setLoginError(data.error || "Incorrect password.");
      }
    } catch (err) {
      setLoginError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("wedding_admin_token");
    setToken(null);
    setIsAuthorized(false);
    setPassword("");
  };

  const handleTogglePhotoApproval = async (id: string) => {
    try {
      const response = await fetch(`/api/photos/${id}/toggle-approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAdminData(); // Refresh list
      }
    } catch (err) {
      console.error("Toggle approval failed:", err);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this photo? This cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch(`/api/photos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAdminData(); // Refresh list
      }
    } catch (err) {
      console.error("Delete photo failed:", err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/guests/export", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "wedding_guests.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error("CSV Export failed:", err);
    }
  };

  // Calculations for stats
  const totalRSVPEntries = guests.length;
  const attendingGuests = guests
    .filter((g) => g.attendance === "attending" || g.attending === true)
    .reduce((sum, g) => sum + (g.number_of_guests || g.guestsCount || 1), 0);
  const decliningGuests = guests.filter((g) => g.attendance === "not_attending" || g.attending === false).length;
  const pendingPhotos = photos.filter((p) => !p.approved).length;

  const filteredGuests = guests.filter((g) => {
    if (!g) return false;
    const name = g.name || g.fullName || "";
    const phone = g.phone || "";
    const email = g.email || "";
    const query = (searchQuery || "").toLowerCase();

    return (
      name.toLowerCase().includes(query) ||
      phone.includes(query) ||
      email.toLowerCase().includes(query)
    );
  });

  return (
    <section className="relative px-6 py-16 md:py-24 bg-[#FAF8F4] overflow-hidden z-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <span className="font-serif text-xs tracking-[0.3em] text-[#C6A96B] uppercase block mb-3">
            Management
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] leading-tight">
            Organizer Portal
          </h2>
          <div className="h-[1px] w-20 bg-[#C6A96B]/30 mx-auto mt-4" />
        </div>

        <AnimatePresence mode="wait">
          {!isAuthorized ? (
            /* PASSWORD LOCK PAGE */
            <motion.div
              key="login"
              className="max-w-md mx-auto glass-card border border-[#C6A96B]/25 rounded-2xl p-8 shadow-2xl relative text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <div className="w-12 h-12 rounded-full bg-[#EFE9DF]/50 border border-[#C6A96B]/15 flex items-center justify-center text-[#C6A96B] mx-auto mb-6">
                <Lock className="w-5 h-5" />
              </div>

              <h3 className="font-serif text-xl text-[#2D2D2D] font-light mb-2">
                Couples Access Only
              </h3>
              <p className="font-sans text-xs text-[#2D2D2D]/60 mb-6 leading-relaxed">
                Please enter the secure organizer password to view attendance lists, guest stats, and manage galleries.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-[11px] rounded-lg text-left flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (e.g. EverAfter2026)"
                  className="w-full p-3 border border-[#C6A96B]/20 text-xs bg-[#FAF8F4] rounded-lg text-center focus:outline-none focus:border-[#C6A96B] transition-colors font-mono"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C6A96B] hover:bg-[#B5985A] text-white font-serif text-xs uppercase tracking-widest rounded-lg transition-colors shadow"
                >
                  {loading ? "Verifying..." : "Enter Dashboard"}
                </button>
              </form>

              {dbStatus && (
                <div className="mt-6 pt-6 border-t border-[#C6A96B]/15 text-left font-sans">
                  <span className="font-serif text-[10px] uppercase tracking-wider text-[#C6A96B] block mb-2">
                    Database System Integration
                  </span>
                  <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
                    dbStatus.is_fallback 
                      ? "bg-amber-50/50 border-amber-200/50 text-amber-900" 
                      : "bg-emerald-50/50 border-emerald-200/50 text-emerald-900"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dbStatus.is_fallback ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                        <span className="text-xs font-medium">
                          {dbStatus.is_fallback ? "Local File Storage Active" : "Remote Supabase Connected"}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/60 border border-current/10">
                        {dbStatus.is_fallback ? "Preview Mode" : "Production"}
                      </span>
                    </div>

                    <div className="text-[11px] leading-relaxed opacity-85">
                      {dbStatus.is_fallback ? (
                        <>
                          The backend is temporarily storing RSVPs & photos in secure local JSON files (<code className="font-mono bg-white/40 px-1 py-0.5 rounded text-[10px]">/data/*.json</code>) inside the cloud container because no remote Supabase database URL has been configured.
                          <div className="mt-2 text-[10px] leading-relaxed border-t border-amber-900/10 pt-2 text-[#9A7D46]">
                            <strong>Stay in your workflow:</strong> Click the <strong>Settings / Secrets</strong> panel in the Google AI Studio UI and configure <code className="font-mono bg-white/40 px-1">SUPABASE_URL</code> and <code className="font-mono bg-white/40 px-1">SUPABASE_ANON_KEY</code>.
                          </div>
                        </>
                      ) : (
                        <>
                          Successfully connected to your secure hosted remote Supabase database:
                          <code className="font-mono block bg-white/40 px-2 py-1 rounded mt-1.5 text-[10px] truncate">{dbStatus.supabase_url}</code>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* ADMIN DASHBOARD ACCESSED */
            <motion.div
              key="dashboard"
              className="space-y-8"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              
              {/* Header block with Logout */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#C6A96B]/25">
                <div>
                  <h3 className="font-serif text-2xl text-[#2D2D2D] font-light">
                    Welcome back, Tasneem & Yehia
                  </h3>
                  <p className="font-sans text-xs text-[#C6A96B] mt-0.5 uppercase tracking-wider">
                    Wedding Day Coordinator Dashboard
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="self-start sm:self-center px-4 py-2 border border-red-700/20 hover:bg-red-50 text-red-700/70 hover:text-red-700 rounded-lg text-xs font-serif uppercase tracking-wider transition-colors"
                >
                  Logout Panel
                </button>
              </div>

              {/* STATS PANELS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total RSVPs",
                    value: totalRSVPEntries,
                    desc: "Total submissions",
                    icon: <Users className="w-5 h-5 text-[#C6A96B]" />,
                  },
                  {
                    label: "Attending Guests",
                    value: attendingGuests,
                    desc: "Seat count target",
                    icon: <UserCheck className="w-5 h-5 text-emerald-700/70" />,
                  },
                  {
                    label: "Declining",
                    value: decliningGuests,
                    desc: "Unable to join",
                    icon: <X className="w-5 h-5 text-red-700/70" />,
                  },
                  {
                    label: "Total Memories",
                    value: photos.length,
                    desc: "Uploaded photos",
                    icon: <ImageIcon className="w-5 h-5 text-blue-700/70" />,
                  },
                ].map((stat, idx) => (
                  <div key={idx} className="glass-card rounded-xl p-5 border border-[#C6A96B]/15">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-serif text-xs text-[#2D2D2D]/60">{stat.label}</span>
                      <div className="p-2 rounded-full bg-[#EFE9DF]/50">{stat.icon}</div>
                    </div>
                    <span className="font-serif text-3xl font-light text-[#2D2D2D] block">{stat.value}</span>
                    <span className="font-sans text-[10px] text-[#C6A96B] mt-1 block uppercase tracking-wider">{stat.desc}</span>
                  </div>
                ))}
              </div>

              {/* RLS BLOCKED WARNING FOR SUPABASE */}
              {dbStatus?.is_photos_rls_blocked && (
                <div className="p-5 rounded-xl border border-amber-300/60 bg-amber-50/70 text-amber-900 font-sans text-left space-y-3 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <span className="p-1 rounded-full bg-amber-500 text-white font-bold text-xs leading-none">⚠️</span>
                    <div>
                      <h4 className="font-serif text-sm font-medium text-amber-950">
                        Supabase Row-Level Security (RLS) Warning
                      </h4>
                      <p className="text-[11px] leading-relaxed mt-1 text-amber-900/90">
                        Your remote Supabase database has Row-Level Security enabled on the <code>photos</code> table, but public access is blocked. 
                        To keep the wedding running smoothly, the backend is temporarily storing uploaded photos in the <strong>local secure file fallback</strong>. 
                        To unlock Supabase and display public wedding photos in the live gallery, please run the following commands inside your <strong>Supabase SQL Editor</strong>:
                      </p>
                    </div>
                  </div>
                  <div className="bg-amber-950 text-amber-100 p-3 rounded-lg font-mono text-[10px] space-y-1.5 border border-amber-900 overflow-x-auto leading-relaxed shadow-inner">
                    <div className="font-semibold text-amber-400">// Option A: Disable RLS for simple setup (e.g. wedding websites)</div>
                    <div>alter table photos disable row level security;</div>
                    <div className="border-t border-amber-800/50 my-1 pt-1 font-semibold text-amber-400">// Option B: Enable public read & write policies (retains RLS)</div>
                    <div>create policy "Allow public read" on photos for select using (true);</div>
                    <div>create policy "Allow public insert" on photos for insert with check (true);</div>
                    <div>create policy "Allow public delete" on photos for delete using (true);</div>
                  </div>
                  <p className="text-[10px] text-amber-800/80 leading-relaxed italic">
                    Note: The server automatically probes your database every 10 seconds. Once you run either option, it will instantly sync all local files to Supabase and switch to production database mode!
                  </p>
                </div>
              )}

              {/* NAVIGATION TABS & ACTIONS */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#EFE9DF]/30 p-2 rounded-xl border border-[#C6A96B]/10">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("guests")}
                    className={`px-5 py-2.5 rounded-lg text-xs font-serif uppercase tracking-wider transition-all ${
                      activeTab === "guests"
                        ? "bg-[#C6A96B] text-white shadow"
                        : "text-[#2D2D2D]/70 hover:bg-[#EFE9DF]/65"
                    }`}
                  >
                    Guest List
                  </button>
                  <button
                    onClick={() => setActiveTab("gallery")}
                    className={`px-5 py-2.5 rounded-lg text-xs font-serif uppercase tracking-wider transition-all ${
                      activeTab === "gallery"
                        ? "bg-[#C6A96B] text-white shadow"
                        : "text-[#2D2D2D]/70 hover:bg-[#EFE9DF]/65"
                    }`}
                  >
                    Gallery Management {pendingPhotos > 0 && `(${pendingPhotos})`}
                  </button>
                </div>

                {activeTab === "guests" && (
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#C6A96B] hover:bg-[#C6A96B]/10 text-[#C6A96B] rounded-lg text-xs font-serif uppercase tracking-wider transition-colors"
                  >
                    <Download className="w-4 h-4" /> Export Excel/CSV
                  </button>
                )}
              </div>

              {/* TAB CONTENT: GUEST LIST */}
              {activeTab === "guests" && (
                <div className="glass-card border border-[#C6A96B]/15 rounded-xl overflow-hidden p-6 space-y-6">
                  
                  {/* Search bar */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search guests by name, phone, or email..."
                      className="w-full pl-10 pr-4 py-3 border border-[#C6A96B]/15 text-xs bg-[#FAF8F4] rounded-lg focus:outline-none focus:border-[#C6A96B] transition-colors"
                    />
                  </div>

                  {/* List Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#C6A96B]/20 text-[#C6A96B] font-serif uppercase tracking-wider">
                          <th className="py-3 px-4 font-normal">Name</th>
                          <th className="py-3 px-4 font-normal">Attendance</th>
                          <th className="py-3 px-4 font-normal">Guests</th>
                          <th className="py-3 px-4 font-normal">Phone</th>
                          <th className="py-3 px-4 font-normal">Email</th>
                          <th className="py-3 px-4 font-normal">Dietary / Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C6A96B]/10">
                        {filteredGuests.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-xs text-[#2D2D2D]/50 italic">
                              No guests match your criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredGuests.map((guest) => {
                            const isAttending = guest.attendance === "attending" || guest.attending === true;
                            return (
                              <tr key={guest.id} className="hover:bg-[#EFE9DF]/10 transition-colors">
                                <td className="py-3.5 px-4 font-serif font-medium text-[#2D2D2D]">
                                  {guest.name || guest.fullName || "Unnamed"}
                                </td>
                                <td className="py-3.5 px-4">
                                  {isAttending ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-sans font-medium rounded-full">
                                      <Check className="w-3 h-3" /> Attending
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-100 text-red-800 text-[10px] font-sans font-medium rounded-full">
                                      <X className="w-3 h-3" /> Declined
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 font-mono font-medium">
                                  {guest.number_of_guests || guest.guestsCount || 1}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[#2D2D2D]/80">
                                  {guest.phone || "—"}
                                </td>
                                <td className="py-3.5 px-4 text-[#2D2D2D]/70">
                                  {guest.email || "—"}
                                </td>
                                <td className="py-3.5 px-4 text-[#2D2D2D]/75 max-w-xs truncate" title={guest.dietary_requirements || guest.dietaryNotes}>
                                  {guest.dietary_requirements || guest.dietaryNotes || "—"}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* TAB CONTENT: GALLERY MANAGEMENT */}
              {activeTab === "gallery" && (
                <div className="glass-card border border-[#C6A96B]/15 rounded-xl p-6 space-y-6">
                  
                  <div className="flex justify-between items-center pb-2 border-b border-[#C6A96B]/10">
                    <h4 className="font-serif text-lg text-[#2D2D2D]">Gallery Audit Panel</h4>
                    <span className="font-sans text-[11px] text-[#C6A96B] uppercase tracking-wider font-semibold">
                      Total Photos: {photos.length}
                    </span>
                  </div>

                  {photos.length === 0 ? (
                    <div className="text-center py-12 italic text-xs text-[#2D2D2D]/50">
                      No photos uploaded to manage.
                    </div>
                  ) : (
                    /* Photo Management Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative rounded-xl overflow-hidden border border-[#C6A96B]/15 bg-white shadow-sm flex flex-col hover:shadow-md transition-all"
                        >
                          {/* Image preview */}
                          <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
                            <img
                              src={photo.url}
                              alt="Audit item"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {!photo.approved && (
                              <div className="absolute top-2 left-2 px-2 py-1 bg-amber-600 text-white text-[9px] font-sans rounded-full shadow flex items-center gap-1 uppercase tracking-wider font-semibold">
                                <AlertTriangle className="w-2.5 h-2.5" /> Pending Approval
                              </div>
                            )}
                          </div>

                          {/* Control actions footer */}
                          <div className="p-3 bg-[#EFE9DF]/30 flex items-center justify-between border-t border-[#C6A96B]/10">
                            <button
                              onClick={() => handleTogglePhotoApproval(photo.id)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-serif uppercase tracking-wider rounded-lg transition-all ${
                                photo.approved
                                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                                  : "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
                              }`}
                            >
                              {photo.approved ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Approved
                                </>
                              ) : (
                                "Approve"
                              )}
                            </button>

                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700/80 hover:text-red-700 rounded-lg transition-colors border border-red-200"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}