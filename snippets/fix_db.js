import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixDB() {
  const { data, error } = await supabase
    .from('task_deliverables')
    .update({
      verified: true,
      company_name: 'SGG Company',
      verified_at: new Date().toISOString()
    })
    .eq('status', 'approved')
    .is('verified', null); // only update old ones

  console.log('Fixed old tasks:', data, error);

  const { data: fetchTest, error: errTest } = await supabase
    .from("task_deliverables")
    .select(`
      *,
      tasks (title),
      profiles!task_deliverables_verified_by_fkey(email)
    `)
    .eq("verified", true);
  
  console.log('Test fetch:', fetchTest, errTest);
}

fixDB();
