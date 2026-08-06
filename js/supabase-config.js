/* ============================================================
   InMyCorner — Supabase Config
   Fill these in from: Supabase Dashboard → Project Settings → API
   ============================================================ */

const SUPABASE_URL = "https://skkhqwmweneucrmkikjm.supabase.co"; // e.g. https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = "sb_publishable_jLzHOxGW2pF1tgta7LiUXw_ir2an6hE";

// This client is safe to use in the browser — the anon key is
// meant to be public. Row Level Security (see supabase-schema.sql)
// is what actually keeps data locked down, not this key.
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);
