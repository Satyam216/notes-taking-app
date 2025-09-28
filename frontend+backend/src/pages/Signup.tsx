"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Signup() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");

  //Send OTP
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

  //Verify OTP and Save Profile
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
      const { error: insertError } = await supabase
        .from("users")
        .upsert({
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

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Sign up
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Sign up with your details to get started
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
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="md:flex md:w-1/2 items-center justify-center ">
        <img
          src="../../images/signin_background.jpg"
          alt="Signup Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
