import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  features: string[];
  buttonText: string;
  icon: React.ReactNode;
  buttonVariant: 'default' | 'secondary';
}

interface RoleSelectorProps {
  roles: Role[];
  onRoleSelect: (role: Role) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ roles, onRoleSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Your Role</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  {role.icon}
                </div>
              </div>
              
              <h4 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                {role.name}
              </h4>
              
              <p className="text-gray-600 text-center mb-4">
                {role.description}
              </p>
              
              <ul className="space-y-2 mb-6">
                {role.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => onRoleSelect(role)}
                variant={role.buttonVariant}
                className="w-full"
              >
                {role.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;
