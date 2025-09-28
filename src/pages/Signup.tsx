"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const handleSignup = async () => {
    if (!email || !name || !dob) {
      setMessage("Please fill all fields.");
      return;
    }

    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      setMessage("Something went wrong. Please try again.");
      return;
    }

    if (existingUser) {
      setMessage("User already exists, use another account.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) setMessage(error.message);
    else {
      setMessage("OTP sent to your email.");
      setOtpSent(true);
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

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage("Google Sign-Up failed: " + err.message);
    }
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const user = session.user;

          if (user.app_metadata?.provider === "google") {
            const { data: existingUser } = await supabase
              .from("users")
              .select("id")
              .eq("id", user.id)
              .maybeSingle();

            if (!existingUser) {
              await supabase.from("users").insert([
                {
                  id: user.id,
                  name: user.user_metadata?.full_name || "Google User",
                  email: user.email,
                  dob: null,
                  created_at: new Date().toISOString(),
                },
              ]);
            }
            window.location.href = "/dashboard";
          }
        }
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-extrabold text-gray-900">Sign up</h1>
          <p className="mt-2 text-gray-600 text-sm">
            Sign up with your details or Google to get started
          </p>

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

            {otpSent && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <div className="relative">
                  <input
                    type={showOtp ? "text" : "password"}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showOtp ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {!otpSent ? (
              <button
                onClick={handleSignup}
                className="mt-6 w-full rounded-lg bg-blue-400 py-3 text-white font-semibold hover:bg-blue-700 transition"
              >
                Get OTP
              </button>
            ) : (
              <button
                onClick={handleVerifyOtp}
                className="mt-6 w-full rounded-lg bg-green-600 py-3 text-white font-semibold hover:bg-green-700 transition"
              >
                Verify & Signup
              </button>
            )}

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

          {message && (
            <p className="mt-4 text-center text-sm text-red-600">{message}</p>
          )}

          <p className="mt-6 text-center md:text-centre text-xs text-gray-500">
            Already have an account?{" "}
            <a href="/" className="underline text-blue-600 hover:text-blue-700">
              Sign in
            </a>
          </p>
        </div>
      </div>

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
