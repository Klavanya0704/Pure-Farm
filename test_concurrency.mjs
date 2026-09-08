import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const farmerClient = createClient(supabaseUrl, supabaseAnonKey);
const buyerClient1 = createClient(supabaseUrl, supabaseAnonKey);
const buyerClient2 = createClient(supabaseUrl, supabaseAnonKey);

async function runConcurrencyTest() {
  console.log("==================================================");
  console.log("TESTING SIMULTANEOUS CONCURRENT PURCHASES IN SUPABASE");
  console.log("==================================================\n");

  try {
    // 1. Authenticate Farmer & Buyers
    let { data: fAuth, error: fErr } = await farmerClient.auth.signInWithPassword({
      email: 'farmer_step4@purefarm.com',
      password: 'Password123!',
    });

    if (fErr || !fAuth?.user) {
      console.warn("Farmer sign in failed:", fErr?.message);
      // Fall back to creating a new user or testing with anon if RLS allows
      return;
    }

    const farmerId = fAuth.user.id;

    let { data: bAuth1 } = await buyerClient1.auth.signInWithPassword({
      email: 'buyer_step4_v2@purefarm.com',
      password: 'Password123!',
    });

    if (!bAuth1?.user) {
      buyerClient1 = farmerClient;
    }

    buyerClient2 = farmerClient;

    // 2. Create Product with 10 kg initial stock
    console.log("1. Creating product 'Concurrency Tomato' with initial stock = 10 kg...");
    const { data: product, error: createErr } = await farmerClient
      .from('products')
      .insert({
        farmer_id: farmerId,
        name: "Concurrency Tomato",
        category: "vegetables",
        price: 50,
        quantity: 10,
        available_quantity: 10,
        unit: "kg",
        location: "Test Farm",
        status: "available",
      })
      .select()
      .single();

    if (createErr || !product) {
      throw new Error(`Failed to create product: ${createErr?.message}`);
    }

    console.log(`✔ Created Product ID: ${product.id}, Stock: ${product.available_quantity} kg`);

    // 3. Define Atomic Decrement Function
    async function attemptAtomicPurchase(client, buyerName, requestedQty) {
      console.log(`[${buyerName}] Attempting to buy ${requestedQty} kg...`);

      // Atomic UPDATE with conditional WHERE clause enforcing available_quantity >= requestedQty
      const newAvail = product.available_quantity - requestedQty; // Target calculation if stock >= requestedQty
      
      // We first query latest stock or perform atomic check-and-update
      // PostgreSQL atomic update:
      // UPDATE products SET available_quantity = available_quantity - requestedQty WHERE id = productId AND available_quantity >= requestedQty
      
      const { data: currentProd, error: fetchErr } = await client
        .from('products')
        .select('available_quantity, name, status')
        .eq('id', product.id)
        .single();

      if (fetchErr || !currentProd) {
        throw new Error(`[${buyerName}] Product lookup failed.`);
      }

      if (currentProd.available_quantity < requestedQty) {
        throw new Error(`Only ${currentProd.available_quantity} units of "${currentProd.name}" are currently available.`);
      }

      const updatedStock = currentProd.available_quantity - requestedQty;
      const updatedStatus = updatedStock <= 0 ? 'sold_out' : 'available';

      // ATOMIC CONDITIONAL UPDATE: enforce eq('id', product.id) AND gte('available_quantity', requestedQty)
      const { data: updatedRows, error: updateErr } = await client
        .from('products')
        .update({
          available_quantity: updatedStock,
          status: updatedStatus,
        })
        .eq('id', product.id)
        .gte('available_quantity', requestedQty)
        .select();

      if (updateErr) {
        throw updateErr;
      }

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error(`Concurrent purchase conflict: Stock was modified by another buyer during transaction.`);
      }

      return updatedRows[0];
    }

    // 4. Fire 2 SIMULTANEOUS purchase requests for 8 kg each (Total 16 kg requested, but only 10 kg exists!)
    console.log("\n2. Firing 2 SIMULTANEOUS purchase requests of 8 kg each for stock of 10 kg...");

    const p1 = attemptAtomicPurchase(buyerClient1, "Buyer 1", 8);
    const p2 = attemptAtomicPurchase(buyerClient2, "Buyer 2", 8);

    const outcomes = await Promise.allSettled([p1, p2]);

    console.log("\n--- SIMULTANEOUS TRANSACTION RESULTS ---");
    outcomes.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        console.log(`✔ Buyer ${idx + 1} Transaction: SUCCESS -> Remaining Stock: ${res.value.available_quantity} kg, Status: ${res.value.status}`);
      } else {
        console.log(`❌ Buyer ${idx + 1} Transaction: BLOCKED -> Reason: "${res.reason.message}"`);
      }
    });

    // 5. Verify final stock in Supabase Database
    const { data: finalProduct } = await farmerClient
      .from('products')
      .select('*')
      .eq('id', product.id)
      .single();

    console.log(`\n3. Final Supabase Database Verification:`);
    console.log(`- Product Name:       "${finalProduct.name}"`);
    console.log(`- Final Available Stock: ${finalProduct.available_quantity} kg`);
    console.log(`- Product Status:     "${finalProduct.status}"`);

    // 6. Assertions
    const fulfilledCount = outcomes.filter(o => o.status === 'fulfilled').length;
    const rejectedCount = outcomes.filter(o => o.status === 'rejected').length;

    if (fulfilledCount === 1 && rejectedCount === 1 && finalProduct.available_quantity === 2) {
      console.log("\n✅ ATOMIC CONCURRENCY VERIFICATION: PASSED!");
      console.log("   - Exactly 1 purchase succeeded (8 kg)");
      console.log("   - Exactly 1 concurrent purchase was safely blocked");
      console.log("   - Remaining stock in Supabase is exactly 2 kg (10 - 8 = 2)");
      console.log("   - NO overselling occurred!");
    } else {
      console.error("\n❌ CONCURRENCY VERIFICATION FAILED!");
    }

    // 7. Cleanup
    await farmerClient.from('products').delete().eq('id', product.id);
    console.log("\n✔ Test cleanup completed.");

  } catch (err) {
    console.error("Test execution error:", err.message);
  }
}

runConcurrencyTest();
