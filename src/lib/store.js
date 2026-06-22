import { create } from 'zustand';
import { account } from './appwrite';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
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
