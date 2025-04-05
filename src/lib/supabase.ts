import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jlagcxktmpzhoacdusgh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYWdjeGt0bXB6aG9hY2R1c2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIyNjE0NzcsImV4cCI6MjAyNzgzNzQ3N30.Hs_jFtaGd7B_kL_qhzGJxXrOVHF3O_qQHHYKs_Qh_Oc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
}); 