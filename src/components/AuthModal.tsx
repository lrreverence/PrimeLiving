import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, ArrowLeft } from 'lucide-react';
import LoginForm from './LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getUserRole } from '@/lib/userRole';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const [loginStep, setLoginStep] = useState<'role' | 'credentials'>('role');
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'apartment_manager' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();


  const handleRoleSelect = (role: 'tenant' | 'apartment_manager') => {
    setSelectedRole(role);
    setLoginStep('credentials');
  };

  const handleBackToRole = () => {
    setLoginStep('role');
    setSelectedRole(null);
  };

  const handleLoginSuccess = async () => {
    onOpenChange(false);
    setLoginStep('role');
    setSelectedRole(null);
    
    // Get user's actual role from database and metadata
    const actualRole = await getUserRole(user);
    
    // Redirect based on actual user role
    if (actualRole === 'super_admin') {
      navigate('/super-admin-dashboard');
      toast({
        title: "Welcome to PrimeLiving!",
        description: "Redirecting to your super admin dashboard...",
      });
    } else if (actualRole === 'apartment_manager' || selectedRole === 'apartment_manager') {
      navigate('/apartment-manager-dashboard');
      toast({
        title: "Welcome to PrimeLiving!",
        description: "Redirecting to your apartment manager dashboard...",
      });
    } else if (actualRole === 'tenant' || selectedRole === 'tenant') {
      navigate('/tenant-dashboard');
      toast({
        title: "Welcome to PrimeLiving!",
        description: "Redirecting to your tenant dashboard...",
      });
    } else {
      // Fallback: default to tenant dashboard
      navigate('/tenant-dashboard');
      toast({
        title: "Welcome to PrimeLiving!",
        description: `Welcome back, ${user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!`,
      });
    }
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold">
              Welcome Back
            </DialogTitle>
            <DialogDescription>
              Sign in to access your account and find your perfect home
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="mt-6">
              {loginStep === 'role' ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Choose Your Role
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Select your role to continue with sign in
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                      onClick={() => handleRoleSelect('tenant')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Tenant</h4>
                            <p className="text-sm text-gray-600">View contracts, payments, and maintenance requests</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                      onClick={() => handleRoleSelect('apartment_manager')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Apartment Manager</h4>
                            <p className="text-sm text-gray-600">Manage tenants, payments, and property maintenance</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToRole}
                      className="p-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Sign in as {selectedRole === 'tenant' ? 'Tenant' : 'Apartment Manager'}
                      </h3>
                      <p className="text-sm text-gray-600">Enter your credentials to continue</p>
                    </div>
                  </div>
                  
                  <LoginForm 
                    onSuccess={handleLoginSuccess}
                    selectedRole={selectedRole}
                  />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default AuthModal;
