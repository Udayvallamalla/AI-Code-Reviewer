import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://mubnsqeyrbzphrnjfmxa.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Ym5zcWV5cmJ6cGhybmpmbXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzA0ODgsImV4cCI6MjA4ODI0NjQ4OH0.MvZSnx3ri3yNAyAzn-b_2KetMhdTvDYMMdHg7xbtZMM";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey
    ? "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set these in deployment environment variables."
    : null;

export const supabase = supabaseConfigError ? null : createClient(supabaseUrl, supabaseAnonKey);
