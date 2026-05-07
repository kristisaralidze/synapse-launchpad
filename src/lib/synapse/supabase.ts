import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nyoubwxilrniswelnaca.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b3Vid3hpbHJuaXN3ZWxuYWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTU5MDUsImV4cCI6MjA5MzczMTkwNX0.IhW-iPl5XU0_0agwpmrHQZPUDByjkk5m5uAzyEkjXHA";
export const API_BASE = "https://hackathon-plum-seven.vercel.app";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
export const hasSupabase = true;
