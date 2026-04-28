import { supabase } from './supabase';

/**
 * Signs in a user with their email and password.
 */
export const signInWithEmail = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

/**
 * Initiates the Google OAuth sign-in flow.
 */
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { 
      redirectTo: window.location.origin + '/auth/callback',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  });

/**
 * Signs out the current user.
 */
export const signOut = () => supabase.auth.signOut();

/**
 * Retrieves the current user from the session.
 */
export const getCurrentUser = () => supabase.auth.getUser();

/**
 * Retrieves the current session, if any.
 */
export const getSession = () => supabase.auth.getSession();
