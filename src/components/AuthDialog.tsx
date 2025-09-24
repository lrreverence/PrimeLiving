import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAuthSuccess = () => {
    onOpenChange(false);
    toast({
      title: "Welcome to PrimeLiving!",
      description: user ? `Welcome back, ${user.name}!` : "Account created successfully!",
    });
  };

  const handleSwitchToSignup = () => {
    setActiveTab('signup');
  };

  const handleSwitchToLogin = () => {
    setActiveTab('login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {activeTab === 'login' ? 'Welcome Back' : 'Join PrimeLiving'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === 'login' 
              ? 'Sign in to access your account and find your perfect home'
              : 'Create your account to start your apartment search'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-6">
            <LoginForm 
              onSuccess={handleAuthSuccess}
              onSwitchToSignup={handleSwitchToSignup}
            />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6">
            <SignupForm 
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
