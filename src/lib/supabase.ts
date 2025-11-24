import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = "https://hrehgdcrcubzzgsadnzq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZWhnZGNyY3Vienpnc2FkbnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzAxNTIsImV4cCI6MjA3ODU0NjE1Mn0.bNeOl7snS4OBv0naA_Y50RFQ0bzJ1lJM-xkTZZ4EVCU";

//VITE_SUPABASE_URL=https://hrehgdcrcubzzgsadnzq.supabase.co
//VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZWhnZGNyY3Vienpnc2FkbnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzAxNTIsImV4cCI6MjA3ODU0NjE1Mn0.bNeOl7snS4OBv0naA_Y50RFQ0bzJ1lJM-xkTZZ4EVCU

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);