// Auth Callback Page - Handles email link redirects from Supabase
// Exchanges code for session and redirects to appropriate page
// Following EMAIL_PASSWORD_SETUP_GUIDE.md

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code and type from URL query params
        const code = searchParams.get('code');
        const type = searchParams.get('type'); // 'recovery', 'invite', etc.

        if (!code) {
          // Check for hash-based tokens (fallback for older Supabase links)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const hashType = hashParams.get('type');

          if (accessToken && refreshToken) {
            // Handle hash-based tokens (direct redirect to setup-password)
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (sessionError) {
              throw sessionError;
            }

            // Redirect based on type
            if (hashType === 'invite' || hashType === 'signup') {
              navigate('/setup-password?type=invite');
            } else if (hashType === 'recovery') {
              navigate('/setup-password?type=recovery');
            } else {
              navigate('/setup-password');
            }
            return;
          }

          // No code or tokens found
          setError('Invalid or missing authentication code. Please use the link from your email.');
          setIsProcessing(false);
          return;
        }

        // Exchange code for session (code-based tokens)
        const { data: { user }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('Error exchanging code for session:', exchangeError);
          setError('Invalid or expired link. Please request a new invitation.');
          setIsProcessing(false);
          return;
        }

        if (!user) {
          setError('Failed to authenticate. Please try again.');
          setIsProcessing(false);
          return;
        }

        // Redirect based on type
        if (type === 'invite') {
          navigate('/setup-password?type=invite');
        } else if (type === 'recovery') {
          navigate('/setup-password?type=recovery');
        } else {
          // Default: redirect to setup-password
          navigate('/setup-password');
        }
      } catch (err: any) {
        console.error('Error in auth callback:', err);
        setError(err.message || 'An error occurred during authentication. Please try again.');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Processing Authentication</CardTitle>
            <CardDescription>
              Please wait while we verify your email link...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Authentication Error</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AuthCallback;

