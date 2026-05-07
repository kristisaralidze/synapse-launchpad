import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://nyoubwxilrniswelnaca.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Im55b3Vid3hpbHJuaXN3ZWxuYWNhIiwicm9sZSI$

export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://hackathon-plum-seven.vercel.app";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);