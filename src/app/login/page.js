"use client";

import { useAuthStore } from "@/lib/store";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";

function LoginForm() {
  const { loginWithGoogle, user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("upgrade") === "true") {
      sessionStorage.setItem("upgradeIntent", "true");
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/inbox");
    }
  }, [user, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#2b323b] relative overflow-hidden">
      {/* Abstract gradient background similar to reference */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[70%] bg-gradient-to-bl from-[#50686c]/40 via-[#3a4a50]/20 to-transparent blur-[60px]"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-[#50686c]/20 via-transparent to-transparent blur-[80px]"></div>
        {/* Subtle light streaks */}
        <div className="absolute top-[10%] right-[15%] w-[300px] h-[600px] bg-gradient-to-b from-white/[0.04] to-transparent rotate-[-20deg] blur-[30px]"></div>
        <div className="absolute top-[5%] right-[25%] w-[200px] h-[500px] bg-gradient-to-b from-white/[0.03] to-transparent rotate-[-30deg] blur-[20px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden bg-white p-2 shadow-lg shadow-black/20">
            <img src="/logo.png" alt="Vela Logo" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-2xl font-semibold text-white mb-2">
          Sign in to Vela
        </h1>

        <p className="text-center text-sm text-gray-400 mb-8">
          Welcome back to the fastest AI email client.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
            {error}
          </div>
        )}

        {/* Google Button - Centered */}
        <div className="flex justify-center mb-6">
          <button
            onClick={loginWithGoogle}
            className="flex items-center justify-center gap-3 rounded-lg bg-white/[0.08] border border-white/[0.12] px-8 py-3 text-sm font-medium text-gray-200 transition hover:bg-white/[0.14] hover:border-white/[0.2] w-full"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* Terms */}
        <div className="mt-8 text-center text-xs text-gray-500 leading-relaxed">
          By signing up, you agree to our{" "}
          <a href="/terms" className="text-[#50686c] hover:text-[#6a8a8f] underline transition">Terms</a>,{" "}
          <a href="/privacy" className="text-[#50686c] hover:text-[#6a8a8f] underline transition">Acceptable Use</a>, and{" "}
          <a href="/privacy" className="text-[#50686c] hover:text-[#6a8a8f] underline transition">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#2b323b]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
