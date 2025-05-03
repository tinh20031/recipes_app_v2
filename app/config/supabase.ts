import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://ahdpbryoyjvlzsrzemiu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZHBicnlveWp2bHpzcnplbWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MzkxMzQsImV4cCI6MjA2MTMxNTEzNH0.vBHzHkyhHaIeVrQzFFz_cU1W8XmmFTlABPGtio-T9iQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    detectSessionInUrl: false,
    persistSession: true
  }
}); 