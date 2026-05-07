import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  "https://nyoubwxilrniswelnaca.supabase.co";

const anon =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b3Vid3hpbHJuaXN3ZWxuYWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTU5MDUsImV4cCI6MjA5MzczMTkwNX0.IhW-iPl5XU0_0agwpmrHQZPUDByjkk5m5uAzyEkjXHA";

export const supabase: SupabaseClient = createClient(url, anon, { auth: { persistSession: false } });

export const hasSupabase = true;

export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ||
  "https://hackathon-plum-seven.vercel.app";