import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#2b323b] px-6 text-center text-white">
      <div className="max-w-md">
        <div className="mb-6 text-6xl font-semibold tracking-tight text-white/20">404</div>
        <h1 className="mb-3 text-2xl font-semibold">Page not found</h1>
        <p className="mb-8 text-sm leading-relaxed text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[#2b323b] transition hover:bg-gray-100"
          >
            Back home
          </Link>
          <Link
            href="/inbox"
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/[0.08]"
          >
            Go to inbox
          </Link>
        </div>
      </div>
    </div>
  );
}
