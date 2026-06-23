import { EmailListSkeleton } from "@/components/Skeletons";

export default function InboxLoading() {
  return (
    <div className="flex flex-col h-full bg-[#eceae6] rounded-2xl relative">
      <div className="h-14 border-b border-[#dddcdc] flex items-center px-6 sticky top-0 bg-[#eceae6]/90 backdrop-blur-sm z-10 rounded-t-2xl">
        <div className="bg-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm flex items-center gap-2">
          Inbox
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        <EmailListSkeleton rows={12} />
      </div>
    </div>
  );
}
