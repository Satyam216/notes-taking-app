// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const session = data?.session ?? null;
        setHasSession(!!session);
      } catch (err) {
        setHasSession(false);
      } finally {
        if (mounted) setChecking(false);
      }
    }

    check();

    // also listen to changes while mounted
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
      setChecking(false);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 rounded shadow text-sm">Checking session…</div>
      </div>
    );
  }

  if (!hasSession) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
