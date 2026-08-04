/* =========================================================
   SUPABASE CONFIG
   Fill these in from: Supabase Dashboard → Project Settings → API
   ========================================================= */

const SUPABASE_URL = 'https://krkyhxjildgawnzhkdxj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtya3loeGppbGRnYXduemhrZHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MzY0NjQsImV4cCI6MjEwMTQxMjQ2NH0.EPhdyYBnj5Wvgl9_W61pW7Pm2um5qY9RTDaaIQhBseI';

// `supabase` here is the global from the CDN script (@supabase/supabase-js).
// We create our own client as `supabaseClient` so the names don't collide.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
