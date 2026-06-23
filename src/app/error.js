"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#2b323b] px-6 text-center text-white">
      <div className="max-w-md">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl">
          ⚠️
        </div>
        <h1 className="mb-3 text-2xl font-semibold">Something went wrong</h1>
        <p className="mb-8 text-sm leading-relaxed text-gray-400">
          An unexpected error occurred. You can try again, or head back to your inbox.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[#2b323b] transition hover:bg-gray-100"
          >
            Try again
          </button>
          <a
            href="/inbox"
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/[0.08]"
          >
            Go to inbox
          </a>
        </div>
      </div>
    </div>
  );
}
