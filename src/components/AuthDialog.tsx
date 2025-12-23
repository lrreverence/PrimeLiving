import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoginForm from './LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAuthSuccess = () => {
    onOpenChange(false);
    toast({
      title: "Welcome to PrimeLiving!",
      description: user ? `Welcome back, ${user.user_metadata?.name || user.email?.split('@')[0] || 'User'}!` : "Logged in successfully!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to access your account and find your perfect home
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="mt-6">
            <LoginForm 
              onSuccess={handleAuthSuccess}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
