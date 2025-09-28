"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Signup() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");

  // ------------------- OTP SIGNUP -------------------
  const handleSignup = async () => {
    if (!email || !name || !dob) {
      setMessage("Please fill all fields.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) setMessage(error.message);
    else {
      setMessage("OTP sent to your email.");
      setStep("otp");
    }
  };

  const handleVerifyOtp = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase.from("users").upsert({
        id: user.id,
        name,
        email,
        dob,
      });

      if (insertError) setMessage(insertError.message);
      else {
        setMessage("Signup successful! Redirecting...");
        window.location.href = "/dashboard";
      }
    }
  };

  // ------------------- GOOGLE SIGNUP -------------------
  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin, // will trigger listener
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage("Google Sign-Up failed: " + err.message);
    }
  };

  // After auth → insert/check users table
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const user = session.user;

          if (user.app_metadata?.provider === "google") {
            // Check if user exists
            const { data: existingUser, error: selectError } = await supabase
              .from("users")
              .select("id")
              .eq("id", user.id)
              .maybeSingle();

            if (selectError) {
              console.error(selectError.message);
              return;
            }

            if (!existingUser) {
              // Insert new Google user
              const { error: insertError } = await supabase.from("users").insert([
                {
                  id: user.id,
                  name: user.user_metadata?.full_name || "Google User",
                  email: user.email,
                  dob: null,
                  created_at: new Date().toISOString(),
                },
              ]);

              if (insertError) {
                console.error("Insert error:", insertError.message);
              }
            }

            // Redirect to dashboard
            window.location.href = "/dashboard";
          }
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ------------------- UI -------------------
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* LEFT SIDE FORM */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-extrabold text-gray-900">Sign up</h1>
          <p className="mt-2 text-gray-600 text-sm">
            Sign up with your details or Google to get started
          </p>

          {step === "form" && (
            <>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <button
                onClick={handleSignup}
                className="mt-6 w-full rounded-lg bg-blue-400 py-3 text-white font-semibold hover:bg-blue-700 transition"
              >
                Send OTP
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Or</p>
              </div>

              <button
                onClick={handleGoogleSignup}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-red-500 py-3 text-white font-semibold hover:bg-red-600 transition"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Sign up with Google
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                className="mt-6 w-full rounded-lg bg-green-600 py-3 text-white font-semibold hover:bg-green-700 transition"
              >
                Verify & Signup
              </button>
            </>
          )}

          {/* Message */}
          {message && (
            <p className="mt-4 text-center text-sm text-blue-600">{message}</p>
          )}

          <p className="mt-6 text-center md:text-centre text-xs text-gray-500">
            Already have an account??{" "}
            <a
              href="/"
              className="underline text-blue-600 hover:text-blue-700"
            >
             Sign in
            </a>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="md:flex md:w-1/2 items-center justify-center">
        <img
          src="/images/signin_background.jpg"
          alt="Signup Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
