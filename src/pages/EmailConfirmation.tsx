import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [userEmail, setUserEmail] = useState<string>('');
  const { user, resendConfirmation } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a confirmation redirect
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');
    
    if (accessToken && type === 'signup') {
      setIsConfirming(true);
      // Simulate confirmation process
      setTimeout(() => {
        setConfirmationStatus('success');
        setIsConfirming(false);
        
        // Redirect to tenant dashboard after 3 seconds
        setTimeout(() => {
          navigate('/tenant-dashboard');
        }, 3000);
      }, 2000);
    } else if (user?.email) {
      setUserEmail(user.email);
    }
  }, [searchParams, user, navigate]);

  const handleResendConfirmation = async () => {
    if (!userEmail) return;
    
    try {
      const result = await resendConfirmation(userEmail);
      if (result.success) {
        toast({
          title: "Confirmation Email Sent",
          description: "Please check your email and click the confirmation link.",
        });
      } else {
        toast({
          title: "Failed to Send Email",
          description: result.error || "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend confirmation email. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGoToDashboard = () => {
    navigate('/tenant-dashboard');
  };

  if (isConfirming) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Confirming Your Email</CardTitle>
            <CardDescription>
              Please wait while we confirm your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (confirmationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Email Confirmed!</CardTitle>
            <CardDescription>
              Your email has been successfully confirmed. Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to Dashboard
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
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userEmail && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Confirmation email sent to: <strong>{userEmail}</strong>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Please check your email and click the confirmation link to activate your account.
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={handleResendConfirmation}
                variant="outline" 
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Resend Confirmation Email
              </Button>
              
              <Button 
                onClick={handleGoToDashboard}
                variant="ghost" 
                className="w-full"
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
