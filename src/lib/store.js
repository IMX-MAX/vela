import { create } from 'zustand';
import { account } from './appwrite';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  isAiSidebarOpen: false,
  aiSidebarWidth: 320,
  chatHistory: [],
  savedChats: [],
  inboxEmails: [],
  googleProfile: null,
  setGoogleProfile: (profile) => set({ googleProfile: profile }),
  setInboxEmails: (emails) => set({ inboxEmails: emails }),
  setAiSidebarWidth: (width) => set({ aiSidebarWidth: width }),
  toggleAiSidebar: () => set((state) => ({ isAiSidebarOpen: !state.isAiSidebarOpen })),
  addChatMessage: (message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  setChatHistory: (history) => set({ chatHistory: history }),
  saveCurrentChat: () => set((state) => {
    if (state.chatHistory.length === 0) return state;
    const newChat = { id: Date.now(), title: state.chatHistory[0].content.substring(0, 30) + '...', messages: [...state.chatHistory] };
    return { savedChats: [newChat, ...state.savedChats], chatHistory: [] };
  }),
  clearChat: () => set({ chatHistory: [] }),
  loadChat: (id) => set((state) => {
    const chat = state.savedChats.find(c => c.id === id);
    return chat ? { chatHistory: chat.messages } : state;
  }),
  checkAuth: async () => {
    try {
      const user = await account.get();
      const session = await account.getSession('current');
      set({ user, session, loading: false });
    } catch (error) {
      set({ user: null, session: null, loading: false });
    }
  },
  loginWithEmail: async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      const session = await account.getSession('current');
      set({ user, session });
      return { success: true };
    } catch (error) {
      console.error('Email login error', error);
      return { success: false, error: error.message };
    }
  },
  registerWithEmail: async (email, password, name) => {
    try {
      import('appwrite').then(async ({ ID }) => {
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
        const user = await account.get();
        const session = await account.getSession('current');
        set({ user, session });
      });
      return { success: true };
    } catch (error) {
      console.error('Registration error', error);
      return { success: false, error: error.message };
    }
  },
  loginWithGoogle: () => {
    account.createOAuth2Session(
      'google',
      `${window.location.origin}/inbox`,
      `${window.location.origin}/login`,
      [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid',
        'https://www.googleapis.com/auth/gmail.drafts.create',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.drafts.readonly'
      ]
    );
  },
  logout: async () => {
    try {
      await account.deleteSession('current');
      set({ user: null, session: null });
    } catch (error) {
      console.error('Logout error', error);
    }
  }
}));
