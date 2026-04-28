import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    // 1. Initial check for existing session
    const initAuth = async () => {
      console.log('🔄 [Auth] Initializing session...');
      
      // Failsafe timeout: if auth takes > 5s, stop loading so we don't stay blank
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('⚠️ [Auth] Initialization timed out. Forcing loading to false.');
          setLoading(false);
        }
      }, 5000);

      try {
        // 0. Check for Guest Mode bypass
        const guestAccess = localStorage.getItem('chainsight_guest_access');
        if (guestAccess === 'true') {
          console.log('🛡️ [Auth] Guest Access enabled.');
          setIsAuthenticated(true);
          setUser({ id: 'guest', email: 'guest@chainsight.demo' } as any);
          setLoading(false);
          return;
        }

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [Auth] Session retrieval error:', error);
          setSession(null);
          setIsAuthenticated(false);
        } else {
          console.log('✅ [Auth] Session retrieved:', currentSession ? 'Active' : 'None');
          setSession(currentSession);
          setIsAuthenticated(!!currentSession);
        }
      } catch (error) {
        console.error('❌ [Auth] Initialization exception:', error);
        setSession(null);
        setIsAuthenticated(false);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        console.log('🏁 [Auth] Initialization finished.');
      }
    };

    initAuth();

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (mounted) {
          console.log(`🔑 Auth State Change: ${_event}`);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      }
    );

    // 3. Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: isAuthenticated || !!session,
  };
};

export default useAuth;
