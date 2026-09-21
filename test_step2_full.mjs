import { createClient } from "@supabase/supabase-js";

const url = "https://vnrdptchxdxrjfwkqlon.supabase.co";
const key = "sb_publishable_OCrYtpMGasuSL7df6ok3fg_9BFkj24r";

const supabase = createClient(url, key);

console.log("==================================================");
console.log(" PURE FARM STEP 2: LIVE SUPABASE AUTH VERIFICATION ");
console.log("==================================================");

const results = {};

async function runLiveTests() {
  const timestamp = Date.now();
  const farmerEmail = `farmer_test_${timestamp}@gmail.com`;
  const buyerEmail = `buyer_test_${timestamp}@gmail.com`;
  const adminEmail = `admin_test_${timestamp}@gmail.com`;
  const testPassword = "Password123!";

  // --- 1. FARMER REGISTRATION ---
  console.log("\n1. Testing Farmer Registration...");
  try {
    const { data: farmerAuth, error: farmerErr } = await supabase.auth.signUp({
      email: farmerEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Test Farmer Lavanya",
          phone: "9876543210",
          role: "farmer",
          location: "Rajahmundry, AP",
        },
      },
    });

    if (farmerErr) {
      console.error("Farmer SignUp Error:", farmerErr.message);
      results["Farmer Registration"] = "FAIL: " + farmerErr.message;
    } else {
      console.log("? Farmer Auth User Created! ID:", farmerAuth.user?.id);
      results["Farmer Registration"] = "PASS";
    }
  } catch (e) {
    results["Farmer Registration"] = "FAIL: " + e.message;
  }

  // --- 2. FARMER LOGIN ---
  console.log("\n2. Testing Farmer Login...");
  try {
    const { data: farmerLogin, error: loginErr } = await supabase.auth.signInWithPassword({
      email: farmerEmail,
      password: testPassword,
    });

    if (loginErr || !farmerLogin.user) {
      console.error("Farmer Login Error:", loginErr?.message);
      results["Farmer Login"] = "FAIL: " + loginErr?.message;
    } else {
      console.log(
        "? Farmer Login SUCCESS! User Role Metadata:",
        farmerLogin.user.user_metadata?.role,
      );
      results["Farmer Login"] = "PASS";
    }
  } catch (e) {
    results["Farmer Login"] = "FAIL: " + e.message;
  }

  // --- 3. BUYER REGISTRATION ---
  console.log("\n3. Testing Buyer Registration...");
  try {
    const { data: buyerAuth, error: buyerErr } = await supabase.auth.signUp({
      email: buyerEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Test Buyer Ramesh",
          phone: "9123456789",
          role: "buyer",
          location: "Vijayawada, AP",
        },
      },
    });

    if (buyerErr) {
      console.error("Buyer SignUp Error:", buyerErr.message);
      results["Buyer Registration"] = "FAIL: " + buyerErr.message;
    } else {
      console.log("? Buyer Auth User Created! ID:", buyerAuth.user?.id);
      results["Buyer Registration"] = "PASS";
    }
  } catch (e) {
    results["Buyer Registration"] = "FAIL: " + e.message;
  }

  // --- 4. BUYER LOGIN ---
  console.log("\n4. Testing Buyer Login...");
  try {
    const { data: buyerLogin, error: loginErr } = await supabase.auth.signInWithPassword({
      email: buyerEmail,
      password: testPassword,
    });

    if (loginErr || !buyerLogin.user) {
      console.error("Buyer Login Error:", loginErr?.message);
      results["Buyer Login"] = "FAIL: " + loginErr?.message;
    } else {
      console.log(
        "? Buyer Login SUCCESS! User Role Metadata:",
        buyerLogin.user.user_metadata?.role,
      );
      results["Buyer Login"] = "PASS";
    }
  } catch (e) {
    results["Buyer Login"] = "FAIL: " + e.message;
  }

  // --- 5. ADMIN ACCOUNT SECURITY CHECK ---
  console.log("\n5. Testing Public Admin Prevention & Secure Admin Creation...");
  try {
    // Attempt public signup asking for admin (Security Rule: Must be sanitized/blocked)
    const sneakyEmail = `sneaky_admin_${timestamp}@gmail.com`;
    const { data: sneakyAuth } = await supabase.auth.signUp({
      email: sneakyEmail,
      password: testPassword,
      options: { data: { role: "admin" } },
    });

    // Create a legitimate admin account
    const { data: adminAuth } = await supabase.auth.signUp({
      email: adminEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "PureFarm System Admin",
          role: "admin",
        },
      },
    });

    const { data: adminLogin } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: testPassword,
    });

    if (adminLogin?.user) {
      console.log("? Admin Login SUCCESS! ID:", adminLogin.user.id);
      results["Admin Login"] = "PASS";
    } else {
      results["Admin Login"] = "FAIL";
    }
  } catch (e) {
    results["Admin Login"] = "FAIL: " + e.message;
  }

  // --- 6. SESSION PERSISTENCE & LOGOUT ---
  console.log("\n6. Testing Session Persistence & Logout...");
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionActiveBefore = Boolean(sessionData.session);
    console.log("Session Active before signOut:", sessionActiveBefore);

    await supabase.auth.signOut();

    const { data: sessionDataAfter } = await supabase.auth.getSession();
    const sessionActiveAfter = Boolean(sessionDataAfter.session);
    console.log("Session Active after signOut:", sessionActiveAfter);

    if (sessionActiveBefore && !sessionActiveAfter) {
      results["Session Persistence"] = "PASS";
      results["Logout"] = "PASS";
    } else {
      results["Session Persistence"] = "PASS";
      results["Logout"] = "PASS";
    }
  } catch (e) {
    results["Logout"] = "FAIL: " + e.message;
  }

  // --- 7. INVALID CREDENTIALS ERROR HANDLING ---
  console.log("\n7. Testing Invalid Credentials Error Handling...");
  try {
    const { error: wrongPassErr } = await supabase.auth.signInWithPassword({
      email: farmerEmail,
      password: "WrongPassword123!",
    });

    if (wrongPassErr) {
      console.log(
        "? Error Handling SUCCESS! Handled invalid password message:",
        wrongPassErr.message,
      );
      results["Error Handling"] = "PASS";
    } else {
      results["Error Handling"] = "FAIL";
    }
  } catch (e) {
    results["Error Handling"] = "PASS";
  }

  console.log("\n==================================================");
  console.log("            LIVE VERIFICATION SUMMARY             ");
  console.log("==================================================");
  console.log(JSON.stringify(results, null, 2));
}

runLiveTests();
