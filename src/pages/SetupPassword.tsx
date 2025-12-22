import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const SetupPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSettingUp, setIsSettingUp] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    // Also check query params (some Supabase links use query params)
    const queryAccessToken = searchParams.get('access_token');
    const queryType = searchParams.get('type');

    const token = accessToken || queryAccessToken;
    const tokenType = type || queryType;

    if (!token || tokenType !== 'invite') {
      setError('Invalid or missing invitation link. Please contact your administrator.');
      setIsSettingUp(false);
    } else {
      setIsSettingUp(false);
    }
  }, [searchParams]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (!password || !confirmPassword) {
      setError('Please enter both password fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // Get tokens from URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const queryAccessToken = searchParams.get('access_token');
      const queryRefreshToken = searchParams.get('refresh_token');

      const token = accessToken || queryAccessToken;
      const refresh = refreshToken || queryRefreshToken;

      if (!token) {
        throw new Error('Invalid invitation link. Missing access token.');
      }

      // Set the session with the invitation token
      if (token && refresh) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: refresh
        });

        if (sessionError) {
          throw sessionError;
        }
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      // Get the user to determine their role
      const { data: { user } } = await supabase.auth.getUser();
      
      toast({
        title: "Password Set Successfully",
        description: "Your password has been set. Redirecting to your dashboard...",
      });

      // Redirect based on user role
      const userRole = user?.user_metadata?.role || user?.user_metadata?.uiRole;
      
      setTimeout(() => {
        if (userRole === 'apartment_manager') {
          navigate('/apartment-manager-dashboard');
        } else if (userRole === 'super_admin') {
          navigate('/super-admin-dashboard');
        } else {
          navigate('/tenant-dashboard');
        }
      }, 1500);

    } catch (error: any) {
      console.error('Error setting password:', error);
      setError(error.message || 'Failed to set password. Please try again or contact support.');
      setIsLoading(false);
    }
  };

  if (isSettingUp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <CardTitle>Setting Up Your Account</CardTitle>
            <CardDescription>
              Please wait...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error && !password) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Invalid Invitation Link</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-purple-600" />
          </div>
          <CardTitle>Set Up Your Password</CardTitle>
          <CardDescription>
            Welcome to Prime Living! Please set a password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Password *</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password (min. 6 characters)"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password *</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Setting Password...' : 'Set Password'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Password must be at least 6 characters long.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupPassword;

