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
  const [billingCycle, setBillingCycle] = useState("annual");
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

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
              router.push("/login");
            });
          });
        });
      } catch (error) {
        console.error("Failed to delete account", error);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  const handleClearLocalData = () => {
    if (confirm("Are you sure you want to clear your local data? You will be signed out and need to reconnect.")) {
      import('idb-keyval').then(({ clear }) => {
        clear().then(() => {
          useAuthStore.getState().logout().then(() => {
            router.push("/login");
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
          <div 
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${tab === 'privacy' ? 'bg-[#c7d4ce] text-[#2b323b]' : 'text-gray-600 hover:bg-[#c7d4ce]/50'}`} 
            onClick={() => setTab('privacy')}
          >
            Privacy
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
                className={`relative bg-white rounded-2xl border p-7 shadow-sm transition-all duration-300 ${plan === 'free' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer hover:-translate-y-1'}`} 
                onClick={() => handleSetPlan('free')}
              >
                <div className="font-semibold text-xl text-gray-900 mb-2">Free Plan</div>
                <div className="text-[14px] text-gray-500 mb-6">Perfect for casual use.</div>
                <div className="text-4xl font-bold text-gray-900 mb-6">$0 <span className="text-base font-normal text-gray-400">/mo</span></div>
                <ul className="text-[14px] text-gray-600 space-y-3 mb-8">
                  <li className="flex items-center gap-2"><svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 27 AI runs per month</li>
                  <li className="flex items-center gap-2"><svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Basic email summarization</li>
                </ul>
                <div className={`text-center py-2.5 rounded-xl font-medium text-[14px] transition-colors ${plan === 'free' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                  {plan === 'free' ? 'Current Plan' : 'Downgrade to Free'}
                </div>
              </div>
              
              {/* Pro Plan */}
              <div 
                className={`relative bg-white rounded-2xl border p-7 shadow-sm transition-all duration-300 ${plan === 'pro' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer hover:-translate-y-1'}`} 
                onClick={async () => {
                  if (plan === 'pro') return;
                  
                  try {
                    const { account } = await import('@/lib/appwrite');
                    const jwtResponse = await account.createJWT();
                    const res = await fetch('/api/stripe/checkout', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwtResponse.jwt}`
                      },
                      body: JSON.stringify({ billingCycle })
                    });
                    const data = await res.json();
                    
                    if (data.url) {
                      window.location.href = data.url;
                    } else if (data.error) {
                      alert('Checkout Error: ' + data.error);
                    }
                  } catch (error) {
                    console.error('Failed to create checkout session', error);
                  }
                }}
              >
                <div className="relative z-20 h-full flex flex-col">
                  {plan === 'pro' && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-[12px] uppercase tracking-wider">
                      Current Plan
                    </div>
                  )}
                  <div className="font-semibold text-xl text-gray-900 mb-2">Vela Pro</div>
                  <div className="text-[14px] text-gray-500 mb-6">For power users.</div>
                  <div className="text-4xl font-bold text-gray-900 mb-6">${billingCycle === 'annual' ? '6' : '8'} <span className="text-base font-normal text-gray-400">/mo</span></div>
                  <ul className="text-[14px] text-gray-600 space-y-3 mb-8 flex-grow">
                    <li className="font-medium text-gray-900 flex items-center gap-2"><svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Everything in Free, plus:</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Up to 60x more usage than free</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Advanced contextual replies</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Connect up to 2 additional accounts</li>
                  </ul>
                  <div className={`text-center py-2.5 rounded-xl font-medium text-[14px] transition-all ${plan === 'pro' ? 'bg-blue-50 text-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}>
                    {plan === 'pro' ? 'Active' : 'Upgrade to Pro'}
                  </div>
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
            <h1 className="text-2xl font-medium text-[#2b323b] mb-8">Privacy & Data</h1>
            
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
                <div className="text-[13px] text-red-600/80 max-w-sm">Permanently delete your Vela account and all associated data. Active subscriptions must be canceled first.</div>
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
      </div>
    </div>
  );
}
