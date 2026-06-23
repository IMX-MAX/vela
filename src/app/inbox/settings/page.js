"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { account } from "@/lib/appwrite";
import { ArrowLeft, CaretLeft, DotsThree } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkComposioStatus, initiateComposioConnection, getComposioAccessToken } from "@/app/composioActions";

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const { user, checkAuth, googleProfile } = useAuthStore();
  
  const [tab, setTab] = useState(initialTab);
  const [userName, setUserName] = useState("");
  const [jobName, setJobName] = useState("");
  const [company, setCompany] = useState("");
  
  const [composioStatus, setComposioStatus] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (user) {
      setUserName(user.name || "");
      if (user.prefs) {
        setJobName(user.prefs.jobName || "");
        setCompany(user.prefs.company || "");
      }
      
      checkComposioStatus(user.$id).then(status => {
        setComposioStatus(status);
      });
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
        company
      });
      await checkAuth();
    } catch (error) {
      console.error("Failed to update prefs", error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    const callbackUrl = window.location.origin + "/inbox/settings?tab=accounts";
    const res = await initiateComposioConnection(user.$id, callbackUrl);
    
    if (res.connected) {
      const status = await checkComposioStatus(user.$id);
      setComposioStatus(status);
      setIsConnecting(false);
    } else if (res.url) {
      window.location.href = res.url;
    } else {
      setIsConnecting(false);
      alert("Failed to connect: " + (res.error || "Unknown error"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#e7e5e4] flex text-[14px]">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 pt-6 px-4 flex flex-col gap-6 border-r border-[#d6d3d1]/50">
        <button 
          onClick={() => router.push('/inbox')} 
          className="flex items-center gap-2 text-gray-700 font-medium px-2 hover:bg-black/5 rounded-md py-1.5 w-max transition"
        >
          <CaretLeft size={16} weight="bold" /> Back to Inbox
        </button>
        
        <div className="flex flex-col gap-0.5">
          <div className="text-[12px] font-semibold text-gray-400 px-2 mb-1">Account</div>
          <div 
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'profile' ? 'bg-[#d6d3d1] text-gray-900' : 'text-gray-600 hover:bg-[#d6d3d1]/50'}`} 
            onClick={() => setTab('profile')}
          >
            Profile
          </div>
          <div 
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'accounts' ? 'bg-[#d6d3d1] text-gray-900' : 'text-gray-600 hover:bg-[#d6d3d1]/50'}`} 
            onClick={() => setTab('accounts')}
          >
            Connected accounts
          </div>
          <div className="px-3 py-1.5 rounded-lg font-medium text-gray-600 hover:bg-[#d6d3d1]/50 cursor-pointer transition">
            Preferences
          </div>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <div className="text-[12px] font-semibold text-gray-400 px-2 mb-1">Features</div>
          <div className="px-3 py-1.5 rounded-lg font-medium text-gray-600 hover:bg-[#d6d3d1]/50 cursor-pointer transition">Labels</div>
          <div className="px-3 py-1.5 rounded-lg font-medium text-gray-600 hover:bg-[#d6d3d1]/50 cursor-pointer transition">Blocked senders</div>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <div className="text-[12px] font-semibold text-gray-400 px-2 mb-1">Organization</div>
          <div className="px-3 py-1.5 rounded-lg font-medium text-gray-600 hover:bg-[#d6d3d1]/50 cursor-pointer transition">Workspace</div>
          <div className="px-3 py-1.5 rounded-lg font-medium text-gray-600 hover:bg-[#d6d3d1]/50 cursor-pointer transition">Members</div>
          <div className="px-3 py-1.5 rounded-lg font-medium text-gray-600 hover:bg-[#d6d3d1]/50 cursor-pointer transition">Billing</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-16 py-12">
        {tab === 'profile' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-medium text-gray-900 mb-8">Profile</h1>
            
            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Profile details</h2>
            <div className="bg-[#f7f7f6] rounded-xl border border-[#d6d3d1]/60 p-6 mb-10 shadow-sm">
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Profile picture</label>
                {googleProfile?.picture ? (
                  <img src={googleProfile.picture} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#e7e5e4] flex items-center justify-center text-sm font-semibold text-[#8baba4]">
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
                  className="w-full bg-transparent border border-[#d6d3d1] rounded-md px-3 py-2 text-[14px] text-gray-900 outline-none focus:border-gray-400 transition"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Primary email address</label>
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-transparent border border-[#d6d3d1] rounded-md px-3 py-2 text-[14px] text-gray-400 outline-none cursor-not-allowed"
                />
              </div>

              <div className="mb-6">
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Job Title (AI Context)</label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  onBlur={handleSavePrefs}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-transparent border border-[#d6d3d1] rounded-md px-3 py-2 text-[14px] text-gray-900 outline-none focus:border-gray-400 transition"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Company (AI Context)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onBlur={handleSavePrefs}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-transparent border border-[#d6d3d1] rounded-md px-3 py-2 text-[14px] text-gray-900 outline-none focus:border-gray-400 transition"
                />
              </div>
            </div>

            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Workspace access</h2>
            <div className="bg-[#f7f7f6] rounded-xl border border-[#d6d3d1]/60 p-6 shadow-sm flex items-center justify-between">
              <span className="text-gray-900 font-medium text-[14px]">Remove yourself from the workspace.</span>
              <button className="px-4 py-1.5 bg-white border border-[#d6d3d1] rounded-md text-[13px] font-medium text-gray-800 hover:bg-gray-50 transition shadow-sm">
                Leave workspace
              </button>
            </div>
          </div>
        )}

        {tab === 'accounts' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-medium text-gray-900 mb-8">Connected accounts</h1>
            
            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Google / Gmail native</h2>
            <div className="bg-[#f7f7f6] rounded-xl border border-[#d6d3d1]/60 shadow-sm mb-10 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#d6d3d1]/60">
                    <th className="font-medium text-gray-500 text-[13px] py-3 px-6">Name</th>
                    <th className="font-medium text-gray-500 text-[13px] py-3 px-6 w-24">Status</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#d6d3d1]/40 last:border-0 hover:bg-black/[0.02] transition">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#e7e5e4] flex items-center justify-center text-xs font-semibold text-[#8baba4]">
                        {user?.name ? user.name.slice(0, 5).toLowerCase() : "usr"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user?.name}</div>
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

            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Composio MCP</h2>
            <div className="bg-[#f7f7f6] rounded-xl border border-[#d6d3d1]/60 shadow-sm mb-10 overflow-hidden">
              {composioStatus?.connected ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#d6d3d1]/60">
                      <th className="font-medium text-gray-500 text-[13px] py-3 px-6">Name</th>
                      <th className="font-medium text-gray-500 text-[13px] py-3 px-6 w-24">Status</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#d6d3d1]/40 last:border-0 hover:bg-black/[0.02] transition">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white border border-[#d6d3d1] flex items-center justify-center text-[10px] font-bold text-gray-900">
                          CMP
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Composio MCP</div>
                          <div className="text-[13px] text-gray-500">Connected for AI actions</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">Active</td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-gray-400 hover:text-gray-800 transition"><DotsThree size={20} weight="bold" /></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="p-4 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 font-medium text-gray-900">
                    <span className="flex items-center justify-center h-5 w-5 bg-white border border-[#d6d3d1] rounded-full text-[8px] font-bold">
                      CMP
                    </span>
                    Composio connection
                  </div>
                  <button 
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="px-4 py-1.5 bg-white border border-[#d6d3d1] rounded-md text-[13px] font-medium text-gray-800 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
                  >
                    {isConnecting ? "Connecting..." : "Connect"}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
