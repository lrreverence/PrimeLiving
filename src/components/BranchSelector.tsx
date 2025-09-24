import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  location: string;
}

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: Branch | null;
  onBranchSelect: (branch: Branch) => void;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  branches,
  selectedBranch,
  onBranchSelect,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Your Branch</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <Card
            key={branch.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedBranch?.id === branch.id
                ? 'ring-2 ring-blue-600 border-blue-600'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onBranchSelect(branch)}
          >
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-3">
                <Building2 className="w-8 h-8 text-gray-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{branch.name}</h4>
              <p className="text-sm text-gray-600">{branch.location}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BranchSelector;
