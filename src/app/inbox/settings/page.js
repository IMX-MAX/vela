"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { account } from "@/lib/appwrite";
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [jobName, setJobName] = useState("");
  const [company, setCompany] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.prefs) {
      setJobName(user.prefs.jobName || "");
      setCompany(user.prefs.company || "");
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await account.updatePrefs({
        ...user.prefs,
        jobName,
        company
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Refresh user context in store
      useAuthStore.getState().checkAuth();
    } catch (error) {
      console.error("Failed to save prefs:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#eeeae6] rounded-2xl relative overflow-y-auto">
      {/* Top Bar */}
      <div className="h-14 border-b border-[#e4e3e0] flex items-center px-4 sticky top-0 bg-[#eeeae6]/90 backdrop-blur-sm z-10 rounded-t-2xl">
        <button 
          onClick={() => router.back()} 
          className="p-2 text-gray-500 hover:text-gray-900 transition rounded-md hover:bg-black/5"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="ml-2 font-medium text-gray-900">Settings</div>
      </div>

      <div className="max-w-2xl w-full px-8 py-12 mx-auto">
        <h1 className="text-2xl font-medium text-gray-900 mb-8">Personalization</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
            Provide some context about yourself. Vela's AI will use this information to personalize your email drafts and summaries.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">Job Title</label>
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition text-[14px]"
              />
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition text-[14px]"
              />
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gray-900 hover:bg-black transition text-white px-6 py-2 rounded-lg text-[13px] font-medium disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              
              {saved && (
                <div className="flex items-center gap-2 text-green-600 text-[13px] font-medium animate-fade-in-up">
                  <CheckCircle size={16} weight="fill" /> Saved
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
