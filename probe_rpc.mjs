import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envText = fs.readFileSync(".env.local", "utf8");
const env = {};
envText.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function probe() {
  // Test common RPC function names
  const funcNames = [
    "decrement_stock",
    "decrement_product_stock",
    "update_stock",
    "reduce_stock",
    "exec_sql",
    "exec",
    "query",
  ];
  for (const fn of funcNames) {
    const { data, error } = await supabase.rpc(fn, {
      p_id: "00000000-0000-0000-0000-000000000000",
    });
    console.log(`RPC '${fn}':`, error ? error.code : data);
  }
}

probe();
