"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { account } from "@/lib/appwrite";
import { defaultShortcuts, formatShortcut } from "@/lib/shortcuts";

export default function ShortcutsTab() {
  const { user, checkAuth, setShowUpgradeModal } = useAuthStore();
  const plan = user?.db?.subscriptionPlan || "free";
  
  const [shortcuts, setShortcuts] = useState(defaultShortcuts);
  const [recordingKey, setRecordingKey] = useState(null);

  useEffect(() => {
    if (user?.prefs?.shortcuts) {
      try {
        setShortcuts({ ...defaultShortcuts, ...JSON.parse(user.prefs.shortcuts) });
      } catch (e) {
        setShortcuts(defaultShortcuts);
      }
    }
  }, [user]);

  const handleSave = async (newShortcuts) => {
    try {
      await account.updatePrefs({
        ...user.prefs,
        shortcuts: JSON.stringify(newShortcuts)
      });
      await checkAuth();
    } catch (e) {
      console.error("Failed to save shortcuts", e);
    }
  };

  const handleReset = () => {
    if (plan !== 'pro') {
      setShowUpgradeModal(true);
      return;
    }
    setShortcuts(defaultShortcuts);
    handleSave(defaultShortcuts);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!recordingKey) return;
      e.preventDefault();
      e.stopPropagation();

      const keyName = e.key.toLowerCase();
      if (['control', 'meta', 'shift', 'alt'].includes(keyName)) {
        return; // Wait for a real key
      }

      const formatted = formatShortcut(e);
      const newShortcuts = { ...shortcuts, [recordingKey]: formatted };
      setShortcuts(newShortcuts);
      setRecordingKey(null);
      handleSave(newShortcuts);
    };

    if (recordingKey) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [recordingKey, shortcuts]);

  const handleStartRecording = (key) => {
    if (plan !== 'pro') {
      setShowUpgradeModal(true);
      return;
    }
    setRecordingKey(key);
  };

  const shortcutLabels = {
    commandPalette: "Open Command Palette",
    compose: "Compose New Email",
    reply: "Reply",
    replyAll: "Reply All",
    archive: "Archive (Done)",
    unread: "Mark Unread",
    trash: "Trash"
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-medium text-[#2b323b] mb-8">Keyboard Shortcuts</h1>
      
      <div className="bg-[#eceae6] rounded-xl border border-[#dddcdc]/60 p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 text-sm">Customize your keyboard shortcuts for a faster workflow.</p>
          <button 
            onClick={handleReset}
            className="text-[13px] font-medium text-gray-500 hover:text-[#2b323b] transition px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-200"
          >
            Reset Defaults
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {Object.keys(defaultShortcuts).map(key => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
              <div className="text-[14px] font-medium text-gray-800">{shortcutLabels[key]}</div>
              <button
                onClick={() => handleStartRecording(key)}
                className={`min-w-[100px] px-3 py-1.5 rounded-lg border text-[13px] font-medium transition ${recordingKey === key ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {recordingKey === key ? 'Press a key...' : (shortcuts[key] || defaultShortcuts[key]).replace(/\+/g, ' + ').toUpperCase()}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {plan !== 'pro' && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200/50 text-[13px]">
          <span className="font-semibold">Pro Feature:</span> Customizing keyboard shortcuts requires Vela Premium.
        </div>
      )}
    </div>
  );
}
