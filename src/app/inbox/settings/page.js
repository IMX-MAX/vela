"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { account } from "@/lib/appwrite";
import { ArrowLeft, CaretLeft, DotsThree } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";


export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const { user, checkAuth, googleProfile } = useAuthStore();
  
  const [tab, setTab] = useState(initialTab);
  const [userName, setUserName] = useState("");
  const [jobName, setJobName] = useState("");
  const [company, setCompany] = useState("");
  const [writingStyle, setWritingStyle] = useState("");

  useEffect(() => {
    if (user) {
      setUserName(user.name || "");
      if (user.prefs) {
        setJobName(user.prefs.jobName || "");
        setCompany(user.prefs.company || "");
        setWritingStyle(user.prefs.writingStyle || "");
      }
    }
  }, [user]);

  const handleSaveName = async () => {
    if (userName !== user?.name) {
      try {
        await account.updateName(userName);
        await checkAuth();
      } catch (error) {
        console.error("Failed to update name", error);
      }
    }
  };

  const handleSavePrefs = async () => {
    try {
      await account.updatePrefs({
        ...user.prefs,
        jobName,
        company,
        writingStyle
      });
      await checkAuth();
    } catch (error) {
      console.error("Failed to update prefs", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#dddcdc] flex text-[14px]">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 pt-6 px-4 flex flex-col gap-6 border-r border-[#dddcdc]/50">
        <button 
          onClick={() => router.push('/inbox')} 
          className="flex items-center gap-2 text-gray-700 font-medium px-2 hover:bg-[#2b323b]/5 rounded-md py-1.5 w-max transition"
        >
          <CaretLeft size={16} weight="bold" /> Back to Inbox
        </button>
        
        <div className="flex flex-col gap-0.5">
          <div className="text-[12px] font-semibold text-gray-400 px-2 mb-1">Account</div>
          <div 
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'profile' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => setTab('profile')}
          >
            Profile
          </div>
          <div 
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'accounts' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => setTab('accounts')}
          >
            Connected accounts
          </div>
          <div 
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'context' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => setTab('context')}
          >
            AI Context
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-16 py-12">
        {tab === 'profile' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-medium text-[#2b323b] mb-8">Profile</h1>
            
            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Profile details</h2>
            <div className="bg-[#eceae6] rounded-xl border border-[#dddcdc]/60 p-6 mb-10 shadow-sm">
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Profile picture</label>
                {googleProfile?.picture ? (
                  <img src={googleProfile.picture} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#dddcdc] flex items-center justify-center text-sm font-semibold text-[#50686c]">
                    {user?.name ? user.name.slice(0, 5).toLowerCase() : "usr"}
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Full name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onBlur={handleSaveName}
                  className="w-full bg-transparent border border-[#dddcdc] rounded-md px-3 py-2 text-[14px] text-[#2b323b] outline-none focus:border-gray-400 transition"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Primary email address</label>
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-transparent border border-[#dddcdc] rounded-md px-3 py-2 text-[14px] text-gray-400 outline-none cursor-not-allowed"
                />
              </div>

            </div>

          </div>
        )}

        {tab === 'context' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-medium text-[#2b323b] mb-8">AI Context</h1>
            
            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Professional identity</h2>
            <div className="bg-[#eceae6] rounded-xl border border-[#dddcdc]/60 p-6 mb-10 shadow-sm">
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Job Title</label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  onBlur={handleSavePrefs}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-transparent border border-[#dddcdc] rounded-md px-3 py-2 text-[14px] text-[#2b323b] outline-none focus:border-gray-400 transition"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onBlur={handleSavePrefs}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-transparent border border-[#dddcdc] rounded-md px-3 py-2 text-[14px] text-[#2b323b] outline-none focus:border-gray-400 transition"
                />
              </div>
            </div>

            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Dynamic profiling</h2>
            <div className="bg-[#eceae6] rounded-xl border border-[#dddcdc]/60 p-6 shadow-sm">
              <div>
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Writing style</label>
                <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
                  The AI automatically updates this profile as you send emails. You can manually edit it to fine-tune how the AI drafts emails for you.
                </p>
                <textarea
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value)}
                  onBlur={handleSavePrefs}
                  placeholder="e.g. Casual but professional. Always signs off with 'Cheers'."
                  className="w-full bg-transparent border border-[#dddcdc] rounded-md px-3 py-2 text-[14px] text-[#2b323b] outline-none focus:border-gray-400 transition min-h-[120px] resize-y"
                />
              </div>
            </div>

          </div>
        )}

        {tab === 'accounts' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-medium text-[#2b323b] mb-8">Connected accounts</h1>
            
            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Google / Gmail native</h2>
            <div className="bg-[#eceae6] rounded-xl border border-[#dddcdc]/60 shadow-sm mb-10 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#dddcdc]/60">
                    <th className="font-medium text-gray-500 text-[13px] py-3 px-6">Name</th>
                    <th className="font-medium text-gray-500 text-[13px] py-3 px-6 w-24">Status</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#dddcdc]/40 last:border-0 hover:bg-[#2b323b]/[0.02] transition">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#dddcdc] flex items-center justify-center text-xs font-semibold text-[#50686c]">
                        {user?.name ? user.name.slice(0, 5).toLowerCase() : "usr"}
                      </div>
                      <div>
                        <div className="font-medium text-[#2b323b]">{user?.name}</div>
                        <div className="text-[13px] text-gray-500">{user?.email} &middot; Primary account</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">Active</td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-gray-400 hover:text-gray-800 transition"><DotsThree size={20} weight="bold" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>



          </div>
        )}
      </div>
    </div>
  );
}
