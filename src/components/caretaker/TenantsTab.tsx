import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Eye, Trash2 } from 'lucide-react';

interface Tenant {
  id: number;
  name: string;
  email: string;
  unit: string;
  contact: string;
  monthlyRent: number;
  contractStart: string;
  contractEnd: string;
  status: string;
  balance: number;
}

interface TenantsTabProps {
  tenants: Tenant[];
  tenantsLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const TenantsTab = ({ tenants, tenantsLoading, searchTerm, onSearchChange }: TenantsTabProps) => {
  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tenant Management</h2>
          <p className="text-gray-600 mt-1">Manage tenant profiles, contracts, and unit assignments.</p>
        </div>
        <Button className="bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Tenant</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search tenants by name or unit..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Active Tenants Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Tenants</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Current tenant list and contract information.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Unit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Monthly Rent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contract Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Balance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenantsLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      Loading tenants...
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      {searchTerm ? 'No tenants found matching your search.' : 'No tenants found in your branch.'}
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          {tenant.unit}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{tenant.contact}</td>
                      <td className="py-4 px-4 font-medium">₱{tenant.monthlyRent.toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {tenant.contractStart !== 'N/A' && tenant.contractEnd !== 'N/A' 
                          ? `${tenant.contractStart} to ${tenant.contractEnd}`
                          : 'No contract'
                        }
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          className={
                            tenant.status === 'active' 
                              ? 'bg-gray-800 text-white' 
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {tenant.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className={tenant.balance === 0 ? 'text-green-600' : 'text-red-600'}>
                          ₱{tenant.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

