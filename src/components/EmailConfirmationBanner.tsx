import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, RefreshCw } from 'lucide-react';

interface EmailConfirmationBannerProps {
  userEmail: string;
}

const EmailConfirmationBanner: React.FC<EmailConfirmationBannerProps> = ({ userEmail }) => {
  const [isResending, setIsResending] = useState(false);
  const { resendConfirmation } = useAuth();
  const { toast } = useToast();

  const handleResendConfirmation = async () => {
    setIsResending(true);
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
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <Mail className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <div>
            <strong>Email Confirmation Required</strong>
            <p className="text-sm mt-1">
              Please check your email ({userEmail}) and click the confirmation link to access your dashboard.
            </p>
          </div>
          <Button
            onClick={handleResendConfirmation}
            disabled={isResending}
            size="sm"
            variant="outline"
            className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Resend Email
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmailConfirmationBanner;
