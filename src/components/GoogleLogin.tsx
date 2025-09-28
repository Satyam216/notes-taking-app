import { supabase } from "../lib/supabaseClient";

export default function GoogleLogin() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Google login error:", error.message);
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Sign in with Google
    </button>
  );
}
