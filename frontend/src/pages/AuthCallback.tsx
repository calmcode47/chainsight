import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // We wait a brief moment for Supabase to process the URL fragment
        // then we check for the session.
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          console.log('✅ Session established, redirecting to dashboard...');
          navigate('/dashboard', { replace: true });
        } else {
          // If no session after a short wait, check if there's an error in the URL
          const params = new URLSearchParams(window.location.search);
          if (params.get('error')) {
            console.error('Auth error from URL:', params.get('error_description'));
            navigate('/login?error=' + params.get('error'), { replace: true });
          } else {
            // Fallback: wait a bit longer or just try to get user
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              navigate('/dashboard', { replace: true });
            } else {
              console.warn('No session or user found in callback');
              navigate('/login', { replace: true });
            }
          }
        }
      } catch (error) {
        console.error('OAuth callback exception:', error);
        navigate('/login?error=auth-failed', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <h2 className="text-xl font-semibold text-white">Completing sign in...</h2>
        <p className="text-slate-400">Securely finalizing your session</p>
      </div>
    </div>
  );
};

export default AuthCallback;
