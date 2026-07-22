import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Camera, FileImage, AlertCircle, CheckCircle2, Maximize2, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client safely (only if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present and valid)
let rawSupabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
if (rawSupabaseUrl) {
  rawSupabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}
const supabaseUrl = rawSupabaseUrl;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseUrl.startsWith("http") && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const WEDDING_SLUG = (import.meta as any).env?.VITE_WEDDING_SLUG || "tasneem-yehia";

let cachedPhotoTable: "photos" | "guest_photos" | null = null;

async function getActivePhotoTable(): Promise<"photos" | "guest_photos"> {
  if (cachedPhotoTable) return cachedPhotoTable;
  if (!supabase) return "photos";

  try {
    const { error } = await supabase
      .from("photos")
      .select("id")
      .limit(1);
    
    if (!error) {
      cachedPhotoTable = "photos";
      return "photos";
    }
  } catch (err) {
    // Ignore
  }

  try {
    const { error } = await supabase
      .from("guest_photos")
      .select("id")
      .limit(1);
    
    if (!error) {
      cachedPhotoTable = "guest_photos";
      return "guest_photos";
    }
  } catch (err) {
    // Ignore
  }

  cachedPhotoTable = "photos";
  return "photos";
}

interface Photo {
  id: string;
  url: string;
  approved?: boolean;
  wedding_slug?: string;
  created_at: string;
}

export default function PhotoUploadSection() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "compressing" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    if (!supabase) {
      console.warn("Supabase client is not initialized.");
      return;
    }

    try {
      const table = await getActivePhotoTable();
      let query = supabase.from(table).select("*").order("created_at", { ascending: false });
      
      // Filter by wedding slug if your table supports it
      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch photos from Supabase:", error.message);
        return;
      }

      if (data) {
        // Filter out unapproved photos and match the current wedding slug if present
        const filtered = data.filter((p: Photo) => {
          const matchesSlug = !p.wedding_slug || p.wedding_slug === WEDDING_SLUG;
          const isApproved = p.approved !== false;
          return matchesSlug && isApproved;
        });
        setPhotos(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch photos:", err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("compressing");
    setProgress(15);

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        setProgress(50);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.split(".")[0] + ".jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              
              setProgress(70);
              uploadFileToSupabase(compressedFile);
            } else {
              uploadFileToSupabase(file);
            }
          },
          "image/jpeg",
          0.8
        );
      };
    };
  };

  const uploadFileToSupabase = async (file: File) => {
    setUploadStatus("uploading");
    setProgress(85);

    if (!supabase) {
      setErrorMessage("Supabase is not configured. Please check your environment variables.");
      setUploadStatus("error");
      return;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

      // 1. Upload to Supabase Storage Bucket 'photos'
      const { error: storageError } = await supabase.storage
        .from("photos")
        .upload(fileName, file);

      if (storageError) {
        throw new Error(`Storage error: ${storageError.message}`);
      }

      // 2. Get Public URL
      const { data: publicURLData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      const publicUrl = publicURLData.publicUrl;

      // 3. Insert record into active database table
      const table = await getActivePhotoTable();
      const { error: dbError } = await supabase
        .from(table)
        .insert([
          {
            id: Date.now().toString(),
            url: publicUrl,
            approved: true,
            wedding_slug: WEDDING_SLUG,
            created_at: new Date().toISOString(),
          }
        ]);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      setUploadStatus("success");
      setProgress(100);
      setTimeout(() => {
        setUploadStatus("idle");
        setPreviewUrl(null);
        setProgress(0);
        fetchPhotos();
      }, 2000);

    } catch (err: any) {
      console.error("Photo upload error:", err);
      setErrorMessage(err.message || "Failed to upload image.");
      setUploadStatus("error");
    }
  };

  return (
    <section className="relative px-6 py-16 md:py-24 bg-[#FAF8F4] overflow-hidden z-10">
      <div className="max-w-6xl mx-auto">
        
        <motion.div
          className="text-center mb-12"
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
          <p className="font-sans text-xs text-[#2D2D2D]/60 mt-2 max-w-md mx-auto">
            Help us capture every beautiful moment. Upload your pictures from our special day directly to our shared digital album.
          </p>
          <div className="h-[1px] w-20 bg-[#C6A96B]/30 mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
          
          <div className="lg:col-span-5">
            <motion.div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all min-h-[300px] overflow-hidden bg-white/40 ${
                dragActive ? "border-[#C6A96B] bg-[#C6A96B]/5" : "border-[#C6A96B]/20 hover:border-[#C6A96B]/40"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <AnimatePresence mode="wait">
                {uploadStatus === "idle" ? (
                  <motion.div
                    key="idle"
                    className="flex flex-col items-center space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="w-14 h-14 rounded-full bg-[#EFE9DF]/50 border border-[#C6A96B]/15 flex items-center justify-center text-[#C6A96B]">
                      <Upload className="w-6 h-6 animate-bounce" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-serif text-sm text-[#2D2D2D] font-medium">
                        Drag & drop wedding pictures
                      </p>
                      <p className="font-sans text-[11px] text-[#2D2D2D]/60">
                        Or select from camera, phone, or computer
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C6A96B] hover:bg-[#B5985A] text-white text-[11px] font-serif uppercase tracking-wider rounded-full transition-colors shadow-sm cursor-pointer"
                      >
                        <FileImage className="w-3.5 h-3.5" /> Choose Photo
                      </button>
                    </div>
                  </motion.div>
                ) : uploadStatus === "compressing" || uploadStatus === "uploading" ? (
                  <motion.div
                    key="progress"
                    className="flex flex-col items-center space-y-4 w-full px-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="relative w-16 h-16 rounded-full bg-[#EFE9DF]/50 border border-[#C6A96B]/15 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-[#C6A96B] animate-spin" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-serif text-sm text-[#2D2D2D] font-medium">
                        {uploadStatus === "compressing" ? "Optimizing image..." : "Uploading to gallery..."}
                      </p>
                      <p className="font-sans text-[10px] text-[#C6A96B] uppercase tracking-wider">
                        Progress: {progress}%
                      </p>
                    </div>

                    <div className="w-full h-1.5 bg-[#EFE9DF] rounded-full overflow-hidden border border-[#C6A96B]/5">
                      <motion.div
                        className="h-full bg-[#C6A96B]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                ) : uploadStatus === "success" ? (
                  <motion.div
                    key="success"
                    className="flex flex-col items-center space-y-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-[#C6A96B]" />
                    <p className="font-serif text-sm text-[#2D2D2D] font-medium">
                      Memory saved successfully!
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="error"
                    className="flex flex-col items-center space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AlertCircle className="w-12 h-12 text-red-700/80" />
                    <p className="font-sans text-xs text-red-700 max-w-xs">{errorMessage}</p>
                    <button
                      onClick={() => setUploadStatus("idle")}
                      className="px-5 py-2 border border-[#C6A96B]/50 text-xs font-serif uppercase tracking-widest text-[#C6A96B] rounded-full cursor-pointer"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="font-serif text-xl text-[#2D2D2D] tracking-wide border-b border-[#C6A96B]/20 pb-2">
                Shared Guest Gallery ({photos.length})
              </h3>

              {photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white/50 rounded-xl border border-dashed border-[#C6A96B]/15 text-center">
                  <p className="font-serif text-sm text-[#2D2D2D]/60 italic">No photos uploaded yet.</p>
                  <p className="font-sans text-xs text-[#2D2D2D]/40 mt-1">Be the first to share a moment!</p>
                </div>
              ) : (
                <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                  {photos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      className="break-inside-avoid relative rounded-xl overflow-hidden border border-[#C6A96B]/15 bg-white shadow-sm hover:shadow-lg transition-all group cursor-zoom-in"
                      whileHover={{ y: -3 }}
                      onClick={() => setActivePhoto(photo)}
                    >
                      <img
                        src={photo.url}
                        alt="Wedding Memory"
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                        <span className="text-[9px] text-[#FAF8F4] font-mono">
                          {photo.created_at ? new Date(photo.created_at).toLocaleDateString() : "Just now"}
                        </span>
                        <Maximize2 className="w-3.5 h-3.5 text-[#C6A96B]" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

        </div>

      </div>

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
          >
            <motion.div
              className="relative max-w-4xl max-h-[85vh] rounded-lg overflow-hidden border border-[#C6A96B]/30 shadow-2xl bg-[#2D2D2D]"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activePhoto.url}
                alt="Memory Fullscreen"
                className="w-auto h-auto max-w-full max-h-[85vh] object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
