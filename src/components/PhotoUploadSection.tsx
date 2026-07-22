import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, Heart, X, Sparkles } from "lucide-react";
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
const STORAGE_BUCKET = "wedding-gallery";

interface PhotoItem {
  id: string;
  url: string;
  caption?: string;
  uploader_name?: string;
  created_at: string;
}

export default function GuestPhotoGallery() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeModalPhoto, setActiveModalPhoto] = useState<PhotoItem | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch photos on load
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("guest_photos")
        .select("*")
        .eq("wedding_slug", WEDDING_SLUG)
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback if table name differs or doesn't exist yet
        console.warn("Could not fetch from guest_photos:", error.message);
      } else if (data) {
        setPhotos(data);
      }
    } catch (err) {
      console.error("Error fetching gallery photos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setStatusMessage({ type: "error", text: "Image size must be less than 10MB." });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatusMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    if (!uploaderName.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your name." });
      return;
    }

    if (!supabase) {
      setStatusMessage({ type: "error", text: "Supabase is not configured. Please check your environment variables." });
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${WEDDING_SLUG}-${Date.now()}-${Math.random().toString(36.substring(2, 9))}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload image to Supabase Storage bucket
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const photoUrl = publicUrlData.publicUrl;

      // 3. Insert record into database table
      const { error: dbError } = await supabase
        .from("guest_photos")
        .insert([
          {
            id: Date.now().toString(),
            wedding_slug: WEDDING_SLUG,
            url: photoUrl,
            uploader_name: uploaderName.trim(),
            caption: caption.trim(),
            created_at: new Date().toISOString(),
          }
        ]);

      if (dbError) {
        throw new Error(`Database record failed: ${dbError.message}`);
      }

      setStatusMessage({ type: "success", text: "Photo uploaded successfully! Thank you for sharing." });
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      setUploaderName("");
      fetchPhotos();
    } catch (err: any) {
      console.error("Upload error details:", err);
      setStatusMessage({ type: "error", text: err.message || "Failed to upload photo. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="relative px-6 py-16 md:py-24 bg-[#FAF8F4] overflow-hidden z-10">
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#C6A96B_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.15]" />

      <div className="max-w-6xl mx-auto relative">
        
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-serif text-xs tracking-[0.3em] text-[#C6A96B] uppercase block mb-3">
            Shared Memories
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] leading-tight">
            Guest Photo Gallery
          </h2>
          <p className="font-sans text-[11px] text-[#2D2D2D]/60 tracking-wider uppercase mt-2 max-w-lg mx-auto">
            Help us capture every beautiful moment. Upload your pictures from our special day directly to our shared digital album.
          </p>
          <div className="h-[1px] w-20 bg-[#C6A96B]/30 mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Upload Card */}
          <motion.div
            className="lg:col-span-5 glass-card border border-[#C6A96B]/25 rounded-2xl p-6 md:p-8 shadow-xl relative bg-white/70 backdrop-blur-md"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#C6A96B]/40" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#C6A96B]/40" />
            
            <h3 className="font-serif text-xl text-[#2D2D2D] mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#C6A96B]" />
              Share Your Moments
            </h3>

            {!supabase ? (
              <div className="text-center py-10 px-4 border border-dashed border-red-300 rounded-xl bg-red-50/50">
                <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
                <p className="text-xs text-red-800 font-sans">
                  Supabase is not configured. Please check your environment variables.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-[#C6A96B] text-white rounded-full font-serif text-[10px] uppercase tracking-widest cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpload} className="space-y-4">
                
                {statusMessage && (
                  <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    statusMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
                  }`}>
                    {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                {/* File Dropzone / Selector */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#C6A96B]/40 rounded-xl p-6 text-center cursor-pointer hover:border-[#C6A96B] transition-all bg-[#FAF8F4]/50 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden shadow-inner">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-serif text-xs">
                        Change Photo
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 py-4">
                      <Upload className="w-8 h-8 text-[#C6A96B] group-hover:scale-110 transition-transform" />
                      <span className="font-serif text-xs uppercase tracking-wider text-[#2D2D2D]">
                        Click to select photo
                      </span>
                      <span className="text-[10px] text-[#2D2D2D]/50 font-sans">
                        PNG, JPG or WEBP (Max 10MB)
                      </span>
                    </div>
                  )}
                </div>

                {/* Uploader Name */}
                <div>
                  <label className="font-serif text-[11px] uppercase tracking-widest text-[#C6A96B] block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    placeholder="e.g. Sarah & Family"
                    disabled={uploading}
                    className="w-full p-2.5 border-b border-[#C6A96B]/20 text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] text-[#2D2D2D]"
                  />
                </div>

                {/* Caption / Note */}
                <div>
                  <label className="font-serif text-[11px] uppercase tracking-widest text-[#C6A96B] block mb-1">
                    Message or Caption
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Such a magical night!"
                    disabled={uploading}
                    className="w-full p-2.5 border-b border-[#C6A96B]/20 text-xs bg-transparent focus:outline-none focus:border-[#C6A96B] text-[#2D2D2D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full py-3 bg-[#C6A96B] hover:bg-[#B5985A] text-white rounded-full font-serif text-xs uppercase tracking-[0.2em] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Upload to Gallery
                    </>
                  )}
                </button>

              </form>
            )}
          </motion.div>

          {/* Gallery Grid */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6 border-b border-[#C6A96B]/20 pb-3">
              <h3 className="font-serif text-xl text-[#2D2D2D]">
                Shared Guest Gallery ({photos.length})
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#C6A96B] animate-spin" />
                <p className="font-serif text-xs text-[#2D2D2D]/60 uppercase tracking-widest">
                  Loading Gallery...
                </p>
              </div>
            ) : photos.length === 0 ? (
              <div className="border border-dashed border-[#C6A96B]/30 rounded-2xl p-12 text-center bg-white/40">
                <Heart className="w-10 h-10 text-[#C6A96B]/40 mx-auto mb-3 animate-pulse" />
                <p className="font-serif text-sm text-[#2D2D2D]">No photos uploaded yet.</p>
                <p className="font-sans text-xs text-[#2D2D2D]/50 mt-1">Be the first to share a moment!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {photos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    onClick={() => setActiveModalPhoto(photo)}
                    className="relative group aspect-square rounded-xl overflow-hidden shadow-md cursor-pointer bg-black/5 border border-[#C6A96B]/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || "Guest photo"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-white font-serif text-[11px] truncate">
                        {photo.uploader_name ? `By ${photo.uploader_name}` : "Guest"}
                      </p>
                      {photo.caption && (
                        <p className="text-white/80 font-sans text-[9px] truncate">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

        </div>

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeModalPhoto && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModalPhoto(null)}
          >
            <motion.div
              className="relative max-w-3xl w-full bg-[#FAF8F4] rounded-2xl overflow-hidden shadow-2xl border border-[#C6A96B]/30"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModalPhoto(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="max-h-[70vh] bg-black flex items-center justify-center">
                <img
                  src={activeModalPhoto.url}
                  alt={activeModalPhoto.caption || "Zoomed photo"}
                  className="max-h-[70vh] max-w-full object-contain"
                />
              </div>

              <div className="p-6 text-center">
                <p className="font-serif text-sm text-[#2D2D2D] font-medium">
                  {activeModalPhoto.uploader_name ? `Shared by ${activeModalPhoto.uploader_name}` : "Shared by Guest"}
                </p>
                {activeModalPhoto.caption && (
                  <p className="font-sans text-xs text-[#2D2D2D]/70 mt-1">
                    "{activeModalPhoto.caption}"
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
