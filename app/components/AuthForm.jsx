"use client";
import backgroundImg from "@/public/assets/bg.jpg"; // assuming image is here

import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClinets";

export default function AuthForm() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleAuth = async () => {
    if (mode === "signup" && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        localStorage.setItem("userEmail", email);
        alert("Logged in successfully!");
        router.push("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user?.aud === "authenticated") {
          localStorage.setItem("userEmail", email);
          alert("Account created! You are logged in.");
          router.push("/dashboard");
        } else {
          alert("Check your email for the confirmation link!");
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className="flex items-center justify-end min-h-screen w-full px-8 bg-gray-100"
      style={{
        backgroundImage: `url(${backgroundImg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === "login" ? "Login" : "Sign Up"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {mode === "signup" && (
          <>
            <input
              type="tel"
              placeholder="Mobile number (optional)"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </>
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 mb-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
        >
          {loading
            ? mode === "login"
              ? "Logging in..."
              : "Signing up..."
            : mode === "login"
            ? "Login"
            : "Sign Up"}
        </button>

        <p className="mt-4 text-center text-gray-600">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-blue-600 underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-blue-600 underline"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

