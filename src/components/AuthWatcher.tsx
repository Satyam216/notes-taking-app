// src/components/AuthWatcher.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthWatcher(): null {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // When user signs out or session becomes null -> go to login root
      if (!session) {
        navigate("/", { replace: true });
        return;
      }

      // On sign in -> go to dashboard
      if (event === "SIGNED_IN") {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, [navigate]);

  return null;
}
