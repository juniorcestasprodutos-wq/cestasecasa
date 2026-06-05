import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ftrgcqdbwljfjeyddger.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cmdjcWRid2xqZmpleWRkZ2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTAxMDksImV4cCI6MjA5NjE4NjEwOX0.7yYz8dFCGIhyp1BPz_Xy_A-yfJh1WB810pVP7R7kONo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
