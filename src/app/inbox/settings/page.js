"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { account } from "@/lib/appwrite";
import { getUsageStatus } from "@/lib/usage";
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
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    if (user) {
      setUserName(user.name || "");
      if (user.prefs) {
        setJobName(user.prefs.jobName || "");
        setCompany(user.prefs.company || "");
        setWritingStyle(user.prefs.writingStyle || "");
        setPlan(user.prefs.plan || "free");
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

  const handleSetPlan = async (newPlan) => {
    try {
      await account.updatePrefs({
        ...user?.prefs,
        plan: newPlan
      });
      setPlan(newPlan);
      await checkAuth();
    } catch (error) {
      console.error("Failed to update plan", error);
    }
  };

  const usageStatus = getUsageStatus(user);

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
    <div className="fixed inset-0 z-[60] bg-[#dddcdc] flex flex-col md:flex-row text-[14px]">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 pt-4 md:pt-6 px-4 flex md:flex-col gap-2 md:gap-6 border-b md:border-b-0 md:border-r border-gray-300 md:border-[#dddcdc]/50 overflow-x-auto md:overflow-x-visible hide-scrollbar">
        <button 
          onClick={() => router.push('/inbox')} 
          className="flex items-center gap-1 md:gap-2 text-gray-700 font-medium px-2 hover:bg-[#2b323b]/5 rounded-md py-1.5 w-max transition flex-shrink-0"
        >
          <CaretLeft size={16} weight="bold" /> <span className="hidden md:inline">Back to Inbox</span><span className="md:hidden">Back</span>
        </button>
        
        <div className="flex md:flex-col gap-1 md:gap-0.5 items-center md:items-stretch pb-2 md:pb-0">
          <div className="hidden md:block text-[12px] font-semibold text-gray-400 px-2 mb-1">Account</div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'profile' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => setTab('profile')}
          >
            Profile
          </div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'accounts' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => setTab('accounts')}
          >
            Connected accounts
          </div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'context' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => setTab('context')}
          >
            AI Context
          </div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'billing' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => setTab('billing')}
          >
            Billing
          </div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'usage' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => setTab('usage')}
          >
            Usage
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-16 py-6 md:py-12 bg-[#eceae6] md:bg-transparent">
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

        {tab === 'billing' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-medium text-[#2b323b] mb-8">Billing & Plans</h1>
            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Choose your plan</h2>
            <div className="grid grid-cols-2 gap-6 mb-10">
              {/* Free Plan */}
              <div className={`bg-[#eceae6] rounded-xl border p-6 shadow-sm cursor-pointer transition ${plan === 'free' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[#dddcdc]/60 hover:border-gray-400'}`} onClick={() => handleSetPlan('free')}>
                <div className="font-semibold text-lg text-gray-800 mb-2">Free Plan</div>
                <div className="text-sm text-gray-600 mb-4">Perfect for casual use.</div>
                <div className="text-2xl font-bold text-[#2b323b] mb-4">$0 <span className="text-sm font-normal text-gray-500">/mo</span></div>
                <ul className="text-[13px] text-gray-700 space-y-2 mb-6">
                  <li>&bull; 50 AI actions per month</li>
                  <li>&bull; Basic email summarization</li>
                </ul>
                <div className={`text-center py-2 rounded-lg font-medium text-[13px] ${plan === 'free' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-800 border border-gray-300'}`}>
                  {plan === 'free' ? 'Current Plan' : 'Select Free'}
                </div>
              </div>
              
              {/* Pro Plan — selection disabled during beta (billing not yet live) */}
              <div className={`bg-[#eceae6] rounded-xl border p-6 shadow-sm transition ${plan === 'pro' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[#dddcdc]/60 opacity-80 cursor-not-allowed'}`}>
                <div className="font-semibold text-lg text-gray-800 mb-2">Pro Plan</div>
                <div className="text-sm text-gray-600 mb-4">For power users.</div>
                <div className="text-2xl font-bold text-[#2b323b] mb-4">$12 <span className="text-sm font-normal text-gray-500">/mo</span></div>
                <ul className="text-[13px] text-gray-700 space-y-2 mb-6">
                  <li>&bull; 50 AI actions per day</li>
                  <li>&bull; Advanced contextual replies</li>
                </ul>
                <div className={`text-center py-2 rounded-lg font-medium text-[13px] ${plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-800 border border-gray-300'}`}>
                  {plan === 'pro' ? 'Current Plan' : 'unavaiable during beta'}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'usage' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-medium text-[#2b323b] mb-8">AI Usage</h1>
            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Current period usage</h2>
            <div className="bg-[#eceae6] rounded-xl border border-[#dddcdc]/60 p-6 mb-10 shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-3xl font-semibold text-[#2b323b]">{usageStatus.current} <span className="text-lg font-normal text-gray-500">/ {usageStatus.limit} actions</span></div>
                  <div className="text-[13px] text-gray-600 mt-1">
                    Your {usageStatus.plan} plan limits you to {usageStatus.limit} actions per {usageStatus.plan === 'pro' ? 'day' : 'month'}.
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-[#dddcdc] rounded-full h-3 mb-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${usageStatus.current >= usageStatus.limit ? 'bg-red-500' : 'bg-[#50686c]'}`} 
                  style={{ width: `${Math.min((usageStatus.current / usageStatus.limit) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="text-[13px] text-gray-500">
                Usage resets {usageStatus.plan === 'pro' ? 'daily at 12:00 AM NYC time' : 'on the 1st of each month (NYC time)'}.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
