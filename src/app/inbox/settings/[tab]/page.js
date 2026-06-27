"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { account } from "@/lib/appwrite";
import { getUsageStatus } from "@/lib/usage";
import { ArrowLeft, CaretLeft, DotsThree, Question, WarningOctagon, ChatCircle, ArrowRight } from "@phosphor-icons/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import ShortcutsTab from "@/components/ShortcutsTab";


export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const tab = params.tab || "profile";
  const { user, checkAuth, googleProfile } = useAuthStore();
  const [userName, setUserName] = useState("");
  const [jobName, setJobName] = useState("");
  const [company, setCompany] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [plan, setPlan] = useState("free");
  const [billingCycle, setBillingCycle] = useState("annual");
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      // Clean up URL params
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.pathname);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setUserName(user.name || "");
      if (user.prefs) {
        setJobName(user.prefs.jobName || "");
        setCompany(user.prefs.company || "");
        setWritingStyle(user.prefs.writingStyle || "");
      }
      if (user.db) {
        setPlan(user.db.subscriptionPlan || "free");
      }
    }
  }, [user]);

  const getConnectedAccounts = () => {
    if (!user?.db?.connectedAccounts) return [];
    try {
      return JSON.parse(user.db.connectedAccounts);
    } catch(e) { return []; }
  };

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

  const handleConnectAccount = (reconnectIdx = null) => {
    if (plan !== 'pro') {
      useAuthStore.getState().setShowUpgradeModal(true);
      return;
    }
    const currentAccounts = getConnectedAccounts();
    if (reconnectIdx === null && currentAccounts.length >= 2) return;

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const popup = window.open('/api/oauth/google', 'Google OAuth', `width=${width},height=${height},left=${left},top=${top}`);

    const messageListener = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === 'OAUTH_SUCCESS') {
        window.removeEventListener('message', messageListener);
        const { tokens, profile } = event.data.payload;
        
        let newAccounts = [...currentAccounts];
        
        if (reconnectIdx !== null) {
          if (profile.email !== currentAccounts[reconnectIdx].email) {
            alert("You must reconnect with the same email account: " + currentAccounts[reconnectIdx].email);
            return;
          }
          newAccounts[reconnectIdx] = {
            ...newAccounts[reconnectIdx],
            token: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiry: tokens.expiry_date,
            isPaused: false
          };
        } else {
          // Duplicate check
          if (profile.email === user?.email || currentAccounts.some(a => a.email === profile.email)) {
            alert("This account is already connected.");
            return;
          }
          newAccounts.push({
            name: profile.name,
            email: profile.email,
            picture: profile.picture,
            token: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiry: tokens.expiry_date,
            isPaused: false
          });
        }
        
        const { account } = await import('@/lib/appwrite');
        const jwtResponse = await account.createJWT();
        await fetch('/api/user/update-accounts', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtResponse.jwt}`
          },
          body: JSON.stringify({ accounts: newAccounts })
        });
        await checkAuth();
      } else if (event.data.type === 'OAUTH_ERROR') {
        window.removeEventListener('message', messageListener);
        console.error("OAuth Error:", event.data.payload);
        alert("Failed to connect account: " + event.data.payload);
      }
    };
    window.addEventListener('message', messageListener);
  };

  const openStripePortal = async () => {
    try {
      const { account } = await import('@/lib/appwrite');
      const jwtResponse = await account.createJWT();
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwtResponse.jwt}` }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Portal Error: ' + data.error);
      }
    } catch(e) {
      console.error('Failed to open portal', e);
    }
  };

  const handleSetPlan = async (newPlan) => {
    if (plan === 'pro' && newPlan === 'free') {
      await openStripePortal();
      return;
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

  const handleDeleteAccount = async () => {
    
    if (confirm("Are you sure you want to delete your account? This action cannot be undone. All your connected accounts and local data will be permanently removed.")) {
      try {
        const { account } = await import('@/lib/appwrite');
        const jwtResponse = await account.createJWT();
        const res = await fetch('/api/account/delete', { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwtResponse.jwt}`
          }
        });
        if (!res.ok) throw new Error("Failed to delete");
        
        import('idb-keyval').then(({ clear }) => {
          clear().then(() => {
            useAuthStore.getState().logout().then(() => {
              router.push('/');
            });
          });
        });
      } catch (error) {
        console.error("Failed to delete account", error);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  const handleCopyId = () => {
    if (user?.$id) {
      navigator.clipboard.writeText(user.$id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleClearLocalData = () => {
    if (confirm("Are you sure you want to clear your local data? You will be signed out and need to reconnect.")) {
      import('idb-keyval').then(({ clear }) => {
        clear().then(() => {
          useAuthStore.getState().logout().then(() => {
            router.push('/');
          });
        });
      });
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
            onClick={() => router.push('/inbox/settings/profile')}
          >
            Profile
          </div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'accounts' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => router.push('/inbox/settings/accounts')}
          >
            Connected accounts
          </div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'context' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => router.push('/inbox/settings/context')}
          >
            AI Context
          </div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'billing' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => router.push('/inbox/settings/billing')}
          >
            Billing
          </div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'shortcuts' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => router.push('/inbox/settings/shortcuts')}
          >
            Keyboard Shortcuts
          </div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'usage' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => router.push('/inbox/settings/usage')}
          >
            Usage
          </div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'privacy' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => router.push('/inbox/settings/privacy')}
          >
            Privacy & Data
          </div>
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'support' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => router.push('/inbox/settings/support')}
          >
            Support
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
                <img 
                  src={googleProfile?.picture || `https://unavatar.io/${user?.email || ''}?fallback=https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} 
                  alt="Profile" 
                  className="h-10 w-10 rounded-full object-cover bg-white" 
                />
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

        {tab === 'shortcuts' && <ShortcutsTab />}

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
                      <img 
                        src={googleProfile?.picture || `https://unavatar.io/${user?.email || ''}?fallback=https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} 
                        alt="Profile" 
                        className="h-8 w-8 rounded-full object-cover bg-white" 
                      />
                      <div>
                        <div className="font-medium text-[#2b323b]">{user?.name}</div>
                        <div className="text-[13px] text-gray-500">{user?.email} &middot; Primary account</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">Active</td>
                    <td className="py-4 px-6 text-right">
                      {/* Primary account cannot be removed */}
                    </td>
                  </tr>
                  {getConnectedAccounts().map((acc, idx) => (
                    <tr key={idx} className="border-b border-[#dddcdc]/40 last:border-0 hover:bg-[#2b323b]/[0.02] transition">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img 
                          src={acc.picture || `https://ui-avatars.com/api/?name=${acc.name || 'U'}&background=random`} 
                          alt="Profile" 
                          className="h-8 w-8 rounded-full object-cover bg-white" 
                        />
                        <div>
                          <div className="font-medium text-[#2b323b]">{acc.name}</div>
                          <div className="text-[13px] text-gray-500">{acc.email} &middot; Secondary account</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {acc.isPaused ? (
                          <span className="text-orange-500 font-medium text-[13px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Paused
                          </span>
                        ) : (
                          <span className="text-gray-700">Active</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right flex items-center justify-end gap-3">
                        {acc.isPaused && (
                          <button 
                            onClick={() => handleConnectAccount(idx)}
                            className="text-[#2b323b] hover:text-black transition text-[13px] font-medium border border-gray-300 px-2 py-1 rounded-md"
                          >
                            Reconnect
                          </button>
                        )}
                        <button 
                          className="text-red-400 hover:text-red-600 transition text-[13px] font-medium"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to remove this account?")) {
                              const newAccounts = [...getConnectedAccounts()];
                              newAccounts.splice(idx, 1);
                              await fetch('/api/user/update-accounts', {
                                method: 'POST',
                                body: JSON.stringify({ accounts: newAccounts })
                              });
                              await checkAuth();
                            }
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => handleConnectAccount(null)}
                disabled={getConnectedAccounts().length >= 2 && plan === 'pro'}
                className={`px-4 py-2 rounded-lg font-medium text-[13px] transition ${
                  getConnectedAccounts().length >= 2 && plan === 'pro'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2b323b] text-white hover:bg-[#1a1f24] shadow-sm'
                }`}
              >
                {plan === 'pro' ? 'Connect additional account' : 'Connect additional account (Pro)'}
              </button>
            </div>

          </div>
        )}

        {tab === 'billing' && (
          <div className="max-w-2xl relative">
            {showSuccess && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-[14px] font-medium">Welcome to Vela Pro! Your subscription is now active.</span>
                </div>
                <button onClick={() => setShowSuccess(false)} className="text-emerald-600 hover:text-emerald-800 transition"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            )}
            <h1 className="text-2xl font-medium text-[#2b323b] mb-8">Billing & Plans</h1>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-medium text-gray-800">Choose your plan</h2>
              <div className="flex items-center gap-2 bg-[#eceae6] p-1 rounded-lg border border-[#dddcdc]">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 text-[13px] font-medium rounded-md transition ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-[#2b323b]' : 'text-gray-500'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1 text-[13px] font-medium rounded-md transition ${billingCycle === 'annual' ? 'bg-white shadow-sm text-[#2b323b]' : 'text-gray-500'}`}
                >
                  Annual
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Free Plan */}
              <div 
                className={`relative bg-white rounded-2xl border p-7 shadow-sm transition-all duration-300 ${plan === 'free' || user?.db?.cancelAtPeriodEnd ? 'border-gray-300 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer'}`} 
                onClick={() => handleSetPlan('free')}
              >
                <div className="font-bold text-2xl text-gray-900 mb-1">Free</div>
                <div className="text-[13px] text-gray-500 mb-6">Perfect for casual use.</div>
                
                <div className="flex items-end gap-2 mb-6">
                  <div className="text-5xl font-bold text-gray-900">$0</div>
                  <div className="flex flex-col text-[12px] text-gray-500 leading-tight pb-1">
                    <span>/ month</span>
                  </div>
                </div>

                <div className={`text-center py-2 rounded-lg font-medium text-[14px] border transition-colors mb-8 ${plan === 'free' || user?.db?.cancelAtPeriodEnd ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-default' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  {plan === 'free' ? 'Current Plan' : (user?.db?.cancelAtPeriodEnd ? 'Cancellation pending' : 'Downgrade')}
                </div>
                
                <div className="font-bold text-[13px] text-gray-900 mb-4">Includes</div>
                <ul className="text-[14px] text-gray-700 space-y-3">
                  <li className="flex items-start gap-2.5">
                    <svg className="w-3.5 h-3.5 text-gray-800 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> 
                    <span>limited monthly AI usage</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="w-3.5 h-3.5 text-gray-800 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> 
                    <span>Basic email summarization</span>
                  </li>
                </ul>
              </div>
              
              {/* Pro Plan */}
              <div 
                className={`relative bg-white rounded-2xl border p-7 shadow-sm transition-all duration-300 ${plan === 'pro' ? 'border-gray-300 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer'}`} 
                onClick={() => {
                  if (plan === 'pro') return;
                  router.push(`/checkout?billingCycle=${billingCycle}`);
                }}
              >
                <div className="relative z-20">
                  <div className="font-bold text-2xl text-gray-900 mb-1">Vela Pro</div>
                  <div className="text-[13px] text-gray-500 mb-6">For power users.</div>
                  
                  <div className="flex items-end gap-2 mb-6">
                    <div className="text-5xl font-bold text-gray-900">${billingCycle === 'annual' ? '6' : '8'}</div>
                    <div className="flex flex-col text-[12px] text-gray-500 leading-tight pb-1">
                      <span>/ month</span>
                      <span>{billingCycle === 'annual' ? 'billed annually' : 'billed monthly'}</span>
                    </div>
                  </div>
                  
                  <div className={`text-center py-2 rounded-lg font-medium text-[14px] border transition-colors mb-8 ${plan === 'pro' ? (user?.db?.cancelAtPeriodEnd ? 'bg-red-50 text-red-600 border-red-200 cursor-default' : 'bg-gray-50 text-gray-400 border-gray-200 cursor-default') : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                    {plan === 'pro' 
                      ? (user?.db?.cancelAtPeriodEnd 
                          ? `Subscription ending on ${new Date(user?.db?.currentPeriodEnd).toLocaleDateString()}` 
                          : 'Current Plan') 
                      : 'Upgrade to Pro'}
                  </div>
                  
                  <div className="font-bold text-[13px] text-gray-900 mb-4">Everything in Free, plus</div>
                  <ul className="text-[14px] text-gray-700 space-y-3">
                    <li className="flex items-start gap-2.5">
                      <svg className="w-3.5 h-3.5 text-gray-800 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> 
                      <span>Up to 60x more usage than free</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <svg className="w-3.5 h-3.5 text-gray-800 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> 
                      <span>AI in composer</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <svg className="w-3.5 h-3.5 text-gray-800 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> 
                      <span>Connect up to 2 additional accounts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {plan === 'pro' && (
              <div className="mt-8 pt-8 border-t border-[#dddcdc]/60 flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-medium text-[#2b323b] mb-1">Billing & Invoices</h3>
                  <p className="text-[13px] text-gray-500">Manage your payment methods and billing history via Stripe.</p>
                </div>
                <button 
                  onClick={openStripePortal}
                  className="px-5 py-2.5 bg-white border border-[#dddcdc]/60 shadow-sm rounded-lg text-[13px] font-medium text-[#2b323b] hover:bg-gray-50 transition"
                >
                  Manage billing
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'usage' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-medium text-[#2b323b] mb-8">AI Usage</h1>
            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Current period usage</h2>
            <div className="bg-[#eceae6] rounded-xl border border-[#dddcdc]/60 p-6 mb-10 shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-3xl font-semibold text-[#2b323b]">{Math.round((usageStatus.current / usageStatus.limit) * 100)}% <span className="text-lg font-normal text-gray-500">used</span></div>
                  <div className="text-[13px] text-gray-600 mt-1">
                    {usageStatus.plan === 'pro' 
                      ? 'Your Pro plan gives you up to 60x more usage.' 
                      : 'Your free plan offers limited AI runs per month. Upgrade to Pro for up to 60x more usage.'}
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

        {tab === 'privacy' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-medium text-[#2b323b] mb-4">Privacy & Data</h1>
            
            <div className="flex gap-4 mb-8 text-[14px]">
              <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</Link>
              <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</Link>
            </div>
            
            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Account data</h2>
            <div className="bg-[#eceae6] rounded-xl border border-[#dddcdc]/60 p-6 mb-10 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-medium text-[#2b323b] mb-1 flex items-center gap-2">
                  User ID
                  <div className="relative group flex items-center">
                    <Question size={16} className="text-gray-400 hover:text-gray-600 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-[12px] leading-tight rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-lg">
                      This ID is used to provide support. Do not share it publicly as it contains confidential information.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                <div className="text-[13px] text-gray-500 max-w-sm">Unique identifier for your Vela account.</div>
              </div>
              <button 
                onClick={handleCopyId}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-[13px] font-medium shadow-sm transition"
              >
                {copiedId ? "Copied!" : "Copy ID"}
              </button>
            </div>

            <h2 className="text-[15px] font-medium text-gray-800 mb-3">Local data</h2>
            <div className="bg-[#eceae6] rounded-xl border border-[#dddcdc]/60 p-6 mb-10 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-medium text-[#2b323b] mb-1">Clear local cache</div>
                <div className="text-[13px] text-gray-500 max-w-sm">This will clear your local IndexedDB cache, which stores downloaded emails for offline access. You will be signed out.</div>
              </div>
              <button 
                onClick={handleClearLocalData}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-[13px] font-medium shadow-sm transition"
              >
                Clear data
              </button>
            </div>

            <h2 className="text-[15px] font-medium text-red-600 mb-3">Danger zone</h2>
            <div className="bg-red-50 rounded-xl border border-red-200 p-6 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-medium text-red-700 mb-1">Delete account</div>
                <div className="text-[13px] text-red-600/80 max-w-sm">Permanently delete your Vela account and all associated data. Any active subscriptions will be automatically canceled.</div>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-[13px] font-medium shadow-sm transition"
              >
                Delete account
              </button>
            </div>
          </div>
        )}

        {tab === 'support' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-medium text-[#2b323b] mb-8">Need help?</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="https://tally.so/r/A702L0" target="_blank" className="bg-[#eceae6] border border-[#dddcdc]/60 rounded-xl p-6 hover:bg-[#dddcdc]/50 transition-colors group flex flex-col items-start text-left shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <WarningOctagon size={20} weight="fill" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#2b323b] mb-1">Report a Bug</h3>
                <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">Spotted something weird? Let us know so we can fix it.</p>
                <div className="text-blue-600 font-medium text-[13px] group-hover:translate-x-1 transition-transform flex items-center gap-1.5 mt-auto">
                  File bug report <ArrowRight size={12} weight="bold" />
                </div>
              </Link>
              
              <Link href="https://tally.so/r/RGgMRp" target="_blank" className="bg-[#eceae6] border border-[#dddcdc]/60 rounded-xl p-6 hover:bg-[#dddcdc]/50 transition-colors group flex flex-col items-start text-left shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <ChatCircle size={20} weight="fill" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#2b323b] mb-1">Customer Support</h3>
                <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">Need help with your account or have a question? We're here.</p>
                <div className="text-blue-600 font-medium text-[13px] group-hover:translate-x-1 transition-transform flex items-center gap-1.5 mt-auto">
                  Get support <ArrowRight size={12} weight="bold" />
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
