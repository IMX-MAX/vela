"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/inbox");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#e4e3e0]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div>
    </div>
  );
}
