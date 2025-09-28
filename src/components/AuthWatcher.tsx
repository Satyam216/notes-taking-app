// src/components/AuthWatcher.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthWatcher(): null {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        if (location.pathname !== "/" && location.pathname !== "/signup") {
          navigate("/", { replace: true });
        }
        return;
      }
      if (event === "SIGNED_IN" || session) {
        if (location.pathname !== "/dashboard") {
          navigate("/dashboard", { replace: true });
        }
      }
    });

    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, [navigate, location]);

  return null;
}
