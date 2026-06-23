"use client";

import { useAuthStore } from "@/lib/store";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, user } = useAuthStore();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/inbox");
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let res;
    if (isLogin) {
      res = await loginWithEmail(email, password);
    } else {
      res = await registerWithEmail(email, password, name || email.split("@")[0]);
    }

    if (!res.success) {
      setError(res.error || "An error occurred");
      setLoading(false);
    } else {
      router.push("/inbox");
    }
  };

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
            <img src="/logo.svg" alt="Vela Logo" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-2xl font-semibold text-white mb-2">
          {isLogin ? "Sign in to Vela" : "Create a Vela account"}
        </h1>

        {/* Toggle Link */}
        <p className="text-center text-sm text-gray-400 mb-8">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="font-medium text-white hover:underline"
          >
            {isLogin ? "Sign up" : "Log in."}
          </button>
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
            Log in with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.1]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#2b323b] px-4 text-gray-500">or</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[#50686c] mb-1.5">Name</label>
              <input 
                type="text" 
                placeholder="Your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-white/[0.1] bg-white/[0.05] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#50686c]/50 focus:border-[#50686c]/50 transition"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#50686c] mb-1.5">Email</label>
            <input 
              type="email" 
              placeholder="alan.turing@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-white/[0.1] bg-white/[0.05] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#50686c]/50 focus:border-[#50686c]/50 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#50686c] mb-1.5">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-white/[0.1] bg-white/[0.05] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#50686c]/50 focus:border-[#50686c]/50 transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-lg bg-white/[0.08] border border-white/[0.1] px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/[0.14] hover:text-white disabled:opacity-50"
          >
            {loading ? "Please wait..." : (isLogin ? "Sign in" : "Create account")}
          </button>
        </form>

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
