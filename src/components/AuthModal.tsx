import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, ArrowLeft } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loginStep, setLoginStep] = useState<'role' | 'credentials'>('role');
  const [signupStep, setSignupStep] = useState<'role' | 'credentials'>('role');
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'apartment_manager' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    onOpenChange(false);
    toast({
      title: "Welcome to PrimeLiving!",
      description: user ? `Welcome back, ${user.user_metadata?.name || user.email?.split('@')[0] || 'User'}!` : "Account created successfully!",
    });
  };

  const handleSwitchToSignup = () => {
    setActiveTab('signup');
  };

  const handleSwitchToLogin = () => {
    setActiveTab('login');
  };


  const handleRoleSelect = (role: 'tenant' | 'apartment_manager') => {
    setSelectedRole(role);
    if (activeTab === 'login') {
      setLoginStep('credentials');
    } else if (activeTab === 'signup') {
      setSignupStep('credentials');
    }
  };

  const handleBackToRole = () => {
    if (activeTab === 'login') {
      setLoginStep('role');
    } else if (activeTab === 'signup') {
      setSignupStep('role');
    }
    setSelectedRole(null);
  };

  const handleLoginSuccess = () => {
    onOpenChange(false);
    setLoginStep('role');
    setSelectedRole(null);
    
    // Get user's actual role from metadata (not UI selection)
    const userRole = user?.user_metadata?.role;
    const uiRole = user?.user_metadata?.uiRole;
    
    // Redirect based on actual user role from metadata
    if (uiRole === 'super_admin' || userRole === 'super_admin') {
      navigate('/super-admin-dashboard');
      toast({
        title: "Welcome to PrimeLiving!",
        description: "Redirecting to your super admin dashboard...",
      });
    } else if (selectedRole === 'apartment_manager' || uiRole === 'apartment_manager' || userRole === 'apartment_manager') {
      navigate('/apartment-manager-dashboard');
      toast({
        title: "Welcome to PrimeLiving!",
        description: "Redirecting to your apartment manager dashboard...",
      });
    } else if (selectedRole === 'tenant' || uiRole === 'tenant' || userRole === 'tenant') {
      navigate('/tenant-dashboard');
      toast({
        title: "Welcome to PrimeLiving!",
        description: "Redirecting to your tenant dashboard...",
      });
    } else {
      // Fallback: try to redirect based on metadata role
      if (userRole === 'apartment_manager' || uiRole === 'apartment_manager') {
        navigate('/apartment-manager-dashboard');
      } else {
        navigate('/tenant-dashboard');
      }
      toast({
        title: "Welcome to PrimeLiving!",
        description: `Welcome back, ${user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!`,
      });
    }
  };

  const handleSignupSuccess = () => {
    onOpenChange(false);
    setSignupStep('role');
    setSelectedRole(null);
    
    // Redirect to email confirmation page
    navigate('/email-confirmation');
    toast({
      title: "Account Created!",
      description: "Please check your email to confirm your account.",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold">
              {activeTab === 'login' ? 'Welcome Back' : 
               activeTab === 'signup' ? 'Join PrimeLiving' : 'Portal Access'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'login' 
                ? 'Sign in to access your account and find your perfect home'
                : activeTab === 'signup'
                ? 'Create your account to start your apartment search'
                : 'Access your branch portal with role-based features'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-6">
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
                    onSwitchToSignup={handleSwitchToSignup}
                    selectedRole={selectedRole}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              {signupStep === 'role' ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Choose Your Role
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Select your role to create your account
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
                        Create {selectedRole === 'tenant' ? 'Tenant' : 'Apartment Manager'} Account
                      </h3>
                      <p className="text-sm text-gray-600">Fill in your details to get started</p>
                    </div>
                  </div>
                  
                  <SignupForm 
                    onSuccess={handleSignupSuccess}
                    onSwitchToLogin={handleSwitchToLogin}
                    selectedRole={selectedRole}
                  />
                </div>
              )}
            </TabsContent>

            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default AuthModal;
