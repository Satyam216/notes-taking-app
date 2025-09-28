import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { FcGoogle } from "react-icons/fc";

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGoogle = async () => {
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setMessage(error.message);
    setLoading(false);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setMessage(null);
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // Do not set emailRedirectTo here — we want OTP token flow
      }
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setStep("otp");
      setMessage("OTP sent — check your email (including spam).");
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setMessage(null);
    if (!otp || otp.trim().length !== 6) {
      setMessage("Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "email"
    });
    setLoading(false);
    if (error) {
      setMessage(error.message || "OTP verification failed.");
    } else if (data?.session?.user) {
      navigate("/dashboard");
    } else {
      // Some flows finalize via onAuthStateChange; show a friendly message.
      setMessage("Verified. You will be redirected shortly.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-center text-2xl font-bold text-gray-800">Welcome to Notes</h1>
        <p className="text-center text-sm text-gray-500 mt-1 mb-6">Sign in with email OTP or Google</p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2 rounded-lg border hover:shadow transition mb-4"
        >
          <FcGoogle className="text-2xl" />
          <span className="font-medium text-gray-700">Sign in with Google</span>
        </button>

        <div className="flex items-center gap-2 my-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <label className="text-xs text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <label className="text-xs text-gray-600">Enter 6-digit OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="●●●●●●"
              maxLength={6}
              inputMode="numeric"
              className="w-full px-3 py-2 border rounded-lg text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              required
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setMessage(null); setOtp(""); }}
                className="flex-1 border rounded-lg py-2 font-medium"
              >
                Back
              </button>
            </div>
            <div className="text-xs text-center text-gray-500">
              Didn’t receive?{" "}
              <button
                type="button"
                onClick={() => handleSendOtp()}
                className="text-indigo-600 underline"
              >
                Resend
              </button>
            </div>
          </form>
        )}

        {message && <div className="mt-4 text-center text-sm text-red-600">{message}</div>}
      </div>
    </div>
  );
}
