import { supabase } from "../lib/supabaseClient";

export async function ensureGoogleUser(user: any) {
  if (!user) return;

  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", user.email)
    .maybeSingle();

  if (!existingUser) {
    await supabase.from("users").insert([
      {
        name: user.user_metadata?.full_name || "Google User",
        email: user.email,
        dob: null, // ✅ keep null if not available
        created_at: new Date().toISOString(),
      },
    ]);
  }
}
