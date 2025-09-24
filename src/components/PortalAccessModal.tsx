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
import { X, Building2, Users } from 'lucide-react';
import BranchSelector from './BranchSelector';
import RoleSelector from './RoleSelector';
import { useToast } from '@/hooks/use-toast';

interface Branch {
  id: string;
  name: string;
  location: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  features: string[];
  buttonText: string;
  icon: React.ReactNode;
  buttonVariant: 'default' | 'secondary';
}

interface PortalAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PortalAccessModal: React.FC<PortalAccessModalProps> = ({ open, onOpenChange }) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [currentStep, setCurrentStep] = useState<'branch' | 'role'>('branch');
  const { toast } = useToast();
  const navigate = useNavigate();

  const branches: Branch[] = [
    {
      id: 'cainta',
      name: 'Cainta Rizal Branch',
      location: 'Cainta, Rizal',
    },
    {
      id: 'sampaloc',
      name: 'Sampaloc Manila Branch',
      location: 'Sampaloc, Manila',
    },
    {
      id: 'cubao',
      name: 'Cubao QC Branch',
      location: 'Cubao, Quezon City',
    },
  ];

  const roles: Role[] = [
    {
      id: 'caretaker',
      name: 'Caretaker Login',
      description: 'Manage tenants, payments, contracts, and property maintenance.',
      features: [
        'Tenant Management',
        'Payment Tracking',
        'Document Generation',
        'Maintenance Logs',
      ],
      buttonText: 'Continue as Caretaker',
      icon: <Building2 className="w-6 h-6 text-blue-600" />,
      buttonVariant: 'default',
    },
    {
      id: 'tenant',
      name: 'Tenant Login',
      description: 'View your profile, track payments, and submit maintenance requests.',
      features: [
        'View Contract Details',
        'Payment History',
        'QR Code Payments',
        'Maintenance Requests',
      ],
      buttonText: 'Continue as Tenant',
      icon: <Users className="w-6 h-6 text-green-600" />,
      buttonVariant: 'secondary',
    },
  ];

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setCurrentStep('role');
  };

  const handleRoleSelect = (role: Role) => {
    if (!selectedBranch) return;

    // Simulate portal access
    toast({
      title: "Portal Access Granted",
      description: `Welcome to ${selectedBranch.name} as ${role.name}`,
    });

    // Redirect based on role
    if (role.id === 'caretaker') {
      navigate('/caretaker-dashboard');
    } else if (role.id === 'tenant') {
      // TODO: Implement tenant dashboard
      console.log('Tenant dashboard not implemented yet');
    }
    
    onOpenChange(false);
    // Reset state
    setSelectedBranch(null);
    setCurrentStep('branch');
  };

  const handleBack = () => {
    setCurrentStep('branch');
    setSelectedBranch(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedBranch(null);
    setCurrentStep('branch');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Access Your Account
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Choose your role and branch to continue.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {currentStep === 'branch' && (
            <BranchSelector
              branches={branches}
              selectedBranch={selectedBranch}
              onBranchSelect={handleBranchSelect}
            />
          )}

          {currentStep === 'role' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Selected Branch: {selectedBranch?.name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedBranch?.location}</p>
                </div>
                <Button variant="outline" onClick={handleBack}>
                  Change Branch
                </Button>
              </div>
              
              <RoleSelector roles={roles} onRoleSelect={handleRoleSelect} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PortalAccessModal;
