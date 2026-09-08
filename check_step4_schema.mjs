import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

const envLocalPath = path.resolve('.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        process.env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseSchema() {
  console.log('--- DB SCHEMA CHECK ---');
  const { data: o, error: oErr } = await supabase.from('orders').select('*').limit(1);
  console.log('Orders query:', o, 'Error:', oErr?.message);

  const { data: oi, error: oiErr } = await supabase.from('order_items').select('*').limit(1);
  console.log('Order Items query:', oi, 'Error:', oiErr?.message);

  const { data: p, error: pErr } = await supabase.from('products').select('*').limit(1);
  console.log('Products query count:', p?.length, 'Error:', pErr?.message);
}

checkDatabaseSchema();
