/**
 * Seed script: creates the admin user in Supabase Auth + public.users
 * Run with: npx tsx scripts/seed-admin.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Install tsx first: npm install -D tsx
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedAdmin() {
  console.log("Creating admin user...");

  const { data, error } = await supabase.auth.admin.createUser({
    email: "admin@intellonotes.ma",
    password: "Admin@IntelloNotes2024!",
    email_confirm: true,
    user_metadata: {
      name: "Admin",
      role: "admin",
    },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      console.log("Admin user already exists — skipping.");
    } else {
      console.error("Error creating admin:", error.message);
      process.exit(1);
    }
  } else {
    console.log("Admin user created:", data.user?.email);
  }

  // Ensure public.users row has role=admin (trigger may have set it to 'student')
  const userId = data?.user?.id;
  if (userId) {
    const { error: updateError } = await supabase
      .from("users")
      .update({ role: "admin" })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating role:", updateError.message);
    } else {
      console.log("Admin role confirmed in public.users.");
    }
  }

  console.log("Done.");
}

seedAdmin();
