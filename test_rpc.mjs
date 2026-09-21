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

async function testRpc() {
  const { data, error } = await supabase.rpc("decrement_product_stock", {
    p_product_id: "00000000-0000-0000-0000-000000000000",
    p_quantity: 1,
  });
  console.log("RPC result:", data, "RPC error:", error);
}

testRpc();
