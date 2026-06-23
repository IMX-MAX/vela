import { create } from 'zustand';
import { account } from './appwrite';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  isCommandPaletteOpen: false,
  chatHistory: [],
  currentChatId: null,
  savedChats: [],
  inboxEmails: [],
  googleProfile: null,
  setGoogleProfile: (profile) => set({ googleProfile: profile }),
  setInboxEmails: (emails) => set({ inboxEmails: emails }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  addChatMessage: (message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  setChatHistory: (history) => set({ chatHistory: history }),
  clearChat: () => set({ chatHistory: [], currentChatId: null }),
  initSavedChats: async () => {
    const { get } = await import('idb-keyval');
    const chats = await get('savedChats');
    if (chats) set({ savedChats: chats });
  },
  saveCurrentChat: () => set((state) => {
    if (state.chatHistory.length === 0) return state;
    
    let newSavedChats;
    if (state.currentChatId) {
      // Update existing chat
      newSavedChats = state.savedChats.map(c => 
        c.id === state.currentChatId ? { ...c, messages: [...state.chatHistory] } : c
      );
    } else {
      // Create new chat
      const newChat = { id: Date.now(), title: state.chatHistory[0].content.substring(0, 30) + '...', messages: [...state.chatHistory] };
      newSavedChats = [newChat, ...state.savedChats];
    }
    
    import('idb-keyval').then(({ set: idbSet }) => idbSet('savedChats', newSavedChats));
    return { savedChats: newSavedChats, chatHistory: [], currentChatId: null };
  }),
  loadChat: (id) => set((state) => {
    const chat = state.savedChats.find(c => c.id === id);
    return chat ? { chatHistory: chat.messages, currentChatId: id } : state;
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
        'https://www.googleapis.com/auth/gmail.drafts.readonly',
        'https://www.googleapis.com/auth/contacts',
        'https://www.googleapis.com/auth/contacts.other.readonly'
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
