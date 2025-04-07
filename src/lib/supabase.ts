import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://jlagcxktmpzhoacdusgh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYWdjeGt0bXB6aG9hY2R1c2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3ODQ3MzIsImV4cCI6MjA1OTM2MDczMn0.1zJflUexMHBLEhFJGJQRTn9O-DKyuCLQMf5kNCM5ZuI';

// Initialize the Supabase client with React Native specific options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 