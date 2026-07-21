import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

// Read the wedding slug for this specific client deployment
const WEDDING_SLUG = process.env.VITE_WEDDING_SLUG || "tasneem-yehia";

// Initialize Supabase Client (Sanitizing URL if /rest/v1/ is accidentally included)
let rawSupabaseUrl = process.env.SUPABASE_URL || "https://pvuszjcuvkycprbggweo.supabase.co";
rawSupabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const SUPABASE_URL = rawSupabaseUrl;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_xPvR3HkIozZaxNLxPCIRfw_dvljpvdV";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  }
});

// Ensure storage directories exist
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const GUESTS_FILE = path.join(DATA_DIR, "rsvps.json");
const PHOTOS_FILE = path.join(DATA_DIR, "photos.json");

// Helper to read JSON safely
function readJSONFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data) as T;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
}

// Helper to write JSON safely
function writeJSONFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
}

// Type definitions matching your Supabase table columns
interface Guest {
  id: string;
  wedding_slug?: string;
  fullName: string;
  email: string;
  attending: boolean;
  guestsCount: number;
  dietaryNotes: string;
  wellWishes?: string;
  created_at: string;
}

interface Photo {
  id: string;
  wedding_slug?: string;
  url: string;
  approved: boolean;
  created_at: string;
}

// Setup multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `wedding-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Express middlewares
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

const getAdminPassword = () => {
  return process.env.ORGANIZER_PASSWORD || "EverAfter2026";
};

const shouldAttemptSupabase = (): boolean => {
  if (SUPABASE_URL && SUPABASE_URL.startsWith("https://")) {
    return true;
  }
  return false;
};

// --- DATABASE FUNCTIONS: GUESTS ---

async function getGuestsFromDB(): Promise<Guest[]> {
  if (!shouldAttemptSupabase()) {
    const allGuests = readJSONFile<Guest[]>(GUESTS_FILE, []);
    return allGuests.filter(g => !g.wedding_slug || g.wedding_slug === WEDDING_SLUG);
  }
  try {
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .eq("wedding_slug", WEDDING_SLUG)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as Guest[];
  } catch (err: any) {
    console.log("[Supabase Status] Using local JSON guest list fallback due to:", err.message);
    const allGuests = readJSONFile<Guest[]>(GUESTS_FILE, []);
    return allGuests.filter(g => !g.wedding_slug || g.wedding_slug === WEDDING_SLUG);
  }
}

async function saveGuestToDB(guestData: Omit<Guest, "id" | "created_at" | "wedding_slug">): Promise<Guest> {
  const finalGuest: Guest = {
    id: Date.now().toString(),
    wedding_slug: WEDDING_SLUG,
    ...guestData,
    created_at: new Date().toISOString()
  };

  if (!shouldAttemptSupabase()) {
    const guests = readJSONFile<Guest[]>(GUESTS_FILE, []);
    guests.unshift(finalGuest);
    writeJSONFile(GUESTS_FILE, guests);
    return finalGuest;
  }

  try {
    const { error: saveError } = await supabase
      .from("rsvps")
      .insert(finalGuest);

    if (saveError) throw saveError;
    console.log("[Supabase] Successfully saved RSVP to remote database!");
    return finalGuest;
  } catch (error: any) {
    console.warn('[Database Fallback Warning] RSVP error details:', error.message || error);
    const guests = readJSONFile<Guest[]>(GUESTS_FILE, []);
    guests.unshift(finalGuest);
    writeJSONFile(GUESTS_FILE, guests);
    return finalGuest;
  }
}

// --- DATABASE FUNCTIONS: PHOTOS ---

let cachedPhotoTable: "photos" | "guest_photos" | null = null;

async function getActivePhotoTable(): Promise<"photos" | "guest_photos"> {
  if (cachedPhotoTable) return cachedPhotoTable;

  try {
    // Probe 'photos' table first (more likely to exist / be the correct schema)
    const { error } = await supabase
      .from("photos")
      .select("id")
      .limit(1);
    
    if (!error) {
      cachedPhotoTable = "photos";
      console.log("[Supabase] Active photos table identified as: 'photos'");
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
      console.log("[Supabase] Active photos table identified as: 'guest_photos'");
      return "guest_photos";
    }
  } catch (err) {
    // Ignore
  }

  // Default to photos
  cachedPhotoTable = "photos";
  return "photos";
}

let isPhotosRLSBlocked = false;

async function checkSupabaseRLS() {
  if (!shouldAttemptSupabase()) return;
  try {
    const table = await getActivePhotoTable();
    const testId = "rls-test-" + Date.now();
    
    // Test INSERT
    const { error: insertError } = await supabase
      .from(table)
      .insert({
        id: testId,
        url: "https://test.com/temp-rls-probe.jpg",
        approved: true,
        wedding_slug: "test-probe-slug",
        created_at: new Date().toISOString()
      });
    
    if (insertError) {
      if (insertError.code === "42501") {
        isPhotosRLSBlocked = true;
        console.warn(`[Supabase RLS Warning] Row-Level Security is blocking writes on '${table}' table!`);
      } else {
        console.warn(`[Supabase Probe Warning] Table check failed with code ${insertError.code}:`, insertError.message);
      }
      return;
    }

    // Test SELECT
    const { data: selectData, error: selectError } = await supabase
      .from(table)
      .select("id")
      .eq("id", testId)
      .maybeSingle();

    if (selectError || !selectData) {
      isPhotosRLSBlocked = true;
      console.warn(`[Supabase RLS Warning] Row-Level Security is blocking reads on '${table}' table! (Insert succeeded but Select was blocked). Falling back to local storage.`);
    } else {
      isPhotosRLSBlocked = false;
      console.log(`[Supabase Probe Success] '${table}' table is fully accessible (no RLS blocks).`);
      
      // Clean up the test row
      await supabase.from(table).delete().eq("id", testId);
    }
  } catch (err) {
    // Ignore
  }
}

// Initial check
checkSupabaseRLS();

// Periodically probe RLS status every 10 seconds
setInterval(checkSupabaseRLS, 10000);

function shouldUseSupabaseForPhotos(): boolean {
  return shouldAttemptSupabase() && !isPhotosRLSBlocked;
}

async function getPhotosFromDB(): Promise<Photo[]> {
  if (!shouldUseSupabaseForPhotos()) {
    const allPhotos = readJSONFile<Photo[]>(PHOTOS_FILE, []);
    return allPhotos.filter(p => !p.wedding_slug || p.wedding_slug === WEDDING_SLUG);
  }
  try {
    const table = await getActivePhotoTable();
    console.log(`[Supabase Fetch] Fetching from table '${table}' for wedding_slug: '${WEDDING_SLUG}'`);
    
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("wedding_slug", WEDDING_SLUG)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error(`[Supabase Fetch Error] Table: '${table}':`, error.message);
      throw error;
    }

    console.log(`[Supabase Fetch] Found ${data ? data.length : 0} photos matching slug '${WEDDING_SLUG}'`);
    
    if (!data || data.length === 0) {
      // Diagnostic check: fetch any rows from the table without slug constraint to see if they exist
      const { data: allRows, error: allRowsError } = await supabase
        .from(table)
        .select("*")
        .limit(5);
      
      if (allRowsError) {
        console.error(`[Supabase Diagnostic Error] Fetching any rows from '${table}':`, allRowsError.message);
      } else {
        console.log(`[Supabase Diagnostic] Found ${allRows ? allRows.length : 0} total rows in table '${table}' (without slug filter). Samples:`, 
          allRows ? allRows.map(r => ({ id: r.id, wedding_slug: r.wedding_slug, url: r.url, approved: r.approved })) : []
        );
      }

      // Check if we have local photos in photos.json that we can sync to Supabase
      const localPhotos = readJSONFile<Photo[]>(PHOTOS_FILE, []);
      const filteredLocal = localPhotos.filter(p => !p.wedding_slug || p.wedding_slug === WEDDING_SLUG);
      if (filteredLocal.length > 0) {
        console.log(`[Supabase Sync] Supabase table has 0 rows but local JSON has ${filteredLocal.length} photos. Syncing to Supabase...`);
        for (const localPhoto of filteredLocal) {
          try {
            await supabase.from(table).insert({
              id: localPhoto.id || Date.now().toString(),
              url: localPhoto.url,
              approved: localPhoto.approved !== false,
              wedding_slug: WEDDING_SLUG,
              created_at: localPhoto.created_at || new Date().toISOString()
            });
          } catch (syncErr: any) {
            console.error(`[Supabase Sync Warning] Failed to sync photo ${localPhoto.id}:`, syncErr.message || syncErr);
          }
        }
        // Fetch again after syncing
        const { data: syncedData, error: syncedError } = await supabase
          .from(table)
          .select("*")
          .eq("wedding_slug", WEDDING_SLUG)
          .order("created_at", { ascending: false });
        if (!syncedError && syncedData) {
          console.log(`[Supabase Sync Success] Successfully synced ${syncedData.length} photos to Supabase.`);
          return syncedData as Photo[];
        }
      }
    }

    return (data || []) as Photo[];
  } catch (err: any) {
    console.log("[Supabase Status] Using local JSON photo gallery fallback due to:", err.message || err);
    const allPhotos = readJSONFile<Photo[]>(PHOTOS_FILE, []);
    return allPhotos.filter(p => !p.wedding_slug || p.wedding_slug === WEDDING_SLUG);
  }
}

async function savePhotoToDB(photo: Photo): Promise<Photo> {
  const photoWithSlug = { ...photo, wedding_slug: WEDDING_SLUG };
  if (!shouldUseSupabaseForPhotos()) {
    const photos = readJSONFile<Photo[]>(PHOTOS_FILE, []);
    photos.unshift(photoWithSlug);
    writeJSONFile(PHOTOS_FILE, photos);
    return photoWithSlug;
  }
  try {
    const table = await getActivePhotoTable();
    const { error } = await supabase
      .from(table)
      .insert(photoWithSlug);
    
    if (error) throw error;
    console.log(`[Supabase] Photo inserted successfully into ${table}!`);
    return photoWithSlug;
  } catch (err: any) {
    console.log("[Supabase Status] Saved photo to local JSON fallback due to:", err.message || err);
    const photos = readJSONFile<Photo[]>(PHOTOS_FILE, []);
    photos.unshift(photoWithSlug);
    writeJSONFile(PHOTOS_FILE, photos);
    return photoWithSlug;
  }
}

async function deletePhotoFromDB(id: string): Promise<boolean> {
  if (!shouldUseSupabaseForPhotos()) {
    const photos = readJSONFile<Photo[]>(PHOTOS_FILE, []);
    const index = photos.findIndex((p) => p.id === id && (p.wedding_slug === WEDDING_SLUG || !p.wedding_slug));
    if (index !== -1) {
      photos.splice(index, 1);
      writeJSONFile(PHOTOS_FILE, photos);
      return true;
    }
    return false;
  }
  try {
    const table = await getActivePhotoTable();
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .eq("wedding_slug", WEDDING_SLUG);
    
    if (error) throw error;
    return true;
  } catch (err: any) {
    console.log("[Supabase delete error] fell back to local deletion:", err.message);
    const photos = readJSONFile<Photo[]>(PHOTOS_FILE, []);
    const index = photos.findIndex((p) => p.id === id && (p.wedding_slug === WEDDING_SLUG || !p.wedding_slug));
    if (index !== -1) {
      photos.splice(index, 1);
      writeJSONFile(PHOTOS_FILE, photos);
      return true;
    }
    return false;
  }
}

async function togglePhotoApprovalInDB(id: string): Promise<Photo | null> {
  if (!shouldUseSupabaseForPhotos()) {
    const photos = readJSONFile<Photo[]>(PHOTOS_FILE, []);
    const index = photos.findIndex((p) => p.id === id && (p.wedding_slug === WEDDING_SLUG || !p.wedding_slug));
    if (index !== -1) {
      photos[index].approved = !photos[index].approved;
      writeJSONFile(PHOTOS_FILE, photos);
      return photos[index];
    }
    return null;
  }
  try {
    const table = await getActivePhotoTable();
    const { data, error: getError } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .eq("wedding_slug", WEDDING_SLUG)
      .maybeSingle();

    if (getError) throw getError;
    if (!data) throw new Error("Photo record not found in active table");

    const updatedApproved = !data.approved;
    const { data: updated, error: updateError } = await supabase
      .from(table)
      .update({ approved: updatedApproved })
      .eq("id", id)
      .eq("wedding_slug", WEDDING_SLUG)
      .select()
      .single();

    if (updateError) throw updateError;
    return updated as Photo;
  } catch (err: any) {
    console.log("[Supabase approval warning] fell back to local approval toggle:", err.message);
    const photos = readJSONFile<Photo[]>(PHOTOS_FILE, []);
    const index = photos.findIndex((p) => p.id === id && (p.wedding_slug === WEDDING_SLUG || !p.wedding_slug));
    if (index !== -1) {
      photos[index].approved = !photos[index].approved;
      writeJSONFile(PHOTOS_FILE, photos);
      return photos[index];
    }
    return null;
  }
}

// --- API ROUTES ---

app.get("/api/db-status", async (req, res) => {
  return res.json({
    mode: shouldAttemptSupabase() ? "remote_supabase" : "local_json",
    supabase_url: SUPABASE_URL,
    wedding_slug: WEDDING_SLUG,
    is_photos_rls_blocked: isPhotosRLSBlocked
  });
});

app.post("/api/admin/verify", (req, res) => {
  const { password } = req.body;
  if (password === getAdminPassword()) {
    return res.json({ success: true, token: "wedding-token-secret-123" });
  }
  return res.status(401).json({ success: false, error: "Incorrect password" });
});

const checkAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader === "Bearer wedding-token-secret-123") {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

app.post("/api/rsvp", async (req, res) => {
  try {
    const fullName = req.body.fullName || req.body.name || req.body.guestName;
    const email = req.body.email || "";
    const rawAttending = req.body.attending !== undefined ? req.body.attending : (req.body.attendance !== undefined ? req.body.attendance : req.body.status);
    const guestsCount = req.body.guestsCount || req.body.guests || req.body.numberOfGuests;
    const dietaryNotes = req.body.dietaryNotes || req.body.dietary || req.body.notes;
    const wellWishes = req.body.wellWishes || req.body.message;

    if (!fullName) {
      return res.status(400).json({ error: "Name is required." });
    }

    let isAttending = true;
    if (typeof rawAttending === "boolean") {
      isAttending = rawAttending;
    } else if (typeof rawAttending === "string") {
      const lower = rawAttending.toLowerCase();
      isAttending = lower.includes("attend") || lower.includes("joyful") || lower === "yes" || lower === "true";
    }

    const guestData = {
      fullName,
      email,
      attending: isAttending,
      guestsCount: parseInt(guestsCount) || 1,
      dietaryNotes: dietaryNotes || "",
      wellWishes: wellWishes || "",
    };

    const finalGuest = await saveGuestToDB(guestData);
    return res.json({ success: true, guest: finalGuest });
  } catch (error: any) {
    console.warn('[RSVP Handler Warning] error details:', error.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/guests", checkAuth, async (req, res) => {
  const guests = await getGuestsFromDB();
  return res.json(guests);
});

app.get("/api/photos", async (req, res) => {
  const photos = await getPhotosFromDB();
  return res.json(photos);
});

app.post("/api/photos/upload", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    let publicUrl = `/uploads/${req.file.filename}`;

    if (shouldAttemptSupabase()) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileExt = path.extname(req.file.originalname) || ".jpg";
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}${fileExt}`;

        const { data: storageData, error: storageError } = await supabase.storage
          .from("photos")
          .upload(fileName, fileBuffer, {
            contentType: req.file.mimetype || "image/jpeg",
          });

        if (!storageError) {
          const { data: publicURLData } = supabase.storage
            .from("photos")
            .getPublicUrl(fileName);
          
          if (publicURLData?.publicUrl) {
            publicUrl = publicURLData.publicUrl;
            console.log("[Supabase Storage] Backend successfully uploaded image to bucket:", publicUrl);
          }
        } else {
          console.warn("[Supabase Storage Warning] Backend bucket upload failed:", storageError.message);
        }
      } catch (err: any) {
        console.warn("[Supabase Storage Error] Backend bucket upload failed:", err.message || err);
      }
    }

    const photoData: Photo = {
      id: Date.now().toString(),
      url: publicUrl,
      approved: true,
      created_at: new Date().toISOString(),
    };

    const finalPhoto = await savePhotoToDB(photoData);
    return res.json({ success: true, photo: finalPhoto });
  } catch (error: any) {
    console.error("[Upload Route Error] Details:", error.message || error);
    return res.status(500).json({ error: "Upload failed" });
  }
});

app.delete("/api/photos/:id", checkAuth, async (req, res) => {
  const success = await deletePhotoFromDB(req.params.id);
  if (!success) return res.status(404).json({ error: "Photo not found" });
  return res.json({ success: true });
});

app.post("/api/photos/:id/toggle-approve", checkAuth, async (req, res) => {
  const updated = await togglePhotoApprovalInDB(req.params.id);
  if (!updated) return res.status(404).json({ error: "Photo not found" });
  return res.json({ success: true, photo: updated });
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} [Slug: ${WEDDING_SLUG}]`);
  });
}

startServer();