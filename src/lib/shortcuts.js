import { useAuthStore } from "./store";
import { useEffect, useState } from "react";

export const defaultShortcuts = {
  commandPalette: 'ctrl+k',
  compose: 'c',
  reply: 'r',
  replyAll: 'enter',
  archive: 'e',
  unread: 'u',
  trash: 'backspace'
};

export const formatShortcut = (e) => {
  const keys = [];
  if (e.ctrlKey || e.metaKey) keys.push('ctrl'); // Simplify to just ctrl for cross-platform
  if (e.shiftKey) keys.push('shift');
  if (e.altKey) keys.push('alt');
  
  const key = e.key === ' ' ? 'space' : e.key.toLowerCase();
  if (!['control', 'meta', 'shift', 'alt'].includes(key)) {
    keys.push(key);
  } else if (keys.length > 0) {
      return keys.join('+') + '+...';
  }
  
  return keys.join('+');
};

export const checkShortcut = (e, shortcutString) => {
  if (!shortcutString) return false;
  const parts = shortcutString.toLowerCase().split('+');
  const key = parts.pop();
  
  const requiresCtrl = parts.includes('ctrl') || parts.includes('cmd') || parts.includes('meta');
  const requiresShift = parts.includes('shift');
  const requiresAlt = parts.includes('alt');

  const hasCtrl = e.ctrlKey || e.metaKey;
  const eKey = e.key === ' ' ? 'space' : e.key.toLowerCase();

  if (['control', 'meta', 'shift', 'alt'].includes(eKey)) return false;

  return (
    hasCtrl === requiresCtrl &&
    e.shiftKey === requiresShift &&
    e.altKey === requiresAlt &&
    eKey === key
  );
};

export const useShortcuts = () => {
  const { user } = useAuthStore();
  const [shortcuts, setShortcuts] = useState(defaultShortcuts);

  useEffect(() => {
    if (user?.prefs?.shortcuts) {
      try {
        setShortcuts({ ...defaultShortcuts, ...JSON.parse(user.prefs.shortcuts) });
      } catch (e) {
        setShortcuts(defaultShortcuts);
      }
    } else {
        setShortcuts(defaultShortcuts);
    }
  }, [user]);

  return shortcuts;
};
