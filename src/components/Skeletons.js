"use client";

// Lightweight shimmer placeholders used while data loads. Kept dependency-free
// so they render instantly and match the existing list layouts.

function Bar({ className = "" }) {
  return <div className={`bg-[#2b323b]/10 rounded animate-pulse ${className}`} />;
}

export function EmailListSkeleton({ rows = 10 }) {
  return (
    <div className="flex flex-col" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col md:flex-row md:items-center px-4 md:px-6 py-3 md:py-2.5 border-b border-[#2b323b]/5 gap-2 md:gap-0"
        >
          <div className="flex items-center md:w-48 pr-4">
            <div className="w-4 flex-shrink-0" />
            <Bar className="h-3.5 w-28" />
          </div>
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <Bar className="h-3.5 w-32 md:w-40" />
            <Bar className="h-3 flex-1 max-w-md hidden md:block" />
          </div>
          <Bar className="h-3 w-12 ml-auto md:ml-4 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function EmailDetailSkeleton({ subject }) {
  return (
    <div className="flex flex-col h-full bg-[#eceae6] rounded-2xl relative overflow-y-auto" aria-hidden="true">
      <div className="h-14 flex items-center justify-between px-4 sticky top-0 z-10 rounded-t-2xl bg-[#eceae6] border-b border-[#dddcdc]">
        <div className="flex items-center gap-1.5">
          <Bar className="h-8 w-8 rounded-md" />
          <Bar className="h-4 w-16 ml-2" />
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bar key={i} className="h-8 w-8 rounded-md" />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-8 pb-12 pt-4">
        {subject ? (
          <h1 className="text-2xl font-medium text-[#2b323b] mb-8 text-center">{subject}</h1>
        ) : (
          <Bar className="h-8 w-2/3 mx-auto mb-8" />
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-8 py-6 flex items-start justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#2b323b]/10 animate-pulse shrink-0" />
              <div className="space-y-2">
                <Bar className="h-4 w-36" />
                <Bar className="h-3 w-16" />
              </div>
            </div>
            <Bar className="h-3 w-28" />
          </div>

          <div className="px-8 py-4 border-b border-gray-100 flex gap-3">
            <Bar className="h-8 w-24 rounded-full" />
            <Bar className="h-8 w-28 rounded-full" />
          </div>

          <div className="p-8 space-y-4">
            <Bar className="h-4 w-full" />
            <Bar className="h-4 w-11/12" />
            <Bar className="h-4 w-10/12" />
            <Bar className="h-4 w-full mt-4" />
            <Bar className="h-4 w-9/12" />
            <Bar className="h-4 w-8/12" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="px-4 py-3 bg-[#fbfbfc] border-b border-gray-100">
            <Bar className="h-3.5 w-32" />
          </div>
          <div className="p-4 space-y-3 min-h-[150px]">
            <Bar className="h-4 w-full" />
            <Bar className="h-4 w-4/5" />
            <Bar className="h-4 w-3/5" />
          </div>
          <div className="px-4 py-3 bg-[#fbfbfc] border-t border-gray-100 flex justify-end">
            <Bar className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactsSkeleton({ rows = 10 }) {
  return (
    <div className="flex flex-col bg-white min-h-full" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center px-6 py-2.5 border-b border-[#2b323b]/5">
          <div className="w-[30%] flex items-center gap-4 pr-4">
            <div className="h-9 w-9 rounded-full bg-[#2b323b]/10 animate-pulse shrink-0" />
            <Bar className="h-3.5 w-28" />
          </div>
          <div className="w-[25%] pr-4"><Bar className="h-3 w-36" /></div>
          <div className="w-[20%] pr-4"><Bar className="h-3 w-24" /></div>
          <div className="flex-1"><Bar className="h-3 w-32" /></div>
          <div className="w-16" />
        </div>
      ))}
    </div>
  );
}
