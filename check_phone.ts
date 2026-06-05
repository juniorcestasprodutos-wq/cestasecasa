import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftrgcqdbwljfjeyddger.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cmdjcWRid2xqZmpleWRkZ2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTAxMDksImV4cCI6MjA5NjE4NjEwOX0.7yYz8dFCGIhyp1BPz_Xy_A-yfJh1WB810pVP7R7kONo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { data } = await supabase.from('whatsapp_messages').select('phone').order('created_at', { ascending: false }).limit(1);
    console.log('Latest sender:', data?.[0]?.phone);
}

check();
