"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";  

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      setMessage("Please enter your email first.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMessage(error.message);
    else {
      setOtpSent(true);
      setMessage("A 6-digit OTP has been sent to your email.");
    }
  };

  const handleVerifyOtp = async () => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Login successful! Redirecting...");
      window.location.href = "/dashboard";
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/", 
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setMessage("Google Sign-In failed: " + err.message);
    }
  };

  useEffect(() => {
    const checkAndInsertUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const user = session.user;

        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existingUser) {
          await supabase.from("users").insert([
            {
              id: user.id,
              name: user.user_metadata.full_name || "Google User",
              email: user.email,
              dob: null,
              created_at: new Date().toISOString(),
            },
          ]);
        }
        window.location.href = "/dashboard";
      }
    };

    checkAndInsertUser();
  }, []);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center md:text-left">
            Sign in
          </h1>
          <p className="mt-2 text-gray-600 text-center md:text-left text-sm">
            Please login to continue to your account
          </p>

          
          <div className="mt-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
            />
          </div>

          {otpSent && (
            <div className="mt-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                OTP
              </label>

              <div className="relative">
                <input
                  id="otp"
                  type={showOtp ? "text" : "password"} 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowOtp(!showOtp)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showOtp ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Resend OTP
              </button>
            </div>
          )}

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              className="mt-6 w-full rounded-lg bg-blue-400 py-3 text-white font-semibold shadow hover:bg-blue-700 transition"
            >
              Get OTP
            </button>
          ) : (
            <button
              onClick={handleVerifyOtp}
              className="mt-6 w-full rounded-lg bg-blue-400 py-3 text-white font-semibold shadow hover:bg-green-700 transition"
            >
              Verify OTP & Sign In
            </button>
          )}

          <button
            onClick={handleGoogleLogin}
            className="mt-4 w-full rounded-lg bg-red-500 py-3 text-white font-semibold shadow hover:bg-red-600 transition flex items-center justify-center gap-2"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>

          {message && (
            <p className="mt-4 text-center text-sm text-red-600">{message}</p>
          )}

          <p className="mt-6 text-center md:text-centre text-xs text-gray-500">
            Need an account?{" "}
            <a
              href="/signup"
              className="underline text-blue-600 hover:text-blue-700"
            >
              Create one
            </a>
          </p>
        </div>
      </div>

      <div className="md:flex md:w-1/2 items-center justify-center">
        <img
          src="/images/signin_background.jpg"
          alt="Signin Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
